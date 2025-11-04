
import { Personality, Scenario } from '@repo/shared/generated/prisma/client';

export interface ChatPageProps {
    personality: Personality;
    conversationRoleName: string;
    scenario: Scenario | null
}
