import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RoleEnum } from "../enums/user.enum";
import { Article } from "src/articles/entities/article.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({type : 'varchar',nullable : false})
    name: string;

    @Column({type : 'varchar', unique : true, nullable : false})
    username : string;

    @Column({unique : true, nullable : false, type : 'varchar'})
    email : string;

    @Column({nullable : false, type : 'varchar'})
    password : string;

    @Column({nullable : true, type : 'varchar'})
    refreshToken : string;

    @Column({type : 'enum', enum : RoleEnum, default : RoleEnum.USER})
    role : RoleEnum;

    @OneToMany(() => Article, (article) => article.user_id)
    articles : Article[]
}
