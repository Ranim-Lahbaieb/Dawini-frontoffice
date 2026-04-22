import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import * as Stomp from 'stompjs';
import { ChatMessageDto, ConnectionRequestDto } from '../../models/chat.model';
import { AuthService } from './auth.service';

/**
 * Single STOMP client for the chat feature. The JWT is attached as a CONNECT
 * header and validated server-side by a ChannelInterceptor.
 *
 * Subscriptions:
 *   /user/queue/messages     — private messages addressed to me (sender gets an echo too)
 *   /user/queue/invitations  — connection-request events for me
 *   /topic/global            — admin broadcasts
 */
@Injectable({ providedIn: 'root' })
export class ChatWsService implements OnDestroy {
  private static readonly WS_URL = 'http://localhost:8020/api/ws-chat';

  private client: any = null;
  private connected = false;

  private readonly privateMessage$ = new Subject<ChatMessageDto>();
  private readonly globalMessage$  = new Subject<ChatMessageDto>();
  private readonly invitation$     = new Subject<ConnectionRequestDto>();

  constructor(private auth: AuthService) {}

  get onPrivateMessage(): Observable<ChatMessageDto> { return this.privateMessage$.asObservable(); }
  get onGlobalMessage():  Observable<ChatMessageDto> { return this.globalMessage$.asObservable(); }
  get onInvitation():     Observable<ConnectionRequestDto> { return this.invitation$.asObservable(); }

  async connect(): Promise<void> {
    if (this.connected) return;

    const token = this.auth.getToken();
    if (!token) throw new Error('Not authenticated');

    const SockJS = (await import('sockjs-client')).default;
    const socket = new SockJS(ChatWsService.WS_URL);
    this.client = Stomp.over(socket);
    this.client.debug = () => {};

    return new Promise((resolve, reject) => {
      this.client.connect(
        { Authorization: `Bearer ${token}` },
        () => {
          this.connected = true;

          this.client.subscribe('/user/queue/messages', (frame: any) => {
            if (frame.body) this.privateMessage$.next(JSON.parse(frame.body));
          });
          this.client.subscribe('/user/queue/invitations', (frame: any) => {
            if (frame.body) this.invitation$.next(JSON.parse(frame.body));
          });
          this.client.subscribe('/topic/global', (frame: any) => {
            if (frame.body) this.globalMessage$.next(JSON.parse(frame.body));
          });

          resolve();
        },
        (err: any) => {
          this.connected = false;
          reject(err);
        }
      );
    });
  }

  sendPrivate(receiverId: number, content: string): void {
    if (!this.connected) return;
    this.client.send('/app/chat.private', {}, JSON.stringify({ receiverId, content }));
  }

  sendGlobal(content: string): void {
    if (!this.connected) return;
    this.client.send('/app/chat.global', {}, JSON.stringify({ content }));
  }

  disconnect(): void {
    if (this.client && this.connected) {
      try { this.client.disconnect(() => {}); } catch { /* ignore */ }
    }
    this.connected = false;
    this.client = null;
  }

  ngOnDestroy(): void { this.disconnect(); }
}
