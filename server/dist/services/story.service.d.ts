export declare const storyService: {
    getAllByUser(userId: string): Promise<{
        id: any;
        title: any;
        summary: any;
        content: any;
        level: any;
        domain: any;
        completed: any;
        dateCreated: any;
        quizAnswersCount: any;
        chatMessagesCount: any;
    }[]>;
    getById(id: string, userId: string): Promise<{
        id: any;
        title: any;
        summary: any;
        content: string;
        sentences: any;
        quiz: any;
        level: any;
        domain: any;
        completed: any;
        dateCreated: any;
        chatMessages: any;
    }>;
    initializeLevelRoadmap(userId: string, level: string, domain: string): Promise<any[]>;
    getNextPlannedStory(userId: string, level: string, domain: string): Promise<any>;
    generate(userId: string, domain: string): Promise<any>;
    submitQuizAnswers(storyId: string, userId: string, answers: Array<{
        question_index: number;
        isCorrect: boolean;
    }>): Promise<any[]>;
    sendChatMessage(storyId: string, userId: string, message: string): Promise<{
        id: any;
        sender: any;
        message: any;
        createdAt: any;
    }>;
    translate(text: string): Promise<any>;
};
//# sourceMappingURL=story.service.d.ts.map