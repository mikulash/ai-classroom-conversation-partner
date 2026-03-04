import { ApiProperty } from '@nestjs/swagger';

export class ConversationRoleDto {
    @ApiProperty({ description: 'Role ID' })
      id!: number;

    @ApiProperty({ description: 'Created at timestamp' })
      createdAt!: string;

    @ApiProperty({ description: 'Role name in English' })
      nameEn!: string;

    @ApiProperty({ description: 'Role name in Czech' })
      nameCs!: string;
}
