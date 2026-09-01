import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestOtpDto {
  @ApiProperty({
    description: 'User Indian mobile number in any format (+91, 91, or 10 digits)',
    example: '+919876543210',
  })
  @IsNotEmpty()
  @IsString()
  mobileNumber!: string;
}
