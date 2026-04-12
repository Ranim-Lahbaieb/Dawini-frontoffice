export type ConversationStatus = 'pending' | 'accepted' | 'rejected';

export interface ConversationInvitation {
  id?: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  receiverName: string;
  status: ConversationStatus;
  message?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Conversation {
  id?: string;
  participantIds: [string, string]; // [user1, user2]
  participantNames: [string, string];
  participantAvatars?: [string, string];
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  createdAt?: Date;
}

export interface ChatMessage {
  id?: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp?: Date;
  read?: boolean;
}
