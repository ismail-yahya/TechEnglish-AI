export declare const geminiService: {
    /**
     * Generate a technical story based on level, domain, title, concept and learning words
     */
    generateStory(level: string, domain: string, title: string, concept: string, learningWords: string[], knownWords: string[]): Promise<{
        title: string;
        summary: string;
        content: string;
        sentences: Array<{
            text: string;
        }>;
        questions: Array<{
            question: string;
            options: string[];
            correctAnswer: string;
            explanation: string;
        }>;
    }>;
    /**
     * Generate 50 stories roadmap
     */
    generateLevelRoadmap(level: string, domain: string): Promise<Array<{
        title: string;
        concept: string;
    }>>;
    /**
     * Chat about a story with AI correction
     */
    chatAboutStory(storyContent: string, userMessage: string, conversationHistory: Array<{
        role: string;
        content: string;
    }>, level: string): Promise<string>;
    /**
     * Generate exercise for a specific skill
     */
    generateExercise(word: string, translation: string, skill: string, level: string): Promise<{
        question: string;
        options?: string[];
        correctAnswer: string;
        context?: string;
    }>;
};
//# sourceMappingURL=gemini.service.d.ts.map