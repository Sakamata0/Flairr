import { Component, ElementRef, HostListener, ViewChild, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { AuthService } from '../../../core/auth/auth.service';
import { supabase } from '../../../core/supabase/supabase.client';
import { LogoutDialog } from '../logout-dialog/logout-dialog';
import { effect } from '@angular/core';
import { UserService } from '../../../core/services/user.service';


@Component({
    selector: 'app-flurr-header',
    standalone: true,
    imports: [CommonModule, RouterModule,NgIf],
    templateUrl: './flurr-header.html',
    styleUrls: ['./flurr-header.css']
})
export class FlurrHeaderComponent {

    ngOnInit(): void {
        // set initial active key based on current URL
        this.updateActiveFromUrl(this.router.url);

        // update active key on subsequent navigations
        this.router.events.subscribe(ev => {
            if (ev instanceof NavigationEnd) {
                this.updateActiveFromUrl(ev.urlAfterRedirects || ev.url);
            }
        });

        // If UserService has no current user yet, attempt to load from auth session
        if (!this.userService.currentUser()) {
            const authId = this.auth.getUserId();
            if (authId) {
                this.userService.loadFromAuthUserId(authId).catch(err => console.warn('Header load user error', err));
            } else {
                // fallback to supabase session check
                supabase.auth.getSession().then(({ data }: { data: any }) => {
                    const sid = data.session?.user?.id ?? null;
                    if (sid) this.userService.loadFromAuthUserId(sid).catch(err => console.warn('Header load user error', err));
                }).catch((e: any) => console.warn('Header supabase session error', e));
            }
        }
    }

    @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
    @ViewChild('searchContainer') searchContainer!: ElementRef<HTMLElement>;

    activeKey: string | null = null;
    profileOpen = false;

    searchOpen = false;
    loading = false;

    users: any[] = [];
    spaces: any[] = [];

    defaultAvatar = '/assets/images/default-profile-picture.png';
    defaultSpace = '/assets/images/default-profile-picture.png';

    userAvatar = this.defaultAvatar;
    userId!: string;


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
        private dialog: MatDialog,
        private userService: UserService
    ) {
        effect(() => {
            const user = this.userService.currentUser();

            this.userAvatar =
                user?.avatarImg && user.avatarImg.trim()
                    ? user.avatarImg
                    : this.defaultAvatar;
            this.userId = user?.userID ?? '';

        });
    }

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

    private updateActiveFromUrl(url: string) {
        if (!url) {
            this.activeKey = null;
            return;
        }

        // normalize
        const path = url.split('?')[0].split('#')[0];

        if (path === '/' || path === '/home') {
            this.activeKey = 'home';
            return;
        }

        if (path.startsWith('/explore')) {
            this.activeKey = 'explore';
            return;
        }

        if (path.startsWith('/friends')) {
            this.activeKey = 'friends';
            return;
        }

        if (path.startsWith('/spaces')) {
            // includes /spaces and /spaces/:id (space profile)
            this.activeKey = 'spaces';
            return;
        }

        // default: no active nav
        this.activeKey = null;
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
    }


    /* ================= GLOBAL CLICK ================= */

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const searchWrap = this.elementRef.nativeElement.querySelector('.search-wrap');
        const avatarWrap = this.elementRef.nativeElement.querySelector('.avatar-wrap');
        const target = event.target as HTMLElement;

        // Close search only if click is outside search container
        if (searchWrap && !searchWrap.contains(target)) {
            this.searchOpen = false;
        }

        // Close profile only if click is outside avatar container
        if (avatarWrap && !avatarWrap.contains(target)) {
            this.profileOpen = false;
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

