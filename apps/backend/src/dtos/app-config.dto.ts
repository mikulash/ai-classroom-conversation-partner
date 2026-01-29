import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateAppConfigDto {
    @ApiPropertyOptional({ description: 'Response model ID' })
    @IsOptional()
    @IsInt()
    responseModelId?: number | null;

    @ApiPropertyOptional({ description: 'TTS model ID' })
    @IsOptional()
    @IsInt()
    ttsModelId?: number | null;

    @ApiPropertyOptional({ description: 'Realtime model ID' })
    @IsOptional()
    @IsInt()
    realtimeModelId?: number | null;

    @ApiPropertyOptional({ description: 'Realtime transcription model ID' })
    @IsOptional()
    @IsInt()
    realtimeTranscriptionModelId?: number | null;

    @ApiPropertyOptional({ description: 'Timestamped transcription model ID' })
    @IsOptional()
    @IsInt()
    timestampedTranscriptionModelId?: number | null;
}
