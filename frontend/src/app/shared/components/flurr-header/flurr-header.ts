import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { AuthService } from '../../../core/auth/auth.service';
import { supabase } from '../../../core/supabase/supabase.client';
import { LogoutDialog } from '../logout-dialog/logout-dialog';

@Component({
    selector: 'app-flurr-header',
    standalone: true,
    imports: [CommonModule, RouterModule,NgIf],
    templateUrl: './flurr-header.html',
    styleUrls: ['./flurr-header.css']
})
export class FlurrHeaderComponent {

    @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

    activeKey: string | null = null;
    profileOpen = false;

    searchOpen = false;
    loading = false;

    users: any[] = [];
    spaces: any[] = [];

    defaultAvatar = '/assets/default-user.png';
    defaultSpace = '/assets/default-space.png';

    items = [
        { key: 'home', label: 'Home' },
        { key: 'explore', label: 'Explore' },
        { key: 'friends', label: 'Friends' },
        { key: 'spaces', label: 'Spaces' }
    ];

    constructor(
        private elementRef: ElementRef<HTMLElement>,
        private router: Router,
        private auth: AuthService,
        private dialog: MatDialog
    ) { }

    /* ================= SEARCH ================= */

    openSearch() {
        this.searchOpen = true;
    }

    async onSearch(event: Event) {
        const q = (event.target as HTMLInputElement).value.trim();

        if (!q) {
            this.users = [];
            this.spaces = [];
            return;
        }

        this.loading = true;

        await Promise.all([
            this.searchUsers(q),
            this.searchSpaces(q)
        ]);

        this.loading = false;
    }

    async searchUsers(query: string) {
        const { data, error } = await supabase
            .from('users')
            .select('user_id, full_name, avatar_img')
            .ilike('full_name', `%${query}%`)
            .limit(5);

        if (error) {
            console.error('searchUsers error', error);
            this.users = [];
            return;
        }

        this.users = data || [];
    }

    async searchSpaces(query: string) {
        const { data, error } = await supabase
            .from('spaces')
            .select('space_id, space_name, avatar_img')
            .ilike('space_name', `%${query}%`)
            .limit(5);

        if (error) {
            console.error('searchSpaces error', error);
            this.spaces = [];
            return;
        }

        this.spaces = data || [];
    }

    goToUser(userId: string) {
        this.resetSearch();
        this.router.navigate(['/profile', userId]);
    }

    goToSpace(spaceId: string) {
        this.resetSearch();
        this.router.navigate(['/spaces', spaceId]);
    }

    private resetSearch() {
        this.searchOpen = false;
        this.users = [];
        this.spaces = [];

        if (this.searchInput) {
            this.searchInput.nativeElement.value = '';
        }
    }


    /* ================= NAV ================= */

    toggle(key: string, event?: Event) {
        event?.stopPropagation();
        this.activeKey = key;
    }

    onKeydown(e: KeyboardEvent, index: number) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggle(this.items[index].key);
            return;
        }

        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const dir = e.key === 'ArrowRight' ? 1 : -1;
            const len = this.items.length;
            const nextIndex = (index + dir + len) % len;

            const nav = this.elementRef.nativeElement.querySelector('.center');
            const buttons = nav?.querySelectorAll<HTMLElement>('.icon-item');
            buttons?.[nextIndex]?.focus();
        }
    }

    /* ================= PROFILE ================= */

    toggleProfile(ev?: Event) {
        ev?.stopPropagation();
        this.profileOpen = !this.profileOpen;

        const wrap = this.elementRef.nativeElement.querySelector('.avatar-wrap');
        wrap?.classList.toggle('profile-open', this.profileOpen);
    }

    /* ================= GLOBAL CLICK ================= */

    @HostListener('document:click', ['$event'])
    onDocumentClick(ev: MouseEvent) {
        const target = ev.target as Node;

        const search = this.elementRef.nativeElement.querySelector('.search-wrap');
        if (search && !search.contains(target)) {
            this.searchOpen = false;
        }

        const avatar = this.elementRef.nativeElement.querySelector('.avatar-wrap');
        if (avatar && !avatar.contains(target)) {
            this.profileOpen = false;
            avatar.classList.remove('profile-open');
        }
    }

    /* ================= LOGOUT ================= */

    openLogoutDialog() {
        const dialogRef = this.dialog.open(LogoutDialog, {
            panelClass: 'custom-flurr-creation-dialog'
        });

        dialogRef.afterClosed().subscribe(ok => {
            
            if (ok) {
                this.auth.logout();
                this.router.navigate(['/signin']);
            }
        });
        
    }
}
