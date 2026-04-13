import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ConnectionService } from '../../services/connection.service';
import { ChatApiService } from '../../services/chat-api.service';
import { ChatWsService } from '../../services/chat-ws.service';
import { AuthService } from '../../services/auth.service';
import { ChatNotificationService } from '../../services/chat-notification.service';
import {
  ChatMessageDto,
  ConnectionRequestDto,
  UserSummary
} from '../../models/chat.model';

type View = 'conversations' | 'invitations' | 'send-invitation' | 'global';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('messagesScroll') private messagesScroll?: ElementRef<HTMLDivElement>;
  @ViewChild('globalScroll') private globalScroll?: ElementRef<HTMLDivElement>;
  private shouldScrollPrivate = false;
  private shouldScrollGlobal = false;

  // ---- current user ----
  currentUserId: number | null = null;
  currentUserName = '';
  isAdmin = false;

  // ---- UI state ----
  view: View = 'conversations';
  selectedContact: UserSummary | null = null;

  // ---- data ----
  contacts: UserSummary[] = [];                     // accepted connections (private convos)
  receivedInvitations: ConnectionRequestDto[] = [];
  sentInvitations: ConnectionRequestDto[] = [];
  availableUsers: UserSummary[] = [];
  messages: ChatMessageDto[] = [];                  // messages for selected private conv
  globalMessages: ChatMessageDto[] = [];

  newMessage = '';
  newGlobalMessage = '';
  userSearchQuery = '';

  private subs: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private connections: ConnectionService,
    private chatApi: ChatApiService,
    private chatWs: ChatWsService,
    private chatNotifications: ChatNotificationService
  ) {}

  // ========================= lifecycle =========================

  async ngOnInit() {
    const user = this.auth.getUser();
    if (user) this.applyUser(user);
    else {
      this.auth.user$.subscribe(u => { if (u) this.applyUser(u); });
      this.auth.loadUser();
    }

    this.refreshAll();

    try {
      await this.chatWs.connect();
    } catch (e) {
      console.error('WebSocket connection failed', e);
    }

    this.subs.push(
      this.chatWs.onPrivateMessage.subscribe(msg => this.handleIncomingPrivate(msg)),
      this.chatWs.onGlobalMessage.subscribe(msg => {
        this.globalMessages.push(msg);
        this.shouldScrollGlobal = true;
      }),
      this.chatWs.onInvitation.subscribe(inv => this.handleIncomingInvitation(inv))
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    // WS connection is owned by ChatNotificationService so that
    // notifications keep flowing when navigating away from /chat.
    this.chatNotifications.activeContactId = null;
  }

  ngAfterViewChecked() {
    if (this.shouldScrollPrivate && this.messagesScroll) {
      const el = this.messagesScroll.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScrollPrivate = false;
    }
    if (this.shouldScrollGlobal && this.globalScroll) {
      const el = this.globalScroll.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScrollGlobal = false;
    }
  }

  private applyUser(u: any) {
    this.currentUserId = u?.id ?? null;
    this.currentUserName = `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim();
    const roles: string[] = (u?.roles ?? []).map((r: any) => r?.name ?? r);
    this.isAdmin = roles.includes('ROLE_ADMIN');
  }

  // ========================= data loading =========================

  refreshAll() {
    this.loadContacts();
    this.loadInvitations();
    this.loadAvailableUsers();
    this.loadGlobalHistory();
  }

  private loadContacts() {
    this.connections.getAccepted().subscribe({
      next: list => this.contacts = list,
      error: err => console.error('getAccepted', err)
    });
  }

  private loadInvitations() {
    this.connections.getPending().subscribe({
      next: list => this.receivedInvitations = list,
      error: err => console.error('getPending', err)
    });
    this.connections.getSent().subscribe({
      next: list => this.sentInvitations = list.filter(r => r.status === 'PENDING'),
      error: err => console.error('getSent', err)
    });
  }

  private loadAvailableUsers() {
    this.connections.getAvailableUsers().subscribe({
      next: list => this.availableUsers = list,
      error: err => console.error('getAvailableUsers', err)
    });
  }

  private loadGlobalHistory() {
    this.chatApi.getGlobalHistory().subscribe({
      next: list => { this.globalMessages = list; this.shouldScrollGlobal = true; },
      error: err => console.error('getGlobalHistory', err)
    });
  }

  // ========================= conversations =========================

  selectContact(contact: UserSummary) {
    this.selectedContact = contact;
    this.view = 'conversations';
    this.chatNotifications.activeContactId = contact.id;
    this.chatApi.getPrivateConversation(contact.id).subscribe({
      next: list => { this.messages = list; this.shouldScrollPrivate = true; },
      error: err => console.error('getPrivateConversation', err)
    });
  }

  sendMessage() {
    if (!this.selectedContact || !this.newMessage.trim()) return;
    const receiverId = this.selectedContact.id;
    const content = this.newMessage.trim();
    this.newMessage = '';
    this.chatApi.sendPrivate(receiverId, content).subscribe({
      next: saved => {
        if (!this.messages.some(m => m.id === saved.id)) {
          this.messages.push(saved);
          this.shouldScrollPrivate = true;
        }
      },
      error: err => console.error('sendPrivate', err)
    });
  }

  private handleIncomingPrivate(msg: ChatMessageDto) {
    if (!this.selectedContact || this.currentUserId == null) return;
    const otherId = this.selectedContact.id;
    const belongsToOpenConv =
      (msg.senderId === otherId && msg.receiverId === this.currentUserId) ||
      (msg.senderId === this.currentUserId && msg.receiverId === otherId);
    if (belongsToOpenConv && !this.messages.some(m => m.id === msg.id)) {
      this.messages.push(msg);
      this.shouldScrollPrivate = true;
    }
  }

  // ========================= invitations =========================

  acceptInvitation(inv: ConnectionRequestDto) {
    this.connections.acceptRequest(inv.id).subscribe({
      next: () => { this.loadInvitations(); this.loadContacts(); this.loadAvailableUsers(); },
      error: err => console.error('accept', err)
    });
  }

  rejectInvitation(inv: ConnectionRequestDto) {
    this.connections.rejectRequest(inv.id).subscribe({
      next: () => { this.loadInvitations(); this.loadAvailableUsers(); },
      error: err => console.error('reject', err)
    });
  }

  sendInvitationTo(user: UserSummary) {
    this.connections.sendInvitation(user.id).subscribe({
      next: () => {
        this.userSearchQuery = '';
        this.loadInvitations();
        this.loadAvailableUsers();
        this.view = 'invitations';
      },
      error: err => console.error('sendInvitation', err)
    });
  }

  get filteredAvailableUsers(): UserSummary[] {
    const q = this.userSearchQuery.trim().toLowerCase();
    if (!q) return this.availableUsers;
    return this.availableUsers.filter(u =>
      `${u.firstName} ${u.lastName} ${u.username}`.toLowerCase().includes(q)
    );
  }

  private handleIncomingInvitation(inv: ConnectionRequestDto) {
    // Any invitation update (sent-to-me pending, accepted/rejected reply) — just refetch.
    this.loadInvitations();
    if (inv.status === 'ACCEPTED') this.loadContacts();
  }

  // ========================= global chat =========================

  sendGlobalMessage() {
    if (!this.isAdmin || !this.newGlobalMessage.trim()) return;
    this.chatWs.sendGlobal(this.newGlobalMessage.trim());
    this.newGlobalMessage = '';
  }

  // ========================= view helpers =========================

  fullName(u: UserSummary): string {
    return `${u.firstName} ${u.lastName}`.trim();
  }

  isMine(msg: ChatMessageDto): boolean {
    return this.currentUserId != null && msg.senderId === this.currentUserId;
  }
}
