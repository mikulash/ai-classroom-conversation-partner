import {
  ConversationRole,
  Personality,
  Scenario,
} from '@repo/shared/types/db/entities';
import { AppConfigWithModels } from '@repo/shared/types/api';
import { api } from '../api';
interface InitialData {
    personalities: Personality[];
    scenarios: Scenario[];
    conversationRoles: ConversationRole[];
    appConfig: AppConfigWithModels;
}

// -------------------- Initial Data Fetch --------------------
export async function fetchInitialData(): Promise<InitialData> {
  try {
    const [personalities, scenarios, conversationRoles, appConfig] = await Promise.all([
      api.get<Personality[]>('/api/personalities'),
      api.get<Scenario[]>('/api/scenarios'),
      api.get<ConversationRole[]>('/api/conversation-roles'),
      api.get<AppConfigWithModels>('/api/app-config'),
    ]);

    return {
      personalities: personalities.data,
      scenarios: scenarios.data,
      conversationRoles: conversationRoles.data,
      appConfig: appConfig.data,
    };
  } catch (error: any) {
    console.error('Error fetching initial data:', error);
    throw error;
  }
}

