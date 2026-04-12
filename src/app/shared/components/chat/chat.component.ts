import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConversationService } from '../../services/conversation.service';
import { Conversation, ConversationInvitation, ChatMessage } from '../../models/conversation.model';
import { Subscription } from 'rxjs';
import * as Stomp from 'stompjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ChatComponent implements OnInit, OnDestroy {
  // User info
  public currentUserId = "1";
  public currentUserName = "Dr. Ahmed";

  // UI State
  public view: 'conversations' | 'invitations' | 'send-invitation' = 'conversations';
  public selectedConversation: Conversation | null = null;

  // Data
  public conversations: Conversation[] = [];
  public invitations: ConversationInvitation[] = [];
  public messages: ChatMessage[] = [];
  public newMessage: string = "";
  
  // Form
  public invitationForm = {
    receiverId: '',
    receiverName: '',
    message: 'Je voudrais discuter avec vous'
  };

  // Mock users list (replace with API call)
  public availableUsers = [
    { id: '2', name: 'Dr. Fatima' },
    { id: '3', name: 'Dr. Mohamed' },
    { id: '4', name: 'Nurse Sarah' },
  ];

  private stompClient: any;
  private subscriptions: Subscription[] = [];
  private messageSubscription: any;

  constructor(private conversationService: ConversationService) {}

  ngOnInit() {
    this.setupConversationListeners();
    this.connect();
  }

  private setupConversationListeners() {
    this.subscriptions.push(
      this.conversationService.getConversations().subscribe(convs => {
        this.conversations = convs;
      }),
      this.conversationService.getInvitations().subscribe(invs => {
        this.invitations = invs;
      }),
      this.conversationService.getMessages().subscribe(msgs => {
        this.messages = msgs.filter(m => 
          this.selectedConversation ? m.conversationId === this.selectedConversation.id : false
        );
      }),
      this.conversationService.getCurrentConversation().subscribe(id => {
        const conv = this.conversations.find(c => c.id === id);
        this.selectedConversation = conv || null;
      })
    );
  }

  async connect() {
    try {
      const SockJS = (await import('sockjs-client')).default;
      const socket = new SockJS('http://localhost:8080/ws-chat');
      
      this.stompClient = Stomp.over(socket);
      this.stompClient.debug = () => {};

      this.stompClient.connect({}, () => {
        console.log('WebSocket connecté');
        
        // Subscribe to messages
        this.messageSubscription = this.stompClient.subscribe(
          '/user/' + this.currentUserId + '/topic/messages',
          (message: any) => {
            if (message.body) {
              const msg = JSON.parse(message.body);
              if (this.selectedConversation && msg.conversationId === this.selectedConversation.id) {
                this.conversationService.addMessage(msg);
              }
            }
          }
        );

        // Subscribe to invitations
        this.stompClient.subscribe(
          '/user/' + this.currentUserId + '/topic/invitations',
          (message: any) => {
            if (message.body) {
              const invitation = JSON.parse(message.body);
              this.conversationService.getInvitations();
            }
          }
        );
      }, (error: any) => {
        console.error('Erreur WebSocket:', error);
      });
    } catch (error) {
      console.error('Erreur chargement SockJS:', error);
    }
  }

  selectConversation(conversation: Conversation) {
    this.conversationService.selectConversation(conversation.id!);
    this.selectedConversation = conversation;
    this.view = 'conversations';
  }

  getPendingInvitations() {
    return this.invitations.filter(inv => inv.status === 'pending' && inv.receiverId === this.currentUserId);
  }

  getSentInvitations() {
    return this.invitations.filter(inv => inv.status === 'pending' && inv.senderId === this.currentUserId);
  }

  acceptInvitation(invitation: ConversationInvitation) {
    this.conversationService.acceptInvitation(invitation.id!);
  }

  declineInvitation(invitation: ConversationInvitation) {
    this.conversationService.declineInvitation(invitation.id!);
  }

  sendInvitation() {
    if (!this.invitationForm.receiverId) return;

    const invitation: ConversationInvitation = {
      senderId: this.currentUserId,
      senderName: this.currentUserName,
      receiverId: this.invitationForm.receiverId,
      receiverName: this.invitationForm.receiverName,
      message: this.invitationForm.message,
      status: 'pending'
    };

    this.conversationService.sendInvitation(invitation);
    this.resetInvitationForm();
    this.view = 'invitations';
  }

  private resetInvitationForm() {
    this.invitationForm = {
      receiverId: '',
      receiverName: '',
      message: 'Je voudrais discuter avec vous'
    };
  }

  sendMessage() {
    if (!this.selectedConversation || !this.newMessage.trim()) return;

    const message: ChatMessage = {
      conversationId: this.selectedConversation.id!,
      senderId: this.currentUserId,
      senderName: this.currentUserName,
      content: this.newMessage
    };

    this.conversationService.addMessage(message);

    // Send via WebSocket
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send('/app/chat', {}, JSON.stringify(message));
    }

    this.newMessage = "";
  }

  getContactName(conversation: Conversation): string {
    return conversation.participantIds[0] === this.currentUserId 
      ? conversation.participantNames[1] 
      : conversation.participantNames[0];
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.disconnect(() => {});
    }
  }
}