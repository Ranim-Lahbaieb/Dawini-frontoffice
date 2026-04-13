import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatMessageDto } from '../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatApiService {
  private readonly url = 'http://localhost:8020/api/messages';

  constructor(private http: HttpClient) {}

  getPrivateConversation(otherUserId: number): Observable<ChatMessageDto[]> {
    return this.http.get<ChatMessageDto[]>(`${this.url}/private/${otherUserId}`);
  }

  sendPrivate(receiverId: number, content: string): Observable<ChatMessageDto> {
    return this.http.post<ChatMessageDto>(`${this.url}/private`, { receiverId, content });
  }

  getGlobalHistory(): Observable<ChatMessageDto[]> {
    return this.http.get<ChatMessageDto[]>(`${this.url}/global`);
  }

  sendGlobal(content: string): Observable<ChatMessageDto> {
    return this.http.post<ChatMessageDto>(`${this.url}/global`, { content });
  }
}
