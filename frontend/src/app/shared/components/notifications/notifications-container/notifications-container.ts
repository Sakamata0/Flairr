import { Component, computed, input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Notification } from '../../../model/notification.type';
import { Subscription } from 'rxjs';
import { NotificationsService } from '../../../../core/services/notifications.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-notifications-container',
  imports: [NgIf],
  templateUrl: './notifications-container.html',
  styleUrl: './notifications-container.css'
})
export class NotificationsContainer implements OnInit, OnDestroy {
  currentFilter = input<string>('all');
  Notifications = input<Notification[]>([]);
  openMenuId: string | null = null;
  
  private subscription?: Subscription;

  constructor(
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Only close if a menu is open
    if (this.openMenuId) {
      this.openMenuId = null;
    }
  }

  async ngOnInit() {
    this.subscription = this.notificationsService.notifications$.subscribe(
      notifications => {
        // Update handled in parent component
      }
    );
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  filteredNotifications = computed(() => {
    const allNotifs = this.Notifications();
    const filter = this.currentFilter();

    if (filter === 'all') {
      return allNotifs;
    }

    return allNotifs.filter(n => n.status === filter);
  });

  async onNotificationClick(notification: Notification) {
    if (notification.status === 'unread') {
      await this.notificationsService.markAsRead(notification.id);
    }

    if (notification.flurrId) {
      this.router.navigate(['/flurr', notification.flurrId]);
    } else if (notification.type === 'follow' && notification.actorId) {
      this.router.navigate(['/profile', notification.actorId]);
    }
  }

  async deleteNotification(event: Event, notificationId: string) {
    event.stopPropagation();
    await this.notificationsService.deleteNotification(notificationId);
    this.openMenuId = null;
  }

  getTimeAgo(date: string | Date): string {
    const now = new Date();
    const past = new Date(date);
    const diff = (now.getTime() - past.getTime()) / 1000;

    if (diff < 60) return `${Math.floor(diff)}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;

    const monthsDiff = (now.getFullYear() - past.getFullYear()) * 12 + (now.getMonth() - past.getMonth());
    if (monthsDiff < 12) return `${monthsDiff}mo`;

    const yearsDiff = now.getFullYear() - past.getFullYear();
    return `${yearsDiff}y`;
  }

  openOptions(ev: Event, notificationId: string) {
    ev.stopPropagation();
    this.openMenuId = this.openMenuId === notificationId ? null : notificationId;
  }

  isMenuOpen(notificationId: string): boolean {
    return this.openMenuId === notificationId;
  }
}