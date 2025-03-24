import { Injectable, Logger } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { Message, MessageProps } from "src/entity/message.entity";
import { DataSource } from "typeorm";
import { MongoClient } from 'mongodb'

@Injectable()
export class MessageService {
    private readonly logger = new Logger(MessageService.name);

    private mongoClient: MongoClient;

    constructor(@InjectDataSource('mongoConnection') private readonly dataSource: DataSource) {
        const mongoOptions = this.dataSource.options as any;
        this.mongoClient = new MongoClient(mongoOptions.url);
        this.mongoClient.connect().catch(err => {
            this.logger.error(`Failed to connect to MongoDB: ${err.message}`);
        });

    }


    /**
     * @description get user message model, if user does not have  message model, it will create a new model for the user
     * 
     */
    private async getMessageCollection(uuid: string) {
        const collectionName = `messages_${uuid}`;
        const db = this.mongoClient.db(this.dataSource.options.database as string);

        const collectionExists = await this.hasCollection(collectionName);
        if (!collectionExists) {
            await db.createCollection(collectionName);
            this.logger.log(`Created new message collection for user: ${uuid}`);
        }

        return db.collection<Message>(collectionName);
    }


    /**
     * @description get user message model
     * 
     */
    private async hasCollection(collection_name: string) {
        try {
            const db = this.mongoClient.db(this.dataSource.options.database as string);
            const collections = await db.listCollections().toArray();
            return collections.some(col => col.name === collection_name);
        } catch (error) {
            this.logger.error(`Error checking message model: ${error.message}`);
            return false;
        }
    }




    /**
     * @description save user message
     * 
     */
    async saveMessage(message_props: MessageProps) {
        try {
            const { sender, receiver, ...rest } = message_props;
            const sender_collection = await this.getMessageCollection(sender);
            const receiver_collection = await this.getMessageCollection(receiver);

            const message: Omit<Message, 'from_me'> = {
                ...rest,
                receiver,
                sender,
                timestamp: new Date(),
                read: false,
            };

            const sender_save = await sender_collection.insertOne({
                ...message,
                from_me: true,
            });

            const receiver_save = await receiver_collection.insertOne({
                ...message,
                from_me: false,
            });

            this.logger.log(`Saved message from ${sender} to ${receiver}`);
            return await Promise.all([sender_save, receiver_save]);
        } catch (error) {
            this.logger.error(`Failed to save message: ${error.message}`);
            throw error;
        }
    }


    /**
  * @description Get user messages with optional filters.
  */
    async getMessages(uuid: string, filter: Object = {}) {
        try {
            const msg_collection = await this.getMessageCollection(uuid);
            const messages = await msg_collection.find(filter).sort({ timestamp: 1 }).toArray();

            this.logger.log(`Retrieved ${messages.length} messages for sender: ${uuid}`);
            return messages as Message[];
        } catch (error) {
            this.logger.error(`Failed to get messages: ${error.message}`);
            throw error;
        }
    }

    /**
     * @description Mark messages as read
     */
    async markMessageAsRead(uuid: string, messages: Message[]) {
        try {
            const msg_collection = await this.getMessageCollection(uuid);
            const message_ids = messages.map(msg => msg.id);
            return msg_collection.updateMany({ id: { $in: message_ids } }, { $set: { read: true } });
        } catch (error) {
            this.logger.error(`Failed to mark messages as read: ${error.message}`);
            throw error;
        }
    }

}