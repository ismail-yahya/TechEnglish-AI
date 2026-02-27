"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const supabase_1 = require("../config/supabase");
exports.authService = {
    async register(email, password, name) {
        // Register with Supabase Auth
        const { data, error } = await supabase_1.supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }, // This metadata is stored in auth.users, but we also sync to public.users via trigger
            },
        });
        if (error)
            throw new Error(error.message);
        return { user: data.user, session: data.session };
    },
    async login(email, password) {
        const { data, error } = await supabase_1.supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error)
            throw new Error(error.message);
        // We can also fetch the public user profile here if needed to return it merged
        const { data: profile } = await supabase_1.supabase
            .from("users")
            .select("*")
            .eq("id", data.user.id)
            .single();
        return { session: data.session, user: data.user, profile };
    },
    async getProfile(userId) {
        const { data: user, error } = await supabase_1.supabase
            .from("users")
            .select(`
        *,
        stories:stories(count),
        vocabulary_learning:vocabulary_learning(count),
        vocabulary_known:vocabulary_known(count)
      `)
            .eq("id", userId)
            .single();
        if (error || !user) {
            // It might be possible the user executed register but trigger didn't fire or race condition?
            // Or user doesn't exist.
            // throw new Error("User not found");
            // Return basic user info from Auth if available? No, services/auth should deal with public.users
            throw new Error("User profile not found");
        }
        // Format counts
        const storyCount = user.stories?.[0]?.count || 0;
        const learningCount = user.vocabulary_learning?.[0]?.count || 0;
        const knownCount = user.vocabulary_known?.[0]?.count || 0;
        return {
            ...user,
            stats: {
                stories: storyCount,
                vocabulary: learningCount + knownCount,
            },
        };
    },
    async updateProfile(userId, data) {
        // Update public.users
        // Note: 'chosenDomains' in TS, 'chosen_domains' in DB
        const updatePayload = {};
        if (data.name)
            updatePayload.name = data.name;
        if (data.chosenDomains)
            updatePayload.chosen_domains = data.chosenDomains;
        if (data.currentLevel)
            updatePayload.current_level = data.currentLevel;
        if (data.speechEnginePreference)
            updatePayload.speech_engine_preference = data.speechEnginePreference;
        const { data: updated, error } = await supabase_1.supabase
            .from("users")
            .update(updatePayload)
            .eq("id", userId)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return updated;
    },
};
//# sourceMappingURL=auth.service.js.map