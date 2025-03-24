export const genTopic = (sender: string, receiver: string) => `chat:private:${sender}:${receiver}`;

export const PrivateChatEvent = (uuid: string) => `private_chat_${uuid}`;