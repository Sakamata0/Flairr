import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { MiniProfileCard } from "../../shared/components/mini-profile-card/mini-profile-card";
import { CardPanel } from "../../shared/components/card-panel/card-panel";
import { Router } from '@angular/router';
import { NotificationsSelector } from "../../shared/components/notifications/notifications-selector/notifications-selector";
import { supabase } from '../../core/supabase/supabase.client';
import { NotificationsContainer } from "../../shared/components/notifications/notifications-container/notifications-container";
import { Subscription } from 'rxjs';
import { CommonModule, NgIf } from '@angular/common';
import { NotificationsService } from '../../core/services/notifications.service';
import { Notification } from '../../shared/model/notification.type';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule, MiniProfileCard, CardPanel, NotificationsSelector, NotificationsContainer, NgIf],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit, OnDestroy {
  selectedNotifications: string = "all";
  notifications: Notification[] = [];
  loading = true;
  currentUser: any = null;
  
  private subscription?: Subscription;
  private realtimeChannel?: any;

  shortcuts = [
      {id: '1', title: 'Web Developers Space', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: '+1.5M Passionates', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'Visit', buttonAction: () => { this.router.navigate(['/profile-name']);} },
      {id: '2', title: 'Angular Space', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: '+800k Passionates', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'Visit', buttonAction: () => { console.log('Button clicked'); } },
      {id: '3', title: 'Artists Space', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: '+2M Passionates', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'Visit', buttonAction: () => { console.log('Button clicked'); } }
  ];

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private router: Router,
    private notificationsService: NotificationsService,

  ) {}

  async ngOnInit() {
    // Subscribe to notifications observable
    this.subscription = this.notificationsService.notifications$.subscribe(
      notifications => {
        this.notifications = notifications;
      }
    );

    // Fetch initial notifications
    await this.notificationsService.fetchNotifications();

    // Subscribe to real-time updates
    const userId = await this.notificationsService.getUserId();
    if (userId) {
      this.realtimeChannel = this.notificationsService.subscribeToNotifications(userId);
    }
    
    await this.loadCurrentUser();
    this.loading = false;
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.notificationsService.unsubscribeFromNotifications();
  }

  onModeChange(mode: string) {
    this.selectedNotifications = mode;
  }

  async markAllAsRead() {
    await this.notificationsService.markAllAsRead();
  }
  hasUnreadNotifications()
  {
    return this.notifications.some(n => n.status === 'unread');
  }
  async loadCurrentUser() {
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('full_name, avatar_img')
        .eq('user_id', data.user.id)
        .single();

      this.currentUser = {
        name: userData?.full_name || 'User',
        avatarUrl: userData?.avatar_img || 'assets/icons/post/avatar-img.avif'
      };
    } catch (err) {
      console.error('loadCurrentUser error:', err);
    }
  }
}