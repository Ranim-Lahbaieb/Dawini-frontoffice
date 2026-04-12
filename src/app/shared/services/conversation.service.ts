import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Conversation, ConversationInvitation, ChatMessage } from '../models/conversation.model';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private invitations$ = new BehaviorSubject<ConversationInvitation[]>([]);
  private conversations$ = new BehaviorSubject<Conversation[]>([]);
  private messages$ = new BehaviorSubject<ChatMessage[]>([]);
  private currentConversationId$ = new BehaviorSubject<string | null>(null);

  constructor() {
    this.loadData();
  }

  private loadData() {
    // Load from localStorage or API
    const saved = localStorage.getItem('chat_invitations');
    if (saved) {
      this.invitations$.next(JSON.parse(saved));
    }

    const conversations = localStorage.getItem('chat_conversations');
    if (conversations) {
      this.conversations$.next(JSON.parse(conversations));
    }
  }

  // Invitations
  getInvitations(): Observable<ConversationInvitation[]> {
    return this.invitations$.asObservable();
  }

  sendInvitation(invitation: ConversationInvitation): void {
    const current = this.invitations$.value;
    invitation.id = Date.now().toString();
    invitation.createdAt = new Date();
    invitation.status = 'pending';
    const updated = [...current, invitation];
    this.invitations$.next(updated);
    localStorage.setItem('chat_invitations', JSON.stringify(updated));
  }

  acceptInvitation(invitationId: string): void {
    const invitations = this.invitations$.value.map(inv => {
      if (inv.id === invitationId) {
        // Create conversation from accepted invitation
        const invitation = inv;
        const conversation: Conversation = {
          id: Date.now().toString(),
          participantIds: [invitation.receiverId, invitation.senderId],
          participantNames: [invitation.receiverName, invitation.senderName],
          participantAvatars: [invitation.senderAvatar|| '', ''],
          createdAt: new Date()
        };
        
        const conversations = this.conversations$.value;
        this.conversations$.next([...conversations, conversation]);
        localStorage.setItem('chat_conversations', JSON.stringify([...conversations, conversation]));

        return { ...inv, status: 'accepted' as const, updatedAt: new Date() };
      }
      return inv;
    });
    this.invitations$.next(invitations);
    localStorage.setItem('chat_invitations', JSON.stringify(invitations));
  }

  declineInvitation(invitationId: string): void {
    const invitations = this.invitations$.value.map(inv => {
      if (inv.id === invitationId) {
        return { ...inv, status: 'rejected' as const, updatedAt: new Date() };
      }
      return inv;
    });
    this.invitations$.next(invitations);
    localStorage.setItem('chat_invitations', JSON.stringify(invitations));
  }

  // Conversations
  getConversations(): Observable<Conversation[]> {
    return this.conversations$.asObservable();
  }

  selectConversation(conversationId: string): void {
    this.currentConversationId$.next(conversationId);
  }

  getCurrentConversation(): Observable<string | null> {
    return this.currentConversationId$.asObservable();
  }

  // Messages
  getMessages(): Observable<ChatMessage[]> {
    return this.messages$.asObservable();
  }

  addMessage(message: ChatMessage): void {
    const current = this.messages$.value;
    message.id = Date.now().toString();
    message.timestamp = new Date();
    const updated = [...current, message];
    this.messages$.next(updated);
    localStorage.setItem('chat_messages', JSON.stringify(updated));
  }

  getConversationMessages(conversationId: string): ChatMessage[] {
    return this.messages$.value.filter(msg => msg.conversationId === conversationId);
  }
}
