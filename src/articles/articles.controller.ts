import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Put, Query, UseFilters, UseGuards, UseInterceptors, UploadedFile, UsePipes, ValidationPipe } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ExceptionHandling } from 'src/common/filters/exceptionHandling.filters';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterCustomOptions } from 'src/common/config/multer.config';

@UseFilters(ExceptionHandling)
@UsePipes(ValidationPipe)
@UseGuards(AuthGuard)
@Controller('api/articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  getAllArticles(@Query('search') search : string) {
    return this.articlesService.getAllArticles(search);
  }
  //create article
  @UseInterceptors(FileInterceptor('file', MulterCustomOptions))
  @Post('create') 
  createArticle(@Body() payload : CreateArticleDto, @Req() request : Request, @UploadedFile() file : Express.Multer.File ){
    return this.articlesService.createArticle(payload, request['user'].id, file);
  }
  //update article
  @UseInterceptors(FileInterceptor('file', MulterCustomOptions))
  @Put(':articleId')
  updateArticle(@Param('articleId') id: number, @Body() payload : UpdateArticleDto, @Req() request : Request, @UploadedFile() file : Express.Multer.File) {
    return this.articlesService.updateArticle(id, payload, request['user'].id, file);
  }

  //delete article
  @Delete(':articleId')
  removeArticles(@Param('articleId') id: number, @Req() request : Request) {
    return this.articlesService.removeArticle(id, request['user'].id);
  }
}
