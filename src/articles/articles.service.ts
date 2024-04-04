import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Like, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { ResponseBody } from 'src/helpers/helper';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import * as fs from 'node:fs'
import { selectedFields } from 'src/common/constants/selectionFields.constants';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    private cloudinaryService: CloudinaryService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Article) private articleRepository: Repository<Article>) { }

  async getAllArticles(query: string) {
    //for the first time user can read all articles
    let search = query ? query : ""
    const allArticles = await this.articleRepository.find({ where: { title: Like(`%${search}%`) } })

    return new ResponseBody(200, "Articles fetched successfully", allArticles)
  }

  async createArticle(payload: CreateArticleDto, request: Request, file: Express.Multer.File) {
    try {
      const { content, description, title } = payload
      let image = file;

      if (!content || !description || !title) throw new BadRequestException('All fields are required')
      let userId = request['user'].id;
      const user = await this.userRepository.findOne({ where: { id: userId }, select: selectedFields })
      if (!user) throw new NotFoundException('User not found')

      const cloudinaryData = await this.cloudinaryService.uploadImage(image.path);

      const newArticle = this.articleRepository.create({
        author: user.name,
        content,
        description,
        title,
        image: {
          public_id: cloudinaryData.public_id,
          url: cloudinaryData.secure_url
        },
        user: user
      })

      await this.articleRepository.save(newArticle);
      fs.unlinkSync(image.path);
      return new ResponseBody(201, 'Article created successfully', newArticle)
    }
    catch (error) {
      console.log(error)
      throw error
    }
  }


  //todo image change
  async updateArticle(articleId: string, payload: UpdateArticleDto, request: Request) {
    try {
      let userId = request['user'].id;
      const findArticle = await this.articleRepository.findOne({ where: { id: parseInt(articleId) }, select: { user: { id: true, name: true, username: true } }, 
      relations: ['user'], });

      if (!findArticle) throw new NotFoundException('No such article found');
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new UnauthorizedException('User not found')

      if (findArticle.user.id !== userId) throw new UnauthorizedException('You are not authorized to update this article');

      await this.articleRepository.update({ id: parseInt(articleId) }, { ...findArticle, ...payload })
      return new ResponseBody(201, 'Article updated successfully', findArticle);
    } catch (error) {
      throw error
    }
  }

  async removeArticle(articleId : string, request : Request) {
    try {
      let userId = request['user'].id;
      const findUser = await this.userRepository.findOne({where : {id : userId}});
      //checking if the user exists
      if(!findUser) throw new NotFoundException('User not found');
      //fetching the article of the user
      const findArticle = await this.articleRepository.findOne({where : {id : parseInt(articleId)}, select : {user : { id : true, username : true }}, relations : ['user']});

      if(!findArticle) throw new NotFoundException('No such article found');

      if(findArticle.user.id !== userId) throw new UnauthorizedException('You are not authorized to delete this article');
      //deleting the article
      await this.articleRepository.delete({id : parseInt(articleId)});

      return new ResponseBody(201, 'Article deleted successfully', findArticle);
    } catch (error) {
      throw error
    }
  }


}
