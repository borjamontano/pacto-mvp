import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DevicesService } from './devices.service';
import { RegisterDeviceDto } from './dto/register-device.dto';

@ApiTags('devices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('register-token')
  register(@CurrentUser() user: { sub: string }, @Body() dto: RegisterDeviceDto) {
    return this.devicesService.register(user.sub, dto);
  }

  @Delete('unregister-token')
  unregister(@CurrentUser() user: { sub: string }) {
    return this.devicesService.unregister(user.sub);
  }
}
