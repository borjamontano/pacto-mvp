import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreatePactDto } from './dto/create-pact.dto';
import { UpdatePactDto } from './dto/update-pact.dto';
import { PactsService } from './pacts.service';

@ApiTags('pacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('households/:householdId/pacts')
export class PactsController {
  constructor(private readonly pactsService: PactsService) {}

  @Post()
  create(
    @CurrentUser() user: { sub: string },
    @Param('householdId') householdId: string,
    @Body() dto: CreatePactDto,
  ) {
    return this.pactsService.create(user.sub, householdId, dto);
  }

  @Get()
  list(
    @CurrentUser() user: { sub: string },
    @Param('householdId') householdId: string,
    @Query('filter') filter?: string,
  ) {
    return this.pactsService.list(user.sub, householdId, filter);
  }

  @Get(':pactId')
  get(
    @CurrentUser() user: { sub: string },
    @Param('householdId') householdId: string,
    @Param('pactId') pactId: string,
  ) {
    return this.pactsService.getById(user.sub, householdId, pactId);
  }

  @Patch(':pactId')
  update(
    @CurrentUser() user: { sub: string },
    @Param('householdId') householdId: string,
    @Param('pactId') pactId: string,
    @Body() dto: UpdatePactDto,
  ) {
    return this.pactsService.update(user.sub, householdId, pactId, dto);
  }

  @Delete(':pactId')
  remove(
    @CurrentUser() user: { sub: string },
    @Param('householdId') householdId: string,
    @Param('pactId') pactId: string,
  ) {
    return this.pactsService.remove(user.sub, householdId, pactId);
  }

  @Post(':pactId/assign-to-me')
  assignToMe(
    @CurrentUser() user: { sub: string },
    @Param('householdId') householdId: string,
    @Param('pactId') pactId: string,
  ) {
    return this.pactsService.assignToMe(user.sub, householdId, pactId);
  }

  @Post(':pactId/mark-done')
  markDone(
    @CurrentUser() user: { sub: string },
    @Param('householdId') householdId: string,
    @Param('pactId') pactId: string,
  ) {
    return this.pactsService.markDone(user.sub, householdId, pactId);
  }

  @Post(':pactId/confirm')
  confirm(
    @CurrentUser() user: { sub: string },
    @Param('householdId') householdId: string,
    @Param('pactId') pactId: string,
  ) {
    return this.pactsService.confirm(user.sub, householdId, pactId);
  }
}
