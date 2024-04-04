import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Article } from 'src/articles/entities/article.entity';
import { ResponseBody } from 'src/helpers/helper';
import { CustomError } from 'src/helpers/Error/customError';
import { selectedFields } from 'src/common/constants/selectionFields.constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Article) private articleRepository: Repository<Article>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private dataSource : DataSource
    ){}

    async getUserProfile(request : Request){
      try {
        let userId = request['user'].id;
        if(!userId) throw new CustomError('User not found', 409, '/login');

        const getUserProfile = await this.userRepository.findOne({where : {id : userId}, select : selectedFields});
        if(!getUserProfile) throw new CustomError('User not found', 409, '/login');

        return new ResponseBody(200, "User profile fetched successfully", getUserProfile, true)

      } catch (error) {
        throw error
      }
    }

    async getAllUserArticles(request : Request){
      try {
        let userId = request['user'].id;
        const findAllArticles = await this.articleRepository.find({where : {user : {id : userId}}});
        // if there are no articles we return an empty array not thrrowing any error
        return new ResponseBody(200, "Articles fetched successfully", findAllArticles, true)
      } catch (error) {
        throw error
      }
    }

    async upadteUserProfile(request : Request, payload : UpdateUserDto){
      const queryRunnner = this.dataSource.createQueryRunner()
      await queryRunnner.startTransaction();
      try {
        let userId = request['user'].id;
        const user = await this.userRepository.findOne({where : {id : userId}});

        if(!user) throw new CustomError('User not found', 409, '/login');

        //verify that the same user is updating the info
        if(user.id !== userId) throw new UnauthorizedException('You are not authorized to update this user');

        await this.userRepository.update({id : userId}, { ...payload });
        queryRunnner.commitTransaction();
        return new ResponseBody(200, "User profile updated successfully",  true)
      } catch (error) {
        await queryRunnner.rollbackTransaction()
        throw error
      }
    }

    async deleteUser(request : Request){
      const queryRunnner = this.dataSource.createQueryRunner();
      await queryRunnner.startTransaction();
      try {
        let userId = request['user'].id;
        const user = await this.userRepository.findOne({where : {id : userId}});
        if(!user) throw new CustomError('User not found', 409, '/login');
        if(user.id !== userId) throw new UnauthorizedException('You are not authorized to delete this account');

        await this.userRepository.delete({id : userId});
        queryRunnner.commitTransaction();
        return new ResponseBody(200, "User deleted successfully",  true)
      } catch (error) {
        await queryRunnner.rollbackTransaction()
        throw error
      }
    }
}
