import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ConfigModule } from '@nestjs/config';
import { LocationModule } from './location/location.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'yinhan',
      database: "cloudmate",
      entities: [User],
      synchronize: true,
      autoLoadEntities: true
    }), UserModule, AuthModule, AttendanceModule, LocationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
