import { Global, Module } from "@nestjs/common";
import { MessageService } from "./message.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from 'src/entity/message.entity'

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([Message], 'mongoConnection')
    ],
    providers: [MessageService],
    exports: [MessageService]
})
export class MessageModule { }