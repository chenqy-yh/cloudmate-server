import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';


@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService) { }


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
        return {
            access_token: token
        }
    }

}
