import { IsEmail, IsIn, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsIn(['ADMIN', 'USER'], { message: 'Role must be either ADMIN or USER' })
  role?: string;
}
