import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseFilters, UseGuards, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ExceptionHandling } from 'src/common/filters/exceptionHandling.filters';
import { AuthGuard } from 'src/auth/auth.guard';



@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  //singup
  @Post('signup')
  signup(@Body() payload: CreateUserDto) {
    return this.usersService.signup(payload)
  }
  //get user profile
  @UseFilters(ExceptionHandling)
  @UseGuards(AuthGuard)
  @Get('api/users/profile')
  getProfile(@Req() request: Request) {
    return this.usersService.getUserProfile(request);
  }

  //get all the user articles
  @UseFilters(ExceptionHandling)
  @UseGuards(AuthGuard)
  @Get('api/users/articles')
  getAllUserArticles(@Req() request: Request) {
    return this.usersService.getAllUserArticles(request);
  }

  //user profile upadate
  @UseFilters(ExceptionHandling)
  @UseGuards(AuthGuard)
  @Put('api/users/profile/:id')
  upadteUserProfile (@Body() payload: UpdateUserDto, @Param('id') params: number) {
    return this.usersService.upadteUserProfile(payload, params);
  }

  //user deletes his account
  @UseFilters(ExceptionHandling)
  @UseGuards(AuthGuard)
  @Delete('api/users/profile/:id')
  deleteUser(@Param('id') params : number) {
    return this.usersService.deleteUser(params);
  }
}
