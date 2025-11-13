import {
  ConversationRole,
  Personality,
  Scenario,
} from '@repo/shared/types/db/entities';
import { AppConfigWithModels, InitialConversationOptions } from '@repo/shared/types/dbRoutes.types';
import { api } from '../api';

export async function fetchInitialConversationOptions(): Promise<InitialConversationOptions> {
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

