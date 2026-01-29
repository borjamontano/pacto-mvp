import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { JoinHouseholdDto } from './dto/join-household.dto';
import { HouseholdsService } from './households.service';

@ApiTags('households')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('households')
export class HouseholdsController {
  constructor(private readonly householdsService: HouseholdsService) {}

  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateHouseholdDto) {
    return this.householdsService.create(user.sub, dto);
  }

  @Get()
  list(@CurrentUser() user: { sub: string }) {
    return this.householdsService.list(user.sub);
  }

  @Get(':id')
  get(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.householdsService.getById(user.sub, id);
  }

  @Post(':id/invite')
  invite(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.householdsService.createInvite(user.sub, id);
  }

  @Post('join')
  join(@CurrentUser() user: { sub: string }, @Body() dto: JoinHouseholdDto) {
    return this.householdsService.join(user.sub, dto.inviteCode);
  }
}
