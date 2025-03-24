import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 从 Authorization 头部获取 token
            ignoreExpiration: false, // 不忽略过期
            secretOrKey: configService.get<string>('JWT_SECRET'), // 读取环境变量中的密钥
        });
    }

    async validate(payload: UserPayload) {
        return { uuid: payload.uuid, phone: payload.phone };
    }
}
