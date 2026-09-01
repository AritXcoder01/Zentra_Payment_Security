import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'User Indian mobile number',
    example: '+919876543210',
  })
  @IsNotEmpty()
  @IsString()
  mobileNumber!: string;

  @ApiProperty({
    description: 'OTP code received via SMS',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  @Length(4, 8)
  otp!: string;
}
