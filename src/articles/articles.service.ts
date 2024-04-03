import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Like, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { ResponseBody } from 'src/helpers/helper';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import * as fs from 'node:fs'
import { selectedFields } from 'src/common/constants/selectionFields.constants';

@Injectable()
export class ArticlesService {
  constructor(
    private cloudinaryService : CloudinaryService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Article) private articleRepository: Repository<Article>) { }

  async getAllArticles(query: string) {
    let search = query;
    const allArticles = await this.articleRepository.find({ where: { title: Like(`%${search}%`) } })
    if (!allArticles) throw new NotFoundException("No such articles found")

    return new ResponseBody(200, "Articles fetched successfully", allArticles)
  }

  async createArticle(payload: CreateArticleDto, request: Request, file: Express.Multer.File) {
    try {
      const { content, description, title } = payload
      let image = file;

      if (!content || !description || !title) throw new BadRequestException('All fields are required')
      let userId = request['user'].id;
      const user = await this.userRepository.findOne({ where: { id: userId } , select : selectedFields})
      if (!user) throw new NotFoundException('User not found')

      const cloudinaryData = await this.cloudinaryService.uploadImage(image.path);

      const newArticle = this.articleRepository.create({
        author : user.name,
        content,
        description,
        title,
        image : {
          public_id : cloudinaryData.public_id,
          url : cloudinaryData.secure_url
        },
        user_id : user
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
}
