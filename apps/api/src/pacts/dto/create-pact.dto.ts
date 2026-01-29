import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreatePactDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsString()
  assignedToUserId?: string | null;

  @IsOptional()
  @IsDateString()
  dueAt?: string | null;

  @IsOptional()
  @IsBoolean()
  requiresConfirmation?: boolean;
}
