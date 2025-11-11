import { Component, input } from '@angular/core';
import { profileInfo } from '../../model/profile-info.type';
import { RouterLink } from "@angular/router";

@Component({
    selector: 'app-mini-profile-card',
    imports: [RouterLink],
    templateUrl: './mini-profile-card.html',
    styleUrl: './mini-profile-card.css'
})
export class MiniProfileCard {
    info = input<profileInfo>({
        username: 'ismail_.mechkene',
        firstName: 'Ismail',
        lastName: 'Mechkene',
        followersCount: 1200,
        followingCount: 150,
        postsCount: 15
    });

    getHandle(name: string): string {
        return '@' + name.replace(' ', '_').toLowerCase();
    }

}
