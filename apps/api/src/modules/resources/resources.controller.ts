import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ResourcesService } from './resources.service';
import { QueryResourcesDto } from './dto/query-resources.dto';

@ApiTags('Resources')
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  @ApiOperation({ summary: 'Get active verified official resources and support channels' })
  async findAll(@Query() query: QueryResourcesDto) {
    return this.resourcesService.findAll(query);
  }
}
