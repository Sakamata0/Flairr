import { Component, computed, input } from '@angular/core';
import { Notification } from '../../model/notification.type';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-notifications-container',
  imports: [],
  templateUrl: './notifications-container.html',
  styleUrl: './notifications-container.css'
})

export class NotificationsContainer {
  currentFilter = input<string>('all');

  Notifications = input<Notification[]>([
    {id: "N00001", name: "Skander Boughnimi", profileUrl: "assets/images/skander.png", iconUrl: "assets/icons/panel/like.png", action: "liked your Flurr!", date: "2025-12-02T19:00:00.000Z", status: "unread"},
    {id: "N00001", name: "Skander Boughnimi", profileUrl: "assets/images/skander.png", iconUrl: "assets/icons/panel/like.png", action: "liked your Flurr!", date: "2025-12-02T18:40:00.000Z", status: "unread"},
    {id: "N00001", name: "Skander Boughnimi", profileUrl: "assets/images/skander.png", iconUrl: "assets/icons/panel/like.png", action: "liked your Flurr!", date: "2025-12-02T18:40:00.000Z", status: "read"},
    {id: "N00001", name: "Skander Boughnimi", profileUrl: "assets/images/skander.png", iconUrl: "assets/icons/panel/like.png", action: "liked your Flurr!", date: "2025-12-02T18:40:00.000Z", status: "unread"},
    {id: "N00001", name: "Skander Boughnimi", profileUrl: "assets/images/skander.png", iconUrl: "assets/icons/panel/like.png", action: "liked your Flurr!", date: "2025-12-02T18:40:00.000Z", status: "read"},
    {id: "N00001", name: "Skander Boughnimi", profileUrl: "assets/images/skander.png", iconUrl: "assets/icons/panel/like.png", action: "liked your Flurr!", date: "2025-12-02T18:40:00.000Z", status: "read"},
    {id: "N00001", name: "Skander Boughnimi", profileUrl: "assets/images/skander.png", iconUrl: "assets/icons/panel/like.png", action: "liked your Flurr!", date: "2025-12-02T18:40:00.000Z", status: "unread"}
  ]);

  filteredNotifications = computed(() => {
    const allNotifs = this.Notifications();
    const filter = this.currentFilter();

    if (filter === 'all') {
      return allNotifs;
    }

    return allNotifs.filter(n => n.status === filter);
  });

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
