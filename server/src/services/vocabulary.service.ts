import { supabase } from "../config/supabase";
import { geminiService } from "./gemini.service";

// Skills Map for vocabulary_learning
const skillFieldMap = {
  reading: "skill_reading",
  listening: "skill_listening",
  writing: "skill_writing",
  speaking: "skill_speaking",
  // identification: "skill_vocabulary", // Removed
  // grammar: "skill_grammar" // Removed
};

type SkillName = keyof typeof skillFieldMap;

export const vocabularyService = {
  async getLearning(userId: string) {
    const { data } = await supabase
      .from("vocabulary_learning")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return data || [];
  },

  async getKnown(userId: string) {
    const { data } = await supabase
      .from("vocabulary_known")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return data || [];
  },

  async getStats(userId: string) {
    const { count: learning } = await supabase
      .from("vocabulary_learning")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const { count: known } = await supabase
      .from("vocabulary_known")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const { data: user } = await supabase
      .from("users")
      .select("current_level, total_learned_words")
      .eq("id", userId)
      .single();

    const totalLearned = user?.total_learned_words || 0;

    return {
      learning: learning || 0,
      known: known || 0,
      total: (learning || 0) + (known || 0),
      currentLevel: user?.current_level || "A0",
      totalLearnedWords: totalLearned,
      wordsToNextLevel: 1000 - (totalLearned % 1000),
    };
  },

  async addWord(
    userId: string,
    word: string,
    translation: string,
    level: string,
    domain: string,
    masteryStatus: string = "learning",
  ) {
    // Check if exists in Known
    const { data: existingKnown } = await supabase
      .from("vocabulary_known")
      .select("id")
      .eq("user_id", userId)
      .eq("word", word)
      .single();

    if (existingKnown) return { status: "already_known" };

    // Check if exists in Learning
    const { data: existingLearning } = await supabase
      .from("vocabulary_learning")
      .select("id")
      .eq("user_id", userId)
      .eq("word", word)
      .single();

    if (existingLearning) return { status: "already_learning" };

    if (masteryStatus === "known") {
      const { data, error } = await supabase
        .from("vocabulary_known")
        .insert({
          user_id: userId,
          word,
          translation,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    } else {
      const { data, error } = await supabase
        .from("vocabulary_learning")
        .insert({
          user_id: userId,
          word,
          translation,
          mastery_level: 0,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    }
  },

  async addWordsFromStory(
    userId: string,
    words: Array<{ word: string; translation: string }>,
    level: string,
    domain: string,
  ) {
    const results = [];
    for (const w of words) {
      try {
        const res = await this.addWord(
          userId,
          w.word,
          w.translation,
          level,
          domain,
        );
        if (res && !("status" in res)) results.push(res);
      } catch (e) {
        console.error(`Failed to add word ${w.word}`, e);
      }
    }
    return results;
  },

  async getPracticeSession(userId: string) {
    // Get 30 words from vocabulary_learning
    const { data } = await supabase
      .from("vocabulary_learning")
      .select("*")
      .eq("user_id", userId)
      .order("mastery_level", { ascending: true })
      .limit(30);

    if (!data || data.length === 0) {
      throw new Error("No words to practice. Add words from stories first!");
    }

    return data;
  },

  async generateExercise(userId: string, wordId: string, skill: string) {
    const { data: word } = await supabase
      .from("vocabulary_learning")
      .select("*")
      .eq("id", wordId)
      .eq("user_id", userId)
      .single();

    if (!word) throw new Error("Word not found");

    const { data: user } = await supabase
      .from("users")
      .select("current_level")
      .eq("id", userId)
      .single();

    return geminiService.generateExercise(
      word.word,
      word.translation,
      skill,
      user?.current_level || "A0",
    );
  },

  async recordPracticeResult(
    userId: string,
    wordId: string,
    skill: string,
    isCorrect: boolean,
  ) {
    // Determine mapped field
    const mappedSkill = (skillFieldMap as any)[skill];

    if (!mappedSkill) {
      // Fallback or error if skill is not in map (e.g. 'grammar' if sent by old client)
      // For now, if invalid skill, just return current state without erroring validation
      console.warn(`Invalid skill ${skill} for recordPracticeResult`);
      return {
        word: "",
        mastered: false,
        newStatus: "learning",
      };
    }

    // 1. Get current word
    const { data: word } = await supabase
      .from("vocabulary_learning")
      .select("*")
      .eq("id", wordId)
      .eq("user_id", userId)
      .single();

    if (!word) throw new Error("Word not found");

    if (!isCorrect) {
      return {
        word: word.word,
        mastered: false,
        newStatus: "learning",
      };
    }

    // 2. Increment skill
    const currentVal = word[mappedSkill] || 0;
    const newVal = Math.min(currentVal + 1, 3); // Max 3 (User Request)

    const updates: any = {};
    updates[mappedSkill] = newVal;

    // Check completion flag
    if (newVal === 3) {
      const flag = mappedSkill.replace("skill_", "") + "_completed";
      updates[flag] = true;
    }

    // Recalculate mastery_level
    const skills = [
      "skill_listening",
      "skill_reading",
      "skill_writing",
      "skill_speaking",
    ];
    let totalScore = 0;
    // We mix active updates with stored values
    const newState = { ...word, ...updates };
    for (const key of skills) {
      totalScore += newState[key] || 0;
    }

    // Max Score = 3 * 4 = 12
    const mastery = Math.min(Math.round((totalScore / 12) * 100), 100);
    updates.mastery_level = mastery;

    // Update in DB
    await supabase.from("vocabulary_learning").update(updates).eq("id", wordId);

    // Check if mastered (>= 90% or all 4 completed)
    const allCompleted = skills.every((key) => (newState[key] || 0) >= 3);

    if (mastery >= 90 || allCompleted) {
      // Move to Known
      // 1. Insert to Known
      await supabase.from("vocabulary_known").insert({
        user_id: userId,
        word: word.word,
        translation: word.translation,
      });

      // 2. Delete from Learning
      await supabase.from("vocabulary_learning").delete().eq("id", wordId);

      // 3. Increment learned words
      const { data: u } = await supabase
        .from("users")
        .select("total_learned_words, current_level")
        .eq("id", userId)
        .single();
      if (u) {
        const newTotal = (u.total_learned_words || 0) + 1;
        await supabase
          .from("users")
          .update({ total_learned_words: newTotal })
          .eq("id", userId);

        // Check level up
        const levelMap: Record<string, string> = {
          A0: "A1",
          A1: "A2",
          A2: "B1",
          B1: "B2",
        };
        const nextThreshold = Math.ceil(newTotal / 1000) * 1000;
        if (newTotal >= nextThreshold && levelMap[u.current_level]) {
          await supabase
            .from("users")
            .update({ current_level: levelMap[u.current_level] })
            .eq("id", userId);
          return {
            word: word.word,
            mastered: true,
            newStatus: "known",
            levelUp: {
              previousLevel: u.current_level,
              newLevel: levelMap[u.current_level],
            },
          };
        }
      }

      return {
        word: word.word,
        mastered: true,
        newStatus: "known",
      };
    }

    return {
      word: word.word,
      mastered: false,
      newStatus: "learning",
      skillProgress: {
        [skill]: newVal,
        mastery: mastery,
      },
    };
  },

  async generateNewWords(userId: string, count: number = 10) {
    // REMOVED PER USER REQUEST - MANUAL ADDITION ONLY
    return [];
  },
};
