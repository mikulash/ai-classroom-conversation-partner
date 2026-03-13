import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
    @ApiProperty({ description: 'Error message' })
      message!: string;
}

export class MessageResponseDto {
    @ApiProperty({ description: 'Response message' })
      message!: string;
}
