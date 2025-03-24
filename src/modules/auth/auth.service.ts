import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/modules/user/user.service';
import { RedisService } from '../redis/redis.service'
import { generateId } from 'src/utils/uuid';
import { UDT_KEY } from 'src/guard/unque-device.guard';

@Injectable()
export class AuthService {

    @Inject()
    private readonly userService: UserService;

    @Inject()
    private readonly jwtService: JwtService;

    @Inject()
    private readonly redisService: RedisService;


    // 用于生成Jwt token
    async generateToken(payload: UserPayload) {
        return this.jwtService.sign(payload);
    }

    // 登录验证
    async validateUser(inputPhone: string, inputPw: string) {
        const user = await this.userService.findUserByPhone(inputPhone);
        if (!user) throw new UnauthorizedException('用户名或密码输入错误');
        const { password: realPw } = user;
        if (inputPw !== realPw) throw new UnauthorizedException('用户名或密码输入错误');
        const token = await this.generateToken({ uuid: user.uuid + "", phone: user.phone });

        const udt = generateId();

        this.redisService.set(UDT_KEY(user.uuid), udt, 60 * 60 * 24 * 7);

        return {
            access_token: token,
            ['x-unique-device-token']: udt,
            ['x-user-uuid']: user.uuid
        }
    }


    validateJwtToken(token: string) {
        try {
            const format_token = token.replace('Bearer ', '');
            return this.jwtService.verify(format_token);
        } catch (error) {
            return false;
        }

    }

    async validateUDT(uuid: string, udt: string) {
        const stored_udt = await this.redisService.get(UDT_KEY(uuid));
        return stored_udt === udt;
    }



}
