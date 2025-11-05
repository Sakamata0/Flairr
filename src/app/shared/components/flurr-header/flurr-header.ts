import { Component, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-flurr-header',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './flurr-header.html',
    styleUrls: ['./flurr-header.css']
})

export class FlurrHeaderComponent {
    @Output() searchChange = new EventEmitter<string>();

    activeKey: string | null = null;
    profileOpen = false;

    items = [
        { key: 'home', label: 'Home' },
        { key: 'explore', label: 'Explore' },
        { key: 'friends', label: 'Friends' },
        { key: 'spaces', label: 'Spaces' }
    ];

    constructor(private elementRef: ElementRef<HTMLElement>) {}

    toggle(key: string, event?: Event) {
        event?.stopPropagation();
        this.activeKey = this.activeKey === key ? null : key;
    }

    onSearch(event: Event) {
        const q = (event.target as HTMLInputElement).value;
        this.searchChange.emit(q);
    }

    onKeydown(e: KeyboardEvent, index: number) {
        const key = e.key;
        if (key === 'Enter' || key === ' ') {
            e.preventDefault();
            const item = this.items[index];
            this.toggle(item.key);
            return;
        }
        if (key === 'ArrowRight' || key === 'ArrowLeft') {
            e.preventDefault();
            const dir = key === 'ArrowRight' ? 1 : -1;
            const len = this.items.length;
            const nextIndex = (index + dir + len) % len;
            const nav = this.elementRef.nativeElement.querySelector('.center');
            if (!nav) return;
            const buttons = Array.from(nav.querySelectorAll<HTMLElement>('.icon-item'));
            buttons[nextIndex]?.focus();
        }
    }

    // single document click handler
    @HostListener('document:click', ['$event'])
    onDocumentClick(ev: MouseEvent) {
        const target = ev.target as Node;
        const center = this.elementRef.nativeElement.querySelector('.center');
        if (center && !center.contains(target as Node)) {
        this.activeKey = null;
        }
        const wrap = this.elementRef.nativeElement.querySelector('.avatar-wrap');
        if (wrap && !wrap.contains(target as Node)) {
        this.profileOpen = false;
        wrap.classList.remove('profile-open');
        }
    }

    toggleProfile(ev?: Event) {
        ev?.stopPropagation();
        this.profileOpen = !this.profileOpen;
        console.log('toggleProfile called, profileOpen=', this.profileOpen);
        const wrap = this.elementRef.nativeElement.querySelector('.avatar-wrap');
        if (wrap) {
        wrap.classList.toggle('profile-open', this.profileOpen);
        }
    }

    onImgError(ev: Event, key: string) {
        console.error('Icon failed to load:', { triedPath: `/assets/icons/header/${key}.png`, event: ev });
    }
}
