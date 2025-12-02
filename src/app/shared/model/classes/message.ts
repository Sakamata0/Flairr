export interface Message {
    messageID: string
    senderID: string // ID
    receiverID: string // ID
    content: string
    dateSent: Date
    status: "sent" | "delivered" | "read"
    /** Methods */
    getMessage(): Message
    sendMessage(message: Message): void
}