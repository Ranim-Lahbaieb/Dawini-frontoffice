import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private url = 'http://localhost:8080/api/connections';

  constructor(private http: HttpClient) { }

  sendInvitation(senderId: number, receiverId: number): Observable<any> {
    return this.http.post(`${this.url}/send?senderId=${senderId}&receiverId=${receiverId}`, {});
  }

  getPendingRequests(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/pending/${userId}`);
  }

  acceptRequest(requestId: number): Observable<any> {
    return this.http.put(`${this.url}/accept/${requestId}`, {});
  }
}