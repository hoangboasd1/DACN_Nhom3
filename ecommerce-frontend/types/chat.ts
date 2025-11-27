export interface Message {
  id: number;
  senderId: number;
  senderName: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  isFromAdmin: boolean;
}

export interface Conversation {
  otherUserId: number;
  otherUserName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
}
