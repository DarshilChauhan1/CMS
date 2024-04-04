import { Body, Controller, Delete, Get, Post, Put, Req, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ExceptionHandling } from 'src/common/filters/exceptionHandling.filters';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { RoleDecorator } from 'src/common/decorators/role.decorator';
import { RoleEnum } from 'src/users/enums/user.enum';
import { Request } from 'express';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { UpdateArticleDto } from 'src/articles/dto/update-article.dto';

@UsePipes(ValidationPipe)
@UseFilters(ExceptionHandling)
@UseGuards(AuthGuard, RoleGuard)
@RoleDecorator(RoleEnum.ADMIN)
@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  //dashboard
  @Get('dashboard')
  adminDashboard(@Req() request: Request) {
    return this.adminService.adminDashborad(request['user'].id)
  }

  //alluser
  // in this we will show all users data except password
  @Get('dashboard/users')
  getAllUsers(@Req() request: Request) {
    return this.adminService.getAllUsers(request['user'].id);
  }

  //delete user
  // can delete any user
  @Delete('dashboard/users/remove')
  deleteUsers(@Body() payload: { users: string[] }) {
    return this.adminService.removeUsers(payload);
  }

  //update user
  //can update any member
  @Put('dashboard/users/update')
  upadateUsers(@Body() payload: [{ id: string, updatePayload: UpdateUserDto }], @Req() request: Request) {
    return this.adminService.updateUsers(payload);
  }


  //get all articles
  @Get('dashboard/articles')
  getAllArticles() {
    return this.adminService.getAllArticles();
  }

  //delete articles
  // can delete any article
  @Delete('dashboard/articles/remove')
  deleteArticles(@Body() payload: { articles: string[] }) {
    return this.adminService.removeArticles(payload);
  }

  //update any article
  // can update any article 
  @Put('dashboard/articles/update')
  updateArticles(@Body() payload: [{id : string, articlePayload : UpdateArticleDto}]) {
    return this.adminService.updateArticles(payload);
  }

}
