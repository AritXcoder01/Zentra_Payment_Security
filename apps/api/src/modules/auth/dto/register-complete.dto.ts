import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterCompleteDto {
  @ApiProperty({
    description: 'Server-issued registration token obtained after OTP verification',
  })
  @IsNotEmpty()
  @IsString()
  registrationToken!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User full name',
    example: 'Aarav Sharma',
  })
  @IsNotEmpty()
  @IsString()
  fullName!: string;
}
