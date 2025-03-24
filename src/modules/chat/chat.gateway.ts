import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { MessageProps } from '../../entity/message.entity';
import { AuthService } from '../auth/auth.service';
import { MessageService } from '../message/message.service';
import { PrivateChatEvent, genTopic } from './utils';



@Injectable()
export class ChatService implements OnModuleInit {
    @WebSocketServer()
    private server: Server;

    @Inject()
    private readonly authService: AuthService;

    @Inject()
    private readonly messageService: MessageService;

    private onlineUsers: Map<string, WebSocket> = new Map();

    onModuleInit() {
        this.server = new Server({ port: 3001, path: '/ws' });

        this.server.on('connection', (client: WebSocket, req: any) => {
            const uuid = this.authenticateClient(client, req);
            if (!uuid) return;

            this.setUserOnline(uuid, client);

            client.on('message', async (data: string) => {
                try {
                    this.handlerMessage(data);
                } catch (error) {
                    this.sendError(client, error);
                }

            });

            client.on('close', () => this.setUserOffline(uuid));
        });
    }

    /**
     * @description 处理消息
     * 
     */
    private handlerMessage(data: string) {
        const parse_data = JSON.parse(data) as MessageItem;
        const { event, message } = parse_data;
        const handler = this[`handle${event}`];
        handler && handler.call(this, message);
    }


    /**
     * 客户端认证
     */
    private authenticateClient(client: WebSocket, req: any): string | null {
        const auth = req.headers['authorization'];
        const udt = req.headers['x-unique-device-token'];
        const uuid = req.headers['x-user-uuid'];

        if (!auth || !udt || !uuid) {
            this.sendError(client, 'Missing authentication headers', true);
            return null;
        }

        if (!this.authService.validateJwtToken(auth) || !this.authService.validateUDT(uuid, udt)) {
            this.sendError(client, 'Unauthorized', true);
            return null;
        }

        return uuid;
    }


    private sendMessagesToClient(client: WebSocket, message: MessageItem) {
        client.send(JSON.stringify(message));
    }

    /**
     * 存储消息
     */
    private async storeMessage(message: MessageProps) {
        await this.messageService.saveMessage(message);
    }

    /**
     * 查找未发送的消息
     */
    private async findUnsentMessages(uuid: string) {
        return this.messageService.getMessages(uuid, { receiver: uuid, sent: false });
    }

    /**
     * 发送未读消息
     */
    private async sendCachedMessages(uuid: string) {
        const client = this.onlineUsers.get(uuid);
        if (!client) return;

        const messages = await this.findUnsentMessages(uuid);
        if (messages.length) {
            this.messageService.markMessageAsRead(uuid, messages);
        }
    }

    /**
     * 设置用户在线
     */
    private async setUserOnline(uuid: string, client: WebSocket) {
        this.onlineUsers.set(uuid, client);
        Logger.log(`User ${uuid} is now online.`, 'ChatService');
    }

    /**
     * 设置用户离线
     */
    private setUserOffline(uuid: string) {
        if (this.onlineUsers.delete(uuid)) {
            Logger.log(`User ${uuid} is now offline.`, 'ChatService');
        }
    }

    /**
     * 检查用户是否在线
     */
    private isUserOnline(uuid: string): boolean {
        return this.onlineUsers.has(uuid);
    }

    /**
     * 发送错误消息
     */
    private sendError(client: WebSocket, message: string, close = false) {
        client.send(JSON.stringify({ event: 'error', data: message }));
        close && client.close();
    }

    // ------------------- 以下是消息处理函数 -------------------

    /**
     * 处理私聊消息
     */
    private async handleSendPrivateMessage(message: PrivateMessage) {
        const { sender, content, receiver } = message;
        Logger.log(`Received private message from ${sender} to ${receiver}`, 'ChatService');
        try {
            await this.storeMessage({
                sender,
                receiver,
                content,
                topic: genTopic(sender, receiver),
                read: false,
            });


            if (this.isUserOnline(receiver)) {
                const receiver_client = this.onlineUsers.get(receiver)!;
                this.sendMessagesToClient(receiver_client, { event: PrivateChatEvent(receiver), message });
            }
        } catch (error) {
            Logger.error(error, 'ChatGateWay - handleSendPrivateMessage');
            this.sendError(this.onlineUsers.get(sender)!, error);
        }

    }

    /**
     * @description 处理获取私聊消息
     * 
     */
    private async handleGetPrivateMessages(message: QueryPrivateMessage) {
        Logger.log('handleGetPrivateMessages', 'ChatService');
        const { sender, receiver } = message;
        // 查询 sender 和 receiver 之间的消息
        const history = await this.messageService.getMessages(sender, {
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ]
        })
        const client = this.onlineUsers.get(sender);
        if (client) {
            this.sendMessagesToClient(client, { event: 'private_message', message: history });
        }
    }


}
