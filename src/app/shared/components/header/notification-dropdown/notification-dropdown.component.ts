import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import {
  ChatNotification,
  ChatNotificationService
} from '../../../services/chat-notification.service';

@Component({
  selector: 'app-notification-dropdown',
  templateUrl: './notification-dropdown.component.html',
  imports: [CommonModule, RouterModule, DropdownComponent, DropdownItemComponent]
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  isOpen = false;
  notifications: ChatNotification[] = [];
  unreadCount = 0;

  private subs: Subscription[] = [];

  constructor(
    private chatNotifications: ChatNotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subs.push(
      this.chatNotifications.notifications$.subscribe(list => this.notifications = list),
      this.chatNotifications.unreadCount$.subscribe(c => this.unreadCount = c),
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  get notifying(): boolean {
    return this.unreadCount > 0;
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.unreadCount > 0) {
      this.chatNotifications.markAllRead();
    }
  }

  closeDropdown() {
    this.isOpen = false;
  }

  openNotification(n: ChatNotification) {
    this.chatNotifications.dismiss(n.id);
    this.closeDropdown();
    this.router.navigate(['/chat']);
  }

  clearAll() {
    this.chatNotifications.clear();
  }

  iconFor(n: ChatNotification): string {
    switch (n.kind) {
      case 'message':    return '💬';
      case 'invitation': return '🤝';
      case 'global':     return '📢';
    }
  }

  timeAgo(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const diffMs = Date.now() - d.getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 1)   return 'à l\'instant';
    if (min < 60)  return `il y a ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24)    return `il y a ${h} h`;
    const days = Math.floor(h / 24);
    return `il y a ${days} j`;
  }

  trackById(_: number, n: ChatNotification) { return n.id; }
}
