import { supabase } from "../config/supabase";
import { geminiService } from "./gemini.service";

export const storyService = {
  async getAllByUser(userId: string) {
    const { data, error } = await supabase
      .from("stories")
      .select("*, quiz_answers(count), chat_messages(count)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return data.map((s: any) => {
      // Parse sentences if string (though supabase js client usually handles jsonb)
      const sentences =
        typeof s.sentences === "string" ? JSON.parse(s.sentences) : s.sentences;
      // Construct content
      const content = Array.isArray(sentences)
        ? sentences.map((sent: any) => sent.text).join(" ")
        : s.summary || "";

      return {
        id: s.id,
        title: s.title,
        summary: s.summary,
        content: content, // Required by frontend
        level: s.level,
        domain: s.domain,
        completed: s.is_completed, // Map snake_case to camelCase
        dateCreated: s.created_at, // Map snake_case to camelCase
        quizAnswersCount: s.quiz_answers?.[0]?.count || 0,
        chatMessagesCount: s.chat_messages?.[0]?.count || 0,
      };
    });
  },

  async getById(id: string, userId: string) {
    // Join with quiz_answers and chat_messages
    const { data, error } = await supabase
      .from("stories")
      .select(
        `
        *,
        chat_messages (
          id, sender, message, created_at
        )
      `,
      )
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !data) throw new Error("Story not found");

    // Order chat messages manually since simple join order might not be guaranteed
    const chatMessages = (data.chat_messages || []).sort(
      (a: any, b: any) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    const sentences =
      typeof data.sentences === "string"
        ? JSON.parse(data.sentences)
        : data.sentences;

    const content = Array.isArray(sentences)
      ? sentences.map((s: any) => s.text).join(" ")
      : "";

    return {
      id: data.id,
      title: data.title,
      summary: data.summary,
      content: content, // Required by frontend
      sentences: sentences,
      quiz: typeof data.quiz === "string" ? JSON.parse(data.quiz) : data.quiz,
      level: data.level,
      domain: data.domain,
      completed: data.is_completed, // Map snake_case to camelCase
      dateCreated: data.created_at, // Map snake_case to camelCase
      chatMessages: chatMessages.map((m: any) => ({
        id: m.id,
        sender: m.sender,
        message: m.message,
        createdAt: m.created_at,
      })),
    };
  },

  async initializeLevelRoadmap(userId: string, level: string, domain: string) {
    const roadmap = await geminiService.generateLevelRoadmap(level, domain);
    const toInsert = roadmap.map((item, index) => ({
      user_id: userId,
      level,
      domain,
      story_order: index + 1,
      title: item.title,
      concept: item.concept,
    }));
    const { data, error } = await supabase
      .from("planned_stories")
      .insert(toInsert)
      .select();
    if (error) throw new Error(error.message);
    return data;
  },

  async getNextPlannedStory(userId: string, level: string, domain: string) {
    const { data, error } = await supabase
      .from("planned_stories")
      .select("*")
      .eq("user_id", userId)
      .eq("level", level)
      .eq("domain", domain)
      .eq("is_completed", false)
      .order("story_order", { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw new Error(error.message);
    return data || null;
  },

  async generate(userId: string, domain: string) {
    // Get user profile
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("current_level")
      .eq("id", userId)
      .single();

    if (userError || !user) throw new Error("User not found");
    const level = user.current_level;

    let nextStory = await storyService.getNextPlannedStory(
      userId,
      level,
      domain,
    );

    if (!nextStory) {
      const { count } = await supabase
        .from("planned_stories")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("level", level)
        .eq("domain", domain);

      if (count === 0) {
        await storyService.initializeLevelRoadmap(userId, level, domain);
        nextStory = await storyService.getNextPlannedStory(
          userId,
          level,
          domain,
        );
      } else {
        throw new Error("Level completed. Please proceed to the next level.");
      }
    }

    if (!nextStory) throw new Error("Failed to determine next story.");

    // Get learning words
    const { data: learningWords } = await supabase
      .from("vocabulary_learning")
      .select("word")
      .eq("user_id", userId)
      .limit(20);

    const learningWordList = (learningWords || []).map((v: any) => v.word);

    // Get known words
    const { data: knownWords } = await supabase
      .from("vocabulary_known")
      .select("word")
      .eq("user_id", userId)
      .limit(50);

    const knownWordList = (knownWords || []).map((v: any) => v.word);

    // Generate story using Gemini
    const storyData = await geminiService.generateStory(
      level,
      domain,
      nextStory.title,
      nextStory.concept,
      learningWordList,
      knownWordList,
    );

    // Save story
    const { data: story, error: saveError } = await supabase
      .from("stories")
      .insert({
        user_id: userId,
        title: storyData.title,
        summary: storyData.summary || "",
        sentences: storyData.sentences,
        quiz: storyData.questions || [],
        level: level,
        domain: domain,
        is_completed: false,
      })
      .select()
      .single();

    if (saveError) throw new Error(saveError.message);

    // Update planned_story to link to generated story
    await supabase
      .from("planned_stories")
      .update({ story_id: story.id })
      .eq("id", nextStory.id);

    return story;
  },

  async submitQuizAnswers(
    storyId: string,
    userId: string,
    answers: Array<{
      question_index: number;
      isCorrect: boolean;
    }>,
  ) {
    // Verify story
    const { data: story } = await supabase
      .from("stories")
      .select("id")
      .eq("id", storyId)
      .eq("user_id", userId)
      .single();

    if (!story) throw new Error("Story not found");

    // Insert answers
    const toInsert = answers.map((a) => ({
      user_id: userId,
      story_id: storyId,
      question_index: a.question_index, // Ensure frontend sends index
      is_correct: a.isCorrect,
    }));

    const { data: saved, error } = await supabase
      .from("quiz_answers")
      .upsert(toInsert, { onConflict: "user_id, story_id, question_index" })
      .select();

    if (error) throw new Error(error.message);

    // Mark completed if all correct?? Or just if submitted?
    // We'll just mark it completed.
    await supabase
      .from("stories")
      .update({ is_completed: true })
      .eq("id", storyId);

    await supabase
      .from("planned_stories")
      .update({ is_completed: true })
      .eq("story_id", storyId);

    return saved;
  },

  async sendChatMessage(storyId: string, userId: string, message: string) {
    // 1. Get story & history
    const { data: story } = await supabase
      .from("stories")
      .select("sentences, level") // No content column
      .eq("id", storyId)
      .eq("user_id", userId)
      .single();

    if (!story) throw new Error("Story not found");

    // Get history
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("sender, message")
      .eq("story_id", storyId)
      .order("created_at", { ascending: true })
      .limit(20); // Might want relevant ones

    // Save user message
    await supabase.from("chat_messages").insert({
      story_id: storyId,
      user_id: userId,
      sender: "user",
      message: message,
    });

    // Generate AI response
    // Construct text
    const fullText = Array.isArray(story.sentences)
      ? story.sentences.map((s: any) => s.text).join(" ")
      : "";

    const history = (messages || []).map((m: any) => ({
      role: m.sender,
      content: m.message,
    }));

    const aiResponse = await geminiService.chatAboutStory(
      fullText,
      message,
      history,
      story.level || "A0",
    );

    // Save AI response
    const { data: aiMsg, error } = await supabase
      .from("chat_messages")
      .insert({
        story_id: storyId,
        user_id: userId,
        sender: "ai",
        message: aiResponse,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: aiMsg.id,
      sender: aiMsg.sender,
      message: aiMsg.message,
      createdAt: aiMsg.created_at,
    };
  },

  async translate(text: string) {
    // Use GTX just like Project 1?
    // "Crucially, AI is NOT used for word translation... Google GTX API is mandated"
    // But server runs in Node. axios call to GTX.
    const axios = require("axios");
    try {
      const res = await axios.get(
        `https://translate.googleapis.com/translate_a/single`,
        {
          params: {
            client: "gtx",
            sl: "auto",
            tl: "ar",
            dt: "t",
            q: text,
          },
        },
      );
      return res.data[0][0][0];
    } catch (e) {
      console.error("Translation error", e);
      return null;
    }
  },
};
