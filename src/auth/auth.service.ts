import { BadRequestException, ConflictException, Injectable, NotFoundException, Res, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ResponseBody } from 'src/helpers/helper';
import { CustomError } from 'src/helpers/Error/customError';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { selectedFields } from 'src/common/constants/selectionFields.constants';

@Injectable()
export class AuthService {
    constructor(
        private configService: ConfigService,
        private readonly jwtService: JwtService,
        @InjectRepository(User) private readonly userRepository: Repository<User>) { }

    //Signup method for user password handled by pre hook
    async signup(userPayload: SignupDto) {
        try {
            const { name, username, email, password } = userPayload;
            if (username && email && password && name) {
                //selected fields are from user entity without password
                const existUser = await this.userRepository.findOne({where : [{username}, {email}], select : selectedFields});
                console.log(existUser);
                if (existUser) throw new ConflictException('User already exists');

                //Hashing the password
                const hashedPassword = await bcrypt.hash(password, 10);

                const newUser =  this.userRepository.create({name, username, email, password: hashedPassword});
                await this.userRepository.save(newUser);

                return new ResponseBody(201, "new user created","", true);
            } else {
                throw new BadRequestException('All fields are compulsory')
            }
        } catch (error) {
            console.log("Error---->", error)
            throw error
        }
    }

    async login(userPayload: LoginDto) {
        try {
            const { username, password } = userPayload;
            if (username && password) {
                const verifyUser = await this.userRepository.findOne({where : {username}})
                if (!verifyUser) throw new NotFoundException('User not found')

                //Camparing the passwords
                const verifyPass = await bcrypt.compare(password, verifyUser.password)
                if (!verifyPass) throw new UnauthorizedException('Password is incorrect')
                //if user verified then generate access and refresh tokens

                const accessToken = await this.jwtService.signAsync(
                    { id: verifyUser.id, username: verifyUser.username },
                    {
                        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
                        expiresIn: '3h'
                    });

                const refreshToken = await this.jwtService.signAsync({
                    id: verifyUser.id
                },
                    {
                        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
                        expiresIn: '2d'
                    }
                )

                verifyUser.refreshToken = refreshToken;

                await this.userRepository.save(verifyUser);
                const data = {
                    user : {
                        username : verifyUser.username,
                        name : verifyUser.name,
                        email : verifyUser.email,
                        id : verifyUser.id
                    },
                    accessToken: accessToken,
                    refreshToken: refreshToken
                }
                return new ResponseBody(200, "Login Successfully", data)
            } else {
                throw new BadRequestException('All fields are required')
            }
        } catch (error) {
            console.log('Error-->', error)
            throw error
        }
    }

    async refreshTokens(tokenPayload : {refreshToken : string}) {
        try {
            const {refreshToken} = tokenPayload;
            if(refreshToken){
                const decode = await this.jwtService.verifyAsync(refreshToken, {secret : this.configService.get('REFRESH_TOKEN_SECRET')})
                if(decode){
                    // if the refresh token is not expired we generate a new Access token
                    const user = await this.userRepository.findOne({where : {id : decode.id}, select : selectedFields});
                    if(!user) throw new UnauthorizedException('User does not exists')
                    //verify the refresh token
                    if(user.refreshToken != refreshToken) throw new ConflictException('Refresh token is not the same')
                    const accessToken = await this.jwtService.signAsync({id : decode.id}, {secret : this.configService.get('ACCESS_TOKEN_SECRET'), expiresIn : '3h'})

                    //return new accessToken with data
                    return new ResponseBody(201, "AccessToken generated", {...user, accessToken : accessToken} )
                } else {
                    // if the refresh token is expired we will redirect the user to login
                    throw new CustomError("refresh token expired", 409, "/login")
                }

            } else {
                throw new BadRequestException('Refresh token is required')
            }
        } catch (error) {
            throw error
        }
    }


    async logout(request : Request){
        try {
            const userId = request['user'].id
            if(!userId) throw new NotFoundException('User not found');

            const findUser = await this.userRepository.findOne({where : {id : userId}})

            if(!findUser) throw new ConflictException('Invalid Id')

            findUser.refreshToken = null;
            await this.userRepository.save(findUser);

            return new ResponseBody(200, "User logged out successfully")
            
        } catch (error) {
            throw error
        }
    }

}
