import { Injectable, NotFoundException } from '@nestjs/common';
import { API_KEY } from '@repo/shared/enums/ApiKey';
import { PrismaService } from '../core/prisma/prisma.service';
import { UniversalApiService } from '../ai-api/universalApi';
import { ConfigProvider } from '../utils/configProvider';
import {
  AiProviderStatusDto,
  FullReplyPlainResponseDto,
  FullReplyTimestampedResponseDto,
  GenerateReplyDto,
  RealtimeTranscriptionDto,
  RealtimeVoiceDto,
  ReplyPersonalityDto,
  ReplyProfileDto,
  ReplyScenarioDto,
  TextToSpeechDto,
  TextToSpeechResponseDto,
  TextToSpeechTimestampedDto,
  TextToSpeechTimestampedResponseDto,
  TranscriptionSessionCreateResponseDto,
  WebRtcAnswerResponseDto,
} from '../dtos/replies.dto';
import { JWTPayload } from '../utils/auth';
import { Personality, Profile, Scenario, User } from '../generated/prisma/client';

@Injectable()
export class RepliesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly universalApi: UniversalApiService,
    private readonly configProvider: ConfigProvider,
  ) {}

  async generateText(body: GenerateReplyDto, currentUser: JWTPayload): Promise<string> {
    const context = await this.buildReplyContext(body, currentUser.userId);
    return this.universalApi.getResponse(this.toResponseParams(body, context), currentUser.userId);
  }

  async generateSpeech(body: TextToSpeechDto, currentUser: JWTPayload): Promise<TextToSpeechResponseDto> {
    const personality = await this.getCanonicalPersonality(body.personality.id);
    const result = await this.universalApi.getSpeechAudio({
      inputMessage: body.inputMessage,
      personality,
      language: body.language,
      responseFormat: body.responseFormat ?? 'pcm',
    }, currentUser.userId);

    return {
      audioBase64: Buffer.from(new Uint8Array(result.buffer)).toString('base64'),
      sampleRate: result.sampleRate,
    };
  }

  async generateTimestampedSpeech(
    body: TextToSpeechTimestampedDto,
    currentUser: JWTPayload,
  ): Promise<TextToSpeechTimestampedResponseDto> {
    const personality = await this.getCanonicalPersonality(body.personality.id);
    return this.universalApi.getTimestampedSpeechAudio({
      inputMessage: body.inputMessage,
      personality,
      language: body.language,
    }, currentUser.userId);
  }

  async generateFullPlain(body: GenerateReplyDto, currentUser: JWTPayload): Promise<FullReplyPlainResponseDto> {
    const context = await this.buildReplyContext(body, currentUser.userId);
    const text = await this.universalApi.getResponse(this.toResponseParams(body, context), currentUser.userId);
    const result = await this.universalApi.getSpeechAudio({
      inputMessage: text,
      personality: context.personality,
      language: body.language,
      responseFormat: 'pcm',
    }, currentUser.userId);

    return {
      text,
      speech: {
        audioBase64: Buffer.from(new Uint8Array(result.buffer)).toString('base64'),
        sampleRate: result.sampleRate,
      },
    };
  }

  async generateFullTimestamped(
    body: GenerateReplyDto,
    currentUser: JWTPayload,
  ): Promise<FullReplyTimestampedResponseDto> {
    const context = await this.buildReplyContext(body, currentUser.userId);
    const text = await this.universalApi.getResponse(this.toResponseParams(body, context), currentUser.userId);
    const speech = await this.universalApi.getTimestampedSpeechAudio({
      inputMessage: text,
      personality: context.personality,
      language: body.language,
    }, currentUser.userId);

    return { text, speech };
  }

  async realtimeVoice(body: RealtimeVoiceDto, currentUser: JWTPayload): Promise<WebRtcAnswerResponseDto> {
    const context = await this.buildReplyContext(body, currentUser.userId);
    return this.universalApi.getRealtimeVoice({
      openaiVoiceName: context.personality.openaiVoiceName,
      personality: context.personality,
      conversationRole: body.conversationRole,
      language: body.language,
      scenario: context.scenario,
      userProfile: context.userProfile,
      sdpOffer: body.sdpOffer,
    }, currentUser.userId);
  }

  async realtimeTranscription(
    body: RealtimeTranscriptionDto,
    currentUser: JWTPayload,
  ): Promise<TranscriptionSessionCreateResponseDto> {
    return this.universalApi.getRealtimeTranscription({
      inputAudioFormat: 'pcm16',
      language: body.language,
    }, currentUser.userId);
  }

  getProviders(): AiProviderStatusDto[] {
    return Object.entries(API_KEY).map(([, envKey]) => ({
      apiKey: envKey,
      isAvailable: this.configProvider.isApiKeyAvailable(envKey),
    }));
  }

  private async buildReplyContext(
    body: Pick<GenerateReplyDto | RealtimeVoiceDto, 'personality' | 'scenario' | 'userProfile'>,
    userId: string,
  ): Promise<{
    personality: ReplyPersonalityDto;
    scenario: ReplyScenarioDto | null;
    userProfile: ReplyProfileDto;
  }> {
    const [personality, scenario, user] = await Promise.all([
      this.getCanonicalPersonality(body.personality.id),
      this.getCanonicalScenario(body.scenario),
      this.getCanonicalUserProfile(userId),
    ]);

    return {
      personality,
      scenario,
      userProfile: user,
    };
  }

  private toResponseParams(
    body: GenerateReplyDto,
    context: {
      personality: ReplyPersonalityDto;
      scenario: ReplyScenarioDto | null;
      userProfile: ReplyProfileDto;
    },
  ): GenerateReplyDto {
    return {
      inputText: body.inputText,
      previousMessages: body.previousMessages,
      conversationRole: body.conversationRole,
      language: body.language,
      personality: context.personality,
      scenario: context.scenario,
      userProfile: context.userProfile,
    };
  }

  private async getCanonicalPersonality(id: number): Promise<ReplyPersonalityDto> {
    const personality = await this.prisma.personality.findUnique({ where: { id } });
    if (!personality) {
      throw new NotFoundException('Personality not found');
    }
    return this.personalityToReplyDto(personality);
  }

  private async getCanonicalScenario(scenario: ReplyScenarioDto | null): Promise<ReplyScenarioDto | null> {
    if (!scenario?.id) {
      return scenario;
    }

    const canonicalScenario = await this.prisma.scenario.findUnique({ where: { id: scenario.id } });
    if (!canonicalScenario) {
      throw new NotFoundException('Scenario not found');
    }

    return this.scenarioToReplyDto(canonicalScenario);
  }

  private async getCanonicalUserProfile(userId: string): Promise<ReplyProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user?.profile) {
      throw new NotFoundException('User not found');
    }

    return this.profileToReplyDto(user.profile, user);
  }

  private personalityToReplyDto(personality: Personality): ReplyPersonalityDto {
    return {
      id: personality.id,
      name: personality.name,
      age: personality.age,
      sex: personality.sex,
      gender: personality.gender,
      openaiVoiceName: personality.openaiVoiceName,
      elevenlabsVoiceId: personality.elevenlabsVoiceId,
      voiceInstructions: personality.voiceInstructions,
      personalityDescriptionEn: personality.personalityDescriptionEn,
      personalityDescriptionCs: personality.personalityDescriptionCs,
      problemSummaryEn: personality.problemSummaryEn,
      problemSummaryCs: personality.problemSummaryCs,
      avatarUrl: personality.avatarUrl,
      isHidden: personality.isHidden,
    };
  }

  private scenarioToReplyDto(scenario: Scenario): ReplyScenarioDto {
    return {
      id: scenario.id,
      involvedPersonalityId: scenario.involvedPersonalityId ?? undefined,
      settingEn: scenario.settingEn,
      settingCs: scenario.settingCs,
      situationDescriptionEn: scenario.situationDescriptionEn,
      situationDescriptionCs: scenario.situationDescriptionCs,
    };
  }

  private profileToReplyDto(profile: Profile, user: User): ReplyProfileDto {
    return {
      id: profile.id,
      fullName: profile.fullName,
      gender: profile.gender,
      conversationRole: profile.conversationRole,
      bio: profile.bio,
      email: user.email,
      userRole: profile.userRole,
    };
  }
}
