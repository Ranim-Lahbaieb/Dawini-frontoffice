export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type MessageType = 'PRIVATE' | 'GLOBAL';

export interface UserSummary {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  picture?: string | null;
  roles: string[];
}

export interface ConnectionRequestDto {
  id: number;
  sender: UserSummary;
  receiver: UserSummary;
  status: RequestStatus;
  createdAt: string;
}

export interface ChatMessageDto {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number | null;
  receiverName: string | null;
  content: string;
  type: MessageType;
  sentAt: string;
  readFlag: boolean;
}
