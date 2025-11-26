import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'password123',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Confirm password',
    example: 'password123'
  })
  @IsString()
  confirmPassword: string;
}
