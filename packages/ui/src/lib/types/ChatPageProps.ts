import { PersonalityModel, ScenarioModel } from '@repo/frontend-utils/src/models';

export interface ChatPageProps {
    personality: PersonalityModel;
    conversationRoleName: string;
    scenario: ScenarioModel | null
}
