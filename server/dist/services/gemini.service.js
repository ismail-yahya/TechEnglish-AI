"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const env_1 = require("../config/env");
const genAI = new generative_ai_1.GoogleGenerativeAI(env_1.config.gemini.apiKey);
// Use gemini-1.5-flash for reliable structured output support
const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
});
exports.geminiService = {
    /**
     * Generate a technical story based on level, domain, title, concept and learning words
     */
    async generateStory(level, domain, title, concept, learningWords, knownWords) {
        const wordsContext = learningWords.length > 0
            ? `Try to naturally incorporate some of these words the user is currently learning: ${learningWords.join(", ")}.`
            : "";
        const prompt = `Write a creative technical story (approx 200-300 words) for an English learner at level ${level}.
    The domain is: ${domain}.
    
    Story Title: ${title}.
    Main Concept/Theme: ${concept}.
    ${wordsContext}

    Vocabulary Constraint:
    - Use approximately 30-40% words from the user's 'Known Words' list: ${knownWords.join(", ")}.
    - Use approximately 60-70% NEW words or words from the 'Learning Words' list above to challenge the user.
    
    Requirements:
    1. **Story Structure**: Break the story down into individual sentences. For EACH sentence, provide:
       - The English text (using technical vocabulary).
    2. **Quiz Generation**: Generate 3-10 multiple-choice questions based on this specific story to test comprehension. Include a brief explanation for the correct answer.
    3. **Content**:
       - If Level is A0, keep it very simple.
       - If Level is A1/A2, include specific terminology for ${domain}.
    `;
        const schema = {
            description: "Technical story response",
            type: generative_ai_1.SchemaType.OBJECT,
            properties: {
                title: { type: generative_ai_1.SchemaType.STRING },
                summary: { type: generative_ai_1.SchemaType.STRING },
                sentences: {
                    type: generative_ai_1.SchemaType.ARRAY,
                    items: {
                        type: generative_ai_1.SchemaType.OBJECT,
                        properties: {
                            text: { type: generative_ai_1.SchemaType.STRING },
                        },
                        required: ["text"],
                    },
                },
                questions: {
                    type: generative_ai_1.SchemaType.ARRAY,
                    items: {
                        type: generative_ai_1.SchemaType.OBJECT,
                        properties: {
                            question: { type: generative_ai_1.SchemaType.STRING },
                            options: {
                                type: generative_ai_1.SchemaType.ARRAY,
                                items: { type: generative_ai_1.SchemaType.STRING },
                            },
                            correctAnswer: { type: generative_ai_1.SchemaType.STRING },
                            explanation: { type: generative_ai_1.SchemaType.STRING },
                        },
                        required: ["question", "options", "correctAnswer", "explanation"],
                    },
                },
            },
            required: ["title", "summary", "sentences", "questions"],
        };
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const text = result.response.text();
        const data = JSON.parse(text);
        // Construct full content
        const fullContent = data.sentences.map((s) => s.text).join(" ");
        return {
            title: data.title,
            summary: data.summary,
            content: fullContent,
            sentences: data.sentences,
            questions: data.questions,
        };
    },
    /**
     * Generate 50 stories roadmap
     */
    async generateLevelRoadmap(level, domain) {
        const prompt = `You are an expert curriculum designer for teaching English.
    Generate a roadmap of exactly 50 unique story topics for an English learner at level ${level} in the domain of ${domain}.
    
    The stories must be:
    1. Sequential and methodological.
    2. Foundational to the domain.
    3. Each story introduces a new concept or vocabulary theme.
    
    Return exactly 50 items. For each item provide:
    - title: An engaging title for the story.
    - concept: What new concept, grammar, or vocabulary theme this story introduces.`;
        const schema = {
            description: "Level roadmap of 50 stories",
            type: generative_ai_1.SchemaType.ARRAY,
            items: {
                type: generative_ai_1.SchemaType.OBJECT,
                properties: {
                    title: { type: generative_ai_1.SchemaType.STRING },
                    concept: { type: generative_ai_1.SchemaType.STRING },
                },
                required: ["title", "concept"],
            },
        };
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const text = result.response.text();
        return JSON.parse(text);
    },
    /**
     * Chat about a story with AI correction
     */
    async chatAboutStory(storyContent, userMessage, conversationHistory, level) {
        const historyContext = conversationHistory
            .map((msg) => `${msg.role === "user" ? "Student" : "Teacher"}: ${msg.content}`)
            .join("\n");
        const prompt = `You are a friendly English teacher helping a student practice technical English at level ${level}.

The student just read this story:
${storyContent}

Previous conversation:
${historyContext}

Student's new message: "${userMessage}"

Instructions:
1. Respond naturally to the student's message
2. If they made grammar mistakes, gently correct them with explanation
3. If they used technical terms incorrectly, suggest better usage
4. Encourage them to use vocabulary from the story
5. Keep your response appropriate for ${level} level
6. Be encouraging and supportive`;
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    },
    /**
     * Generate exercise for a specific skill
     */
    async generateExercise(word, translation, skill, level) {
        let skillInstructions = "";
        switch (skill) {
            case "reading":
                skillInstructions = `Create a reading exercise: Show the word "${word}" in a sentence context, then ask the student to choose the correct meaning from 4 options. One option should be "${translation}" (the correct answer in Arabic).`;
                break;
            case "listening":
                skillInstructions = `Create a listening exercise: The student will hear the word "${word}". Generate 4 English word options (including "${word}" as the correct one) that sound somewhat similar. The student must identify the word they heard.`;
                break;
            case "identification":
                skillInstructions = `Create an identification exercise: Show the Arabic meaning "${translation}" and ask the student to pick the correct English word from 4 options. Include "${word}" as the correct answer and 3 similar-looking or related words.`;
                break;
            default:
                skillInstructions = `Create a vocabulary exercise for the word "${word}" (meaning: "${translation}").`;
        }
        const prompt = `${skillInstructions}

Level: ${level}
Return a JSON object for the exercise.`;
        const schema = {
            description: "Exercise",
            type: generative_ai_1.SchemaType.OBJECT,
            properties: {
                question: { type: generative_ai_1.SchemaType.STRING },
                options: {
                    type: generative_ai_1.SchemaType.ARRAY,
                    items: { type: generative_ai_1.SchemaType.STRING },
                },
                correctAnswer: { type: generative_ai_1.SchemaType.STRING },
                context: { type: generative_ai_1.SchemaType.STRING },
            },
            required: ["question", "options", "correctAnswer"],
        };
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        return JSON.parse(result.response.text());
    },
};
//# sourceMappingURL=gemini.service.js.map