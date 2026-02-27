export declare const vocabularyService: {
    getLearning(userId: string): Promise<any[]>;
    getKnown(userId: string): Promise<any[]>;
    getStats(userId: string): Promise<{
        learning: number;
        known: number;
        total: number;
        currentLevel: any;
        totalLearnedWords: any;
        wordsToNextLevel: number;
    }>;
    addWord(userId: string, word: string, translation: string, level: string, domain: string, masteryStatus?: string): Promise<any>;
    addWordsFromStory(userId: string, words: Array<{
        word: string;
        translation: string;
    }>, level: string, domain: string): Promise<any[]>;
    getPracticeSession(userId: string): Promise<any[]>;
    generateExercise(userId: string, wordId: string, skill: string): Promise<{
        question: string;
        options?: string[];
        correctAnswer: string;
        context?: string;
    }>;
    recordPracticeResult(userId: string, wordId: string, skill: string, isCorrect: boolean): Promise<{
        word: any;
        mastered: boolean;
        newStatus: string;
        levelUp?: undefined;
        skillProgress?: undefined;
    } | {
        word: any;
        mastered: boolean;
        newStatus: string;
        levelUp: {
            previousLevel: any;
            newLevel: string;
        };
        skillProgress?: undefined;
    } | {
        word: any;
        mastered: boolean;
        newStatus: string;
        skillProgress: {
            [x: string]: number;
            mastery: number;
        };
        levelUp?: undefined;
    }>;
    generateNewWords(userId: string, count?: number): Promise<never[]>;
};
//# sourceMappingURL=vocabulary.service.d.ts.map