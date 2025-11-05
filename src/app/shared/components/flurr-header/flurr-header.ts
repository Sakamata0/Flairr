import { Component, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-flurr-header',
    standalone: true,            // 👈 important!
    imports: [CommonModule],     // 👈 gives access to *ngFor, *ngIf, etc.
    templateUrl: './flurr-header.html',
    styleUrls: ['./flurr-header.css']
})
export class FlurrHeaderComponent {
    @Output() searchChange = new EventEmitter<string>();

    activeKey: string | null = null;

    items = [
        { key: 'home', label: 'Home', icon: 'fa fa-home' },
        { key: 'explore', label: 'Explore', icon: 'fa fa-compass' },
        { key: 'friends', label: 'Friends', icon: 'fa fa-clock-rotate-left' },
        { key: 'spaces', label: 'Spaces', icon: 'fa fa-users' },
    ];

    constructor(private elementRef: ElementRef<HTMLElement>) {}

    // toggle expand/collapse when clicking an icon
    toggle(key: string, event?: Event) {
        event?.stopPropagation();
        this.activeKey = this.activeKey === key ? null : key;
    }

    // live search emitter
    onSearch(event: Event) {
        const q = (event.target as HTMLInputElement).value;
        this.searchChange.emit(q);
    }

    /**
     * Keyboard handler used by the template:
     * (keydown)="onKeydown($event, i)"
     *
     * - Enter / Space: toggle the focused item
     * - ArrowLeft / ArrowRight: move focus between items
     */
    onKeydown(e: KeyboardEvent, index: number) {
        const key = e.key;
        if (key === 'Enter' || key === ' ') {
            // prevent page scroll on Space
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

    // collapse when clicking outside the header or outside the center nav
    @HostListener('document:click', ['$event'])
    onDocClick(ev: MouseEvent) {
        const target = ev.target as Node;
        if (!this.elementRef.nativeElement.contains(target) || !(target as Element).closest('.center')) {
            this.activeKey = null;
        }
    }

    // optional helper to programmatically close all
    closeAll() {
        this.activeKey = null;
    }
}
