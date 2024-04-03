import { Body, Controller, Post, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';
import { RoleGuard } from './role.guard';
import { ExceptionHandling } from 'src/common/filters/exceptionHandling.filters';

@UseFilters(ExceptionHandling)
@UsePipes(ValidationPipe)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  //signup
  @Post('signup')
  signupUser(@Body() payload : SignupDto){
    return this.authService.signup(payload);
  }
  //login
  @Post('login')
  loginUser(@Body() payload : LoginDto){
    return this.authService.login(payload)
  }
  //refresh
  @UseGuards(AuthGuard)
  @Post('refresh')
  refreshToken(@Body() payload : {refreshToken : string}){
    return this.authService.refreshTokens(payload)
  }
}
