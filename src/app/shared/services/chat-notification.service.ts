import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { ChatWsService } from './chat-ws.service';
import { ChatMessageDto, ConnectionRequestDto } from '../../models/chat.model';

export type ChatNotificationKind = 'message' | 'invitation' | 'global';

export interface ChatNotification {
  id: string;
  kind: ChatNotificationKind;
  title: string;
  body: string;
  createdAt: Date;
  read: boolean;
  /** For private messages: the sender's user id (to jump into the right conversation). */
  senderId?: number | null;
}

const STORAGE_KEY = 'chat-notifications';
const MAX_NOTIFICATIONS = 30;

/**
 * Global chat notifications. Bootstraps the STOMP connection as soon as a user
 * is logged in and surfaces private messages, invitations and global broadcasts
 * as notifications shown in the top-bar notification dropdown.
 */
@Injectable({ providedIn: 'root' })
export class ChatNotificationService {
  private readonly _notifications$ = new BehaviorSubject<ChatNotification[]>([]);
  readonly notifications$: Observable<ChatNotification[]> = this._notifications$.asObservable();

  private readonly _unreadCount$ = new BehaviorSubject<number>(0);
  readonly unreadCount$: Observable<number> = this._unreadCount$.asObservable();

  /** The user id of a conversation currently open in the chat view, if any.
   *  Messages from that sender are auto-marked as read and don't produce a toast dot. */
  activeContactId: number | null = null;

  private initialized = false;
  private currentUserId: number | null = null;

  constructor(
    private auth: AuthService,
    private chatWs: ChatWsService,
    private zone: NgZone
  ) {
    this.restore();
    this.auth.user$.subscribe(u => this.onAuthUserChanged(u));
    // in case the auth service already has a user cached when we spin up
    const existing = this.auth.getUser();
    if (existing) this.onAuthUserChanged(existing);
  }

  // ---------- public API ----------

  markAllRead(): void {
    const list = this._notifications$.value.map(n => n.read ? n : { ...n, read: true });
    this._notifications$.next(list);
    this.refreshUnread();
    this.persist();
  }

  dismiss(id: string): void {
    this._notifications$.next(this._notifications$.value.filter(n => n.id !== id));
    this.refreshUnread();
    this.persist();
  }

  clear(): void {
    this._notifications$.next([]);
    this._unreadCount$.next(0);
    this.persist();
  }

  // ---------- bootstrap ----------

  private onAuthUserChanged(user: any | null) {
    if (!user) {
      this.currentUserId = null;
      this.chatWs.disconnect();
      this.initialized = false;
      return;
    }

    this.currentUserId = user.id ?? null;

    if (this.initialized) return;
    this.initialized = true;

    // subscribe to chat events BEFORE connecting so we never miss early frames
    this.chatWs.onPrivateMessage.subscribe(msg => this.handlePrivate(msg));
    this.chatWs.onInvitation.subscribe(inv => this.handleInvitation(inv));
    this.chatWs.onGlobalMessage.subscribe(msg => this.handleGlobal(msg));

    this.chatWs.connect().catch(err => {
      console.error('[ChatNotificationService] WS connect failed', err);
      this.initialized = false;
    });
  }

  // ---------- handlers ----------

  private handlePrivate(msg: ChatMessageDto) {
    // Skip our own echoes
    if (this.currentUserId != null && msg.senderId === this.currentUserId) return;
    // Skip messages for the conversation currently open on screen
    if (this.activeContactId != null && msg.senderId === this.activeContactId) return;

    this.push({
      id: `msg-${msg.id}`,
      kind: 'message',
      title: msg.senderName || 'Nouveau message',
      body: msg.content,
      createdAt: new Date(msg.sentAt),
      read: false,
      senderId: msg.senderId,
    });
  }

  private handleInvitation(inv: ConnectionRequestDto) {
    if (this.currentUserId == null) return;
    const isForMe = inv.receiver?.id === this.currentUserId && inv.status === 'PENDING';
    const isReplyToMe = inv.sender?.id === this.currentUserId && inv.status !== 'PENDING';

    if (isForMe) {
      this.push({
        id: `inv-${inv.id}`,
        kind: 'invitation',
        title: 'Nouvelle invitation',
        body: `${inv.sender.firstName} ${inv.sender.lastName} vous a envoyé une invitation`,
        createdAt: new Date(inv.createdAt),
        read: false,
      });
    } else if (isReplyToMe) {
      const verb = inv.status === 'ACCEPTED' ? 'a accepté' : 'a refusé';
      this.push({
        id: `inv-reply-${inv.id}`,
        kind: 'invitation',
        title: 'Réponse à votre invitation',
        body: `${inv.receiver.firstName} ${inv.receiver.lastName} ${verb} votre invitation`,
        createdAt: new Date(),
        read: false,
      });
    }
  }

  private handleGlobal(msg: ChatMessageDto) {
    if (this.currentUserId != null && msg.senderId === this.currentUserId) return;
    this.push({
      id: `global-${msg.id}`,
      kind: 'global',
      title: `📢 ${msg.senderName}`,
      body: msg.content,
      createdAt: new Date(msg.sentAt),
      read: false,
    });
  }

  // ---------- internals ----------

  private push(n: ChatNotification) {
    this.zone.run(() => {
      const current = this._notifications$.value;
      if (current.some(x => x.id === n.id)) return; // dedupe by id
      const next = [n, ...current].slice(0, MAX_NOTIFICATIONS);
      this._notifications$.next(next);
      this.refreshUnread();
      this.persist();
    });
  }

  private refreshUnread() {
    this._unreadCount$.next(this._notifications$.value.filter(n => !n.read).length);
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._notifications$.value));
    } catch { /* ignore quota / ssr */ }
  }

  private restore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: ChatNotification[] = JSON.parse(raw).map((n: any) => ({
        ...n, createdAt: new Date(n.createdAt)
      }));
      this._notifications$.next(parsed);
      this.refreshUnread();
    } catch { /* ignore */ }
  }
}
