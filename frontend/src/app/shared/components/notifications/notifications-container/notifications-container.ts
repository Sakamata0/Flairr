import { Component, computed, input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Notification } from '../../../model/notification.type';
import { Subscription } from 'rxjs';
import { NotificationsService } from '../../../../core/services/notifications.service';

@Component({
  selector: 'app-notifications-container',
  imports: [],
  templateUrl: './notifications-container.html',
  styleUrl: './notifications-container.css'
})
export class NotificationsContainer implements OnInit, OnDestroy {
  currentFilter = input<string>('all');
  
  // This will now come from the service instead of hardcoded
  Notifications = input<Notification[]>([]);
  
  private subscription?: Subscription;

  constructor(
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Subscribe to notifications from service
    this.subscription = this.notificationsService.notifications$.subscribe(
      notifications => {
        // Update the component's notifications
        // Note: Since Notifications is an input signal, 
        // we'll handle this in the parent component instead
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
    // Mark as read if unread
    if (notification.status === 'unread') {
      await this.notificationsService.markAsRead(notification.id);
    }

    // Navigate to the flurr if it exists
    if (notification.flurrId) {
      this.router.navigate(['/flurr', notification.flurrId]);
    } else if (notification.type === 'follow' && notification.actorId) {
      // Navigate to the actor's profile for follow notifications
      this.router.navigate(['/profile', notification.actorId]);
    }
  }

  async deleteNotification(event: Event, notificationId: string) {
    event.stopPropagation(); // Prevent navigation when deleting
    await this.notificationsService.deleteNotification(notificationId);
  }

  getTimeAgo(date: string | Date): string {
    const now = new Date();
    const past = new Date(date);
    const diff = (now.getTime() - past.getTime()) / 1000; // in seconds

    if (diff < 60) return `${Math.floor(diff)}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;

    const monthsDiff = (now.getFullYear() - past.getFullYear()) * 12 + (now.getMonth() - past.getMonth());
    if (monthsDiff < 12) return `${monthsDiff}mo`;

    const yearsDiff = now.getFullYear() - past.getFullYear();
    return `${yearsDiff}y`;
  }
}