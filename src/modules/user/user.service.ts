import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class UserService {

    @InjectRepository(User, 'postgresConnection')
    private readonly userRepo: Repository<User>;

    // constructor(
    //     @InjectRepository(User, 'userConnection')
    //     private readonly userRepo: Repository<User>
    // ) { }

    async findAll(uuid: string) {
        return await this.userRepo.find({
            where: {
                uuid: Not(uuid)
            },
            select: ['uuid', 'email', 'phone', 'name']
        });

    }

    async findUserByPhone(phone: string): Promise<User> {
        try {
            const user = await this.userRepo.findOne({
                where: { phone }
            });
            if (!user) {
                throw new HttpException('用户不存在', 404);
            }
            return user;
        } catch (error) {
            Logger.error(error);
            throw new HttpException('服务器异常', 500);
        }
    }

    async findUserByPayload(payload: UserPayload) {
        try {
            const user = await this.userRepo.findOne({
                where: { uuid: payload.uuid }
            });
            if (!user) {
                throw new HttpException('用户不存在', 404);
            }
            return user;
        } catch (error) {
            Logger.error(error);
            throw new HttpException('服务器异常', 500);
        }
    }



}
