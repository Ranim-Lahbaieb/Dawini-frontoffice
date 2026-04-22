import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConnectionRequestDto, UserSummary } from '../../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ConnectionService {
  private readonly url = 'http://localhost:8020/api/connections';

  constructor(private http: HttpClient) {}

  sendInvitation(receiverId: number): Observable<ConnectionRequestDto> {
    return this.http.post<ConnectionRequestDto>(`${this.url}/send`, { receiverId });
  }

  acceptRequest(requestId: number): Observable<ConnectionRequestDto> {
    return this.http.put<ConnectionRequestDto>(`${this.url}/${requestId}/accept`, {});
  }

  rejectRequest(requestId: number): Observable<ConnectionRequestDto> {
    return this.http.put<ConnectionRequestDto>(`${this.url}/${requestId}/reject`, {});
  }

  getPending(): Observable<ConnectionRequestDto[]> {
    return this.http.get<ConnectionRequestDto[]>(`${this.url}/pending`);
  }

  getSent(): Observable<ConnectionRequestDto[]> {
    return this.http.get<ConnectionRequestDto[]>(`${this.url}/sent`);
  }

  getAccepted(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(`${this.url}/accepted`);
  }

  getAvailableUsers(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(`${this.url}/available-users`);
  }
}
