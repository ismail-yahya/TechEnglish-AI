export declare const authService: {
    register(email: string, password: string, name: string): Promise<{
        user: import("@supabase/auth-js").User | null;
        session: import("@supabase/auth-js").Session | null;
    }>;
    login(email: string, password: string): Promise<{
        session: import("@supabase/auth-js").Session;
        user: import("@supabase/auth-js").User;
        profile: any;
    }>;
    getProfile(userId: string): Promise<any>;
    updateProfile(userId: string, data: {
        name?: string;
        chosenDomains?: string[];
        currentLevel?: string;
        speechEnginePreference?: "web" | "assemblyai";
    }): Promise<any>;
};
//# sourceMappingURL=auth.service.d.ts.map