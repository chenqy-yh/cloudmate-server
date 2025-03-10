import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {

    constructor(@InjectRepository(User) private userRepo: Repository<User>) { }


    async findAll() {
        return await this.userRepo.find();
    }

    async findUserByPhone(phone: string) {
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
