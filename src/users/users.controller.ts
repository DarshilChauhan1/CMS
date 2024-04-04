import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseFilters, UseGuards, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ExceptionHandling } from 'src/common/filters/exceptionHandling.filters';
import { AuthGuard } from 'src/auth/auth.guard';


@UseFilters(ExceptionHandling)
@UseGuards(AuthGuard)
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //get user profile
  @Get('profile')
  getProfile(@Req() request : Request){
    return this.usersService.getUserProfile(request);
  }

  //get all the user articles
  @Get('articles')
  getAllUserArticles(@Req() request : Request){
    return this.usersService.getAllUserArticles(request);
  }

  //user profile upadate
  @Put('profile/:id')
  upadteUserProfile(@Req() request : Request, @Body() payload : UpdateUserDto){
    return this.usersService.upadteUserProfile(request, payload);
  }

  //user deletes his account
  @Delete('profile/:id')
  deleteUser(@Req() request : Request){
    return this.usersService.deleteUser(request);
  }  
}
