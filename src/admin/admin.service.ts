import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/articles/entities/article.entity';
import { User } from 'src/users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { LoginAdminDto } from './dto/admin.dto';
import { Request } from 'express';
import { ResponseBody } from 'src/helpers/helper';
import { selectedFields } from 'src/common/constants/selectionFields.constants';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { UpdateArticleDto } from 'src/articles/dto/update-article.dto';

@Injectable()
export class AdminService {
    constructor(
        private dataSource : DataSource,
        @InjectRepository(Article) private readonly articleRepository: Repository<Article>,
        @InjectRepository(User) private readonly userRepository: Repository<User>) {}

    async adminDashborad(userId : number) {
        try {

            const user = await this.userRepository.findOne({where : {id : userId}, select : selectedFields});
            if(!user) throw new NotFoundException('User does not exits');
            //will fetch all the users
            const getAllUsers = await this.userRepository.find();
            // will fetch all the articles
            const getAllArticles = await this.articleRepository.find();
            let data = {
                users : getAllUsers.length,
                articles : getAllArticles.length,
                admin : user
            }

            return new ResponseBody(200, "Admin dashboard fetched successfully", data, true)
            
        } catch (error) {
            throw error
        }
    }

    async getAllUsers(userId : number){
        try {
            const user = await this.userRepository.findOne({where : {id : userId}, select : selectedFields});
            if(!user) throw new NotFoundException('User does not exits');
            //getting all the users details
            const getAllUsers = await this.userRepository.find({ select: selectedFields });

            return new ResponseBody(200, "Users fetched successfully", getAllUsers, true);
        } catch (error) {
            throw error
        }
    }

    async removeUsers(payload : {users : string[]}) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.startTransaction();
        try {
            let {users} = payload;
            // removing multiple users
            for (const user of users) {
                // deleting multiple users
                await this.userRepository.delete({id : parseInt(user)});
            }
            await queryRunner.commitTransaction();
            return new ResponseBody(200, "Users deleted successfully", {}, true);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error
        }
    }

    async updateUsers(payload : [{id : string, updatePayload : UpdateUserDto}]) {
        const queryRunner = this.dataSource.createQueryRunner();
        try {
            const userUpdateWithPayload = payload;
            for (const user of userUpdateWithPayload) {
                await this.userRepository.update({id : parseInt(user.id)}, {...user.updatePayload});
            }
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error
        }
    }


    async getAllArticles(){
        try {
            const allArticles = await this.articleRepository.find({select : {user : {id : true, username : true, name : true}},relations : ['user']});
            return new ResponseBody(200, "Articles fetched successfully", allArticles, true)
        } catch (error) {
            throw error
        }
    }

    async removeArticles(payload : {articles : string[]}) {
        let queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.startTransaction();
        try {
            let {articles} = payload;
            for (const article of articles) {
                await this.articleRepository.delete({id : parseInt(article)});
            }
            await queryRunner.commitTransaction();

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error
        }
    }

    async updateArticles(payload : [{id : string, articlePayload : UpdateArticleDto}]) {
        let queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.startTransaction();
        try {
            for (const article of payload) {
                await this.articleRepository.update({id : parseInt(article.id)}, {...article.articlePayload});
            }
            await queryRunner.commitTransaction();
            return new ResponseBody(200, "Articles updated successfully", {}, true)

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error
        }
    }



}
