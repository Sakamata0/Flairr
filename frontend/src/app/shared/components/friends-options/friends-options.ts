import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-friends-options',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './friends-options.html',
  styleUrl: './friends-options.css'
})
export class FriendsOptions {
  @Output() selectedOption = new EventEmitter<{ key: number; name: string }>();

  friendsOpTypes = [
    {
      key: 0,
      name: 'Follow Request',
      icon: 'user-plus'
    },
    {
      key: 1,
      name: 'Suggestions',
      icon: 'users'
    },
    {
      key: 2,
      name: 'All Followers',
      icon: 'user-check'
    },
    {
      key: 3,
      name: 'All Following',
      icon: 'user-heart'
    },
  ];

  activefriendsOpTypesKey = 0;

  constructor(private sanitizer: DomSanitizer) { }

  setActivefriendsOpTypes(key: number) {
    this.activefriendsOpTypesKey = key;
    const selected = this.friendsOpTypes.find(f => f.key === key);
    if (selected) this.selectedOption.emit(selected);
  }

  getIconSvg(icon: string, isActive: boolean): SafeHtml {
    const color = isActive ? '#ffffff' : '#6b7280';
    const stroke = 1.8;

    const icons: Record<string, string> = {
      'user-plus': `
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
        fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M19 8v6"/>
        <path d="M22 11h-6"/>
      </svg>
    `,
      'users': `
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
        fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="7" r="4"/>
        <path d="M17 11a4 4 0 1 0-4-4"/>
        <path d="M2 21v-2a4 4 0 0 1 4-4h6"/>
        <path d="M14 15h4a4 4 0 0 1 4 4v2"/>
      </svg>
    `,
      'user-check': `
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
        fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="7" r="4"/>
        <path d="M2 21v-2a4 4 0 0 1 4-4h6"/>
        <path d="M16 11l2 2 4-4"/>
      </svg>
    `,
      'user-heart': `
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
        fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="7" r="4"/>
        <path d="M2 21v-2a4 4 0 0 1 4-4h6"/>
        <path d="M17.5 8.5c1.5-1.5 4-1.5 5.5 0s1.5 4 0 5.5L18 19l-5-5"/>
      </svg>
    `
    };

    return this.sanitizer.bypassSecurityTrustHtml(icons[icon] ?? '');
  }

}