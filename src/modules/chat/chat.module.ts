import { Module } from '@nestjs/common';
import { ChatService } from './chat.gateway';

@Module({
    providers: [ChatService],
})

export class ChatModule { };