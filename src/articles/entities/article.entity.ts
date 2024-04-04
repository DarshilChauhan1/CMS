import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('articles')
export class Article {
    @PrimaryGeneratedColumn()
    id : number;

    @Column({type : 'varchar', nullable : false})
    title : string;

    @Column({type : 'varchar', nullable : false})
    description : string;

    @Column({type : 'varchar', nullable : false})
    content : string;

    @Column({type : 'varchar', nullable : false})
    author : string;

    @Column({type : 'json', nullable : true})
    image : {
        public_id : string,
        url : string,
    }

    @JoinColumn({name : 'user_id'})
    @ManyToOne(() => User, (user) => user.articles, {onDelete : 'CASCADE'})
    user : User
}
