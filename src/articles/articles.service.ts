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

  async createArticle(payload: CreateArticleDto, userId : number, file: Express.Multer.File) {
    try {
      const { content, description, title } = payload
      let image = file;

      if (!content || !description || !title) throw new BadRequestException('All fields are required')
      console.log(userId);
      const user = await this.userRepository.findOne({ where: { id: userId }, select: selectedFields })
      if (!user) throw new NotFoundException('User not found')

      const cloudinaryData = await this.cloudinaryService.uploadImage(image.path);

      const newArticle = this.articleRepository.create({
        author : user.name,
        content,
        description,
        title,
        image: {
          public_id: cloudinaryData.public_id,
          url: cloudinaryData.secure_url
        },
        user: user
      })

      console.log(newArticle);

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
  async updateArticle(articleId: number, payload: UpdateArticleDto, userId: number, file : Express.Multer.File) {
    try {
      let updatedImage = file;
      const findArticle = await this.articleRepository.findOne({ where: { id: articleId }, select: { user: { id: true, name: true, username: true } }, 
      relations: ['user'], });

      if (!findArticle) throw new NotFoundException('No such article found');
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new UnauthorizedException('User not found')

      if (findArticle.user.id !== userId) throw new UnauthorizedException('You are not authorized to update this article');
      if(updatedImage){
        const cloudinaryData = await this.cloudinaryService.uploadImage(updatedImage.path);
        await this.articleRepository.update({ id: articleId }, { ...findArticle, ...payload, image : { public_id : cloudinaryData.public_id, url : cloudinaryData.secure_url } })
        fs.unlinkSync(updatedImage.path);
        return new ResponseBody(201, 'Article updated successfully', {}, true);
      }

      await this.articleRepository.update({ id: articleId }, { ...findArticle, ...payload })
      return new ResponseBody(201, 'Article updated successfully ', {}, true);
    } catch (error) {
      throw error
    }
  }

  async removeArticle(articleId : number, userId : number) {
    try {
      const findUser = await this.userRepository.findOne({where : {id : userId}});
      //checking if the user exists
      if(!findUser) throw new NotFoundException('User not found');
      //fetching the article of the user
      const findArticle = await this.articleRepository.findOne({where : {id : articleId}, select : {user : { id : true, username : true }}, relations : ['user']});

      if(!findArticle) throw new NotFoundException('No such article found');

      if(findArticle.user.id !== userId) throw new UnauthorizedException('You are not authorized to delete this article');
      //deleting the article
      await this.articleRepository.delete({id : articleId});

      return new ResponseBody(201, 'Article deleted successfully', findArticle);
    } catch (error) {
      throw error
    }
  }


}
