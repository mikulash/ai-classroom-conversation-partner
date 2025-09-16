import { Personality, Scenario } from '@repo/shared/types/supabase/supabaseTypeHelpers';

export interface ChatPageProps {
    personality: Personality;
    conversationRoleName: string;
    scenario: Scenario | null
}
