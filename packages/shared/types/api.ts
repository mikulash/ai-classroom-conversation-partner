import { Conversation, Profile } from './db/entities';

export interface ErrorResponse {
  message: string;
}

export interface AuthResponse {
    user: Profile;
    accessToken: string;
    refreshToken: string;
}

export interface ApiResponse<T> {
    data: T;
    error?: { message: string };
}

export interface RegisterPayload {
    email: string;
    password: string;
    fullName?: string;
    gender?: string;
}

export type ConversationWithPersonality = Pick<
    Conversation,
    | 'id'
    | 'startTime'
    | 'endTime'
    | 'endedReason'
    | 'conversationType'
    | 'messages'
    | 'personalityId'
> & { personality: { name: string } | null };
