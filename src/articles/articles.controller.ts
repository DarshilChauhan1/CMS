import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Put, Query, UseFilters, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ExceptionHandling } from 'src/common/filters/exceptionHandling.filters';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterCustomOptions } from 'src/common/config/multer.config';

@UseFilters(ExceptionHandling)
@UseGuards(AuthGuard)
@Controller('api/articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  getAllArticles(@Query('search') search : string) {
    
  }
  //create article
  @UseInterceptors(FileInterceptor('file', MulterCustomOptions))
  @Post('create') 
  createArticle(@Body() payload : CreateArticleDto, @Req() request : Request, @UploadedFile() file : Express.Multer.File ){
    return this.articlesService.createArticle(payload, request, file);
  }
  //update article
  @Put(':id')
  updateArticle(@Param('id') id: string, @Body() payload : UpdateArticleDto) {
    
  }

  //delete article
  @Delete(':id')
  removeArticles(@Param('id') id: string) {
    
  }
}
