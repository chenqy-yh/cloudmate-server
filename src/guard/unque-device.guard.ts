import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { RedisService } from 'src/modules/redis/redis.service';

export const UDT_KEY = (uuid) => `ud_token:${uuid}`

@Injectable()
export class UniqueDeviceGuard implements CanActivate {
    @Inject()
    private readonly redisService: RedisService;


    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();

        const udt = req.headers['x-unique-device-token'];
        const x_user_uuid = req.headers['x-user-uuid'];

        if (!udt || !x_user_uuid) {
            throw new UnauthorizedException('请先登录');
        }

        const stored_udt = await this.redisService.get(UDT_KEY(x_user_uuid));

        if (stored_udt !== udt) {
            throw new UnauthorizedException('登录状态已过期');
        }

        return Promise.resolve(true);
    }
}

