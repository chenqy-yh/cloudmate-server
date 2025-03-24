// import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
// import { Document } from "mongoose";

// @Schema()
// export class Message extends Document {

//     @Prop({ required: true })
//     topic: string;

//     @Prop({ required: true })
//     sender: string;

//     @Prop({ required: true })
//     receiver: string;

//     @Prop({ required: true })
//     content: string;

//     @Prop({ default: Date.now(), index: true })
//     timestamp: Date;

//     @Prop({ default: false, index: true })
//     read: boolean;

//     @Prop({ required: true })
//     from_me: boolean;
// }


// export const MessageSchema = SchemaFactory.createForClass(Message);

import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm'

@Entity()
export class Message {

    @ObjectIdColumn({})
    id?: ObjectId

    @Column()
    topic: string

    @Column()
    sender: string

    @Column()
    receiver: string

    @Column()
    content: string

    @Column()
    timestamp: Date

    @Column()
    read: boolean

    @Column()
    from_me: boolean
}

export type MessageProps = Pick<Message, 'topic' | 'sender' | 'receiver' | 'content' | 'read'>;
