import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {

    private redis_host;
    private redis_port;
    private redis_passsword;
    private redisClient: Redis;

    constructor(
        private configService: ConfigService
    ) {
        this.redis_host = this.configService.get('REDIS_HOST');
        this.redis_port = this.configService.get('REDIS_PORT');
        this.redis_passsword = this.configService.get('REDIS_PASSWORD');
    }

    onModuleDestroy() {
        this.redisClient.quit();
    }
    onModuleInit() {
        this.redisClient = new Redis({
            port: this.redis_port,
            host: this.redis_host,
            password: this.redis_passsword
        })

        this.redisClient.on('connect', () => {
            Logger.log('Redis connected', 'RedisService');
        })

        this.redisClient.on('error', (err) => {
            Logger.error(err, 'RedisService');
        })
    }

    async set(key: string, value: string, expire?: number) {
        if (expire) {
            await this.redisClient.set(key, value, 'EX', expire);
        } else {
            await this.redisClient.set(key, value);
        }
    }

    async get(key: string): Promise<string | null> {
        return this.redisClient.get(key);
    }

    async delete(key: string) {
        await this.redisClient.del(key);
    }


    async keys(pattern: string): Promise<string[]> {
        return this.redisClient.keys(pattern);
    }


}