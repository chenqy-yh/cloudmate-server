type MessageItem = {
    event: string;
    message: any;
}
type PrivateMessage = {
    sender: string;
    receiver: string;
    content: string;
};

type QueryPrivateMessage = {
    sender: string;
    receiver: string;
}