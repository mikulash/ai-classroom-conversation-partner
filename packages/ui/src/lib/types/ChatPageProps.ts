import { Personality, Scenario } from '@repo/shared/types/db/entities';

export interface ChatPageProps {
    personality: Personality;
    conversationRoleName: string;
    scenario: Scenario | null
}
