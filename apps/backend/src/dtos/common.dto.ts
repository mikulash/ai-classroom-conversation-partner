import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
    @ApiProperty({ description: 'Error message' })
      message!: string;

    @ApiProperty({ description: 'HTTP status code', required: false })
      statusCode?: number;
}

export class MessageResponseDto {
    @ApiProperty({ description: 'Response message' })
      message!: string;
}
