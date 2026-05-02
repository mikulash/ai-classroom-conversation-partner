import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  ResponseModelDto,
  TtsModelDto,
  RealtimeModelDto,
  RealtimeTranscriptionModelDto,
  TimestampedTranscriptionModelDto,
  CustomSelectionWithModelsDto,
} from '../dtos/models.dto';
import { MessageResponseDto, ModelSelectionIdsDto } from '../dtos/common.dto';
import { ModelsService } from '../services/models.service';

@ApiTags('models')
@Controller('api/models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Get('response')
  @ApiOkResponse({ description: 'List response models', type: [ResponseModelDto] })
  getResponseModels(): Promise<ResponseModelDto[]> {
    return this.modelsService.getResponseModels();
  }

  @Get('tts')
  @ApiOkResponse({ description: 'List TTS models', type: [TtsModelDto] })
  getTtsModels(): Promise<TtsModelDto[]> {
    return this.modelsService.getTtsModels();
  }

  @Get('realtime')
  @ApiOkResponse({ description: 'List realtime models', type: [RealtimeModelDto] })
  getRealtimeModels(): Promise<RealtimeModelDto[]> {
    return this.modelsService.getRealtimeModels();
  }

  @Get('realtime-transcription')
  @ApiOkResponse({ description: 'List realtime transcription models', type: [RealtimeTranscriptionModelDto] })
  getRealtimeTranscriptionModels(): Promise<RealtimeTranscriptionModelDto[]> {
    return this.modelsService.getRealtimeTranscriptionModels();
  }

  @Get('timestamped-transcription')
  @ApiOkResponse({ description: 'List timestamped transcription models', type: [TimestampedTranscriptionModelDto] })
  getTimestampedTranscriptionModels(): Promise<TimestampedTranscriptionModelDto[]> {
    return this.modelsService.getTimestampedTranscriptionModels();
  }

  @Get('custom-selection/:userId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'owner')
  @ApiParam({ name: 'userId', type: String })
  @ApiOkResponse({ description: 'Get custom model selection for user', type: CustomSelectionWithModelsDto })
  getCustomSelection(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<CustomSelectionWithModelsDto | null> {
    return this.modelsService.getCustomSelection(userId);
  }

  @Put('custom-selection/:userId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'owner')
  @ApiParam({ name: 'userId', type: String })
  @ApiBody({ type: ModelSelectionIdsDto })
  @ApiOkResponse({ description: 'Update custom model selection for user', type: CustomSelectionWithModelsDto })
  updateCustomSelection(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() body: ModelSelectionIdsDto,
  ): Promise<CustomSelectionWithModelsDto> {
    return this.modelsService.updateCustomSelection(userId, body);
  }

  @Delete('custom-selection/:userId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'owner')
  @ApiParam({ name: 'userId', type: String })
  @ApiOkResponse({ description: 'Delete custom model selection for user', type: MessageResponseDto })
  deleteCustomSelection(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<MessageResponseDto> {
    return this.modelsService.deleteCustomSelection(userId);
  }
}
