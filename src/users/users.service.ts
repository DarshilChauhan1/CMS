import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Article } from 'src/articles/entities/article.entity';
import { ResponseBody } from 'src/helpers/helper';
import { CustomError } from 'src/helpers/Error/customError';
import { selectedFields } from 'src/common/constants/selectionFields.constants';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Article) private articleRepository: Repository<Article>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private dataSource: DataSource
  ) { }

  async signup(userPayload: CreateUserDto) {
    try {
      const { name, username, email, password } = userPayload;
      if (username && email && password && name) {
        //selected fields are from user entity without password
        const existUser = await this.userRepository.findOne({ where: [{ username }, { email }], select: selectedFields });
        console.log(existUser);
        if (existUser) throw new ConflictException('User already exists');

        //Hashing the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = this.userRepository.create({ name, username, email, password: hashedPassword });
        await this.userRepository.save(newUser);

        return new ResponseBody(201, "new user created", "", true);
      } else {
        throw new BadRequestException('All fields are compulsory')
      }
    } catch (error) {
      console.log("Error---->", error)
      throw error
    }
  }


  async getUserProfile(id: number) {
    try {
      let userId = id;
      if (!userId) throw new CustomError('User not found', 409, '/login');

      const getUserProfile = await this.userRepository.findOne({ where: { id: userId }, select: selectedFields });
      if (!getUserProfile) throw new CustomError('User not found', 409, '/login');

      return new ResponseBody(200, "User profile fetched successfully", getUserProfile, true)

    } catch (error) {
      throw error
    }
  }

  async getAllUserArticles(id : number) {
    try {
      let userId = id;
      const findAllArticles = await this.articleRepository.find({ where: { user: { id: userId } } });
      // if there are no articles we return an empty array not thrrowing any error
      return new ResponseBody(200, "Articles fetched successfully", findAllArticles, true)
    } catch (error) {
      throw error
    }
  }

  async upadteUserProfile( payload: UpdateUserDto, id: number) {
    const queryRunnner = this.dataSource.createQueryRunner()
    await queryRunnner.startTransaction();
    try {
      let userId = id;
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) throw new CustomError('User not found', 409, '/login');

      //verify that the same user is updating the info
      if (user.id !== userId) throw new UnauthorizedException('You are not authorized to update this user');

      await this.userRepository.update({ id: userId }, { ...payload });
      queryRunnner.commitTransaction();
      return new ResponseBody(200, "User profile updated successfully", true)
    } catch (error) {
      await queryRunnner.rollbackTransaction()
      throw error
    }
  }

  async deleteUser(id : number) {
    const queryRunnner = this.dataSource.createQueryRunner();
    await queryRunnner.startTransaction();
    try {
      let userId = id;
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new CustomError('User not found', 409, '/login');
      if (user.id !== userId) throw new UnauthorizedException('You are not authorized to delete this account');

      await this.userRepository.delete({ id: userId });
      queryRunnner.commitTransaction();
      return new ResponseBody(200, "User deleted successfully", true)
    } catch (error) {
      await queryRunnner.rollbackTransaction()
      throw error
    }
  }
}
