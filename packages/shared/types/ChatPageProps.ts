import { Personality, Scenario } from './supabase/supabaseTypeHelpers.js';

export interface ChatPageProps {
    personality: Personality;
    conversationRoleName: string;
    scenario: Scenario | null
}
