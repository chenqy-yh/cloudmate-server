import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "src/entity/message.entity";
import { User } from "src/entity/user.entity";

@Module({
    imports: [
        // MongoDB 数据源（用于 Message）
        TypeOrmModule.forRootAsync({
            name: 'mongoConnection', // 命名数据源
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mongodb',
                url: `mongodb://154.8.165.31:27017`, // 固定 URL 或从 configService 获取
                database: configService.get('MONGO_DB'),
                entities: [Message],
                synchronize: false
            }),
        }),

        // PostgreSQL 数据源（用于 User）
        TypeOrmModule.forRootAsync({
            name: 'postgresConnection', // 命名数据源
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('TYPEORM_HOST'),
                port: configService.get('TYPEORM_PORT'),
                username: configService.get('TYPEORM_USERNAME'),
                password: configService.get('TYPEORM_PASSWORD'),
                database: configService.get('TYPEORM_DATABASE'),
                entities: [User],
                synchronize: true,
                autoLoadEntities: true,
            }),
        }),

        // 为特定实体注册对应的 Repository
        TypeOrmModule.forFeature([Message], 'mongoConnection'),
        TypeOrmModule.forFeature([User], 'postgresConnection'),
    ],
})
export class DatabaseModule { }