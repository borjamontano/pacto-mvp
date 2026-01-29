import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ActivityService } from './activity.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('activity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('households/:householdId/activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  list(
    @CurrentUser() user: { sub: string },
    @Param('householdId') householdId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.activityService.getFeed(
      user.sub,
      householdId,
      limit ? Number(limit) : undefined,
      cursor,
    );
  }
}
