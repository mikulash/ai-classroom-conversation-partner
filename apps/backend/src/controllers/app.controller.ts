import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('root')
@Controller()
export class AppController {
  @Get()
  @ApiOkResponse({ description: 'Root check', type: String })
  root(): string {
    return 'API is running';
  }
}
