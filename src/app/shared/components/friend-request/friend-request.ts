import { Component,input } from '@angular/core';
import { profileInfo } from '../../model/profile-info.type';

@Component({
  selector: 'app-friend-request',
  imports: [],
  templateUrl: './friend-request.html',
  styleUrl: './friend-request.css'
})
export class FriendRequest {
    info = input.required<profileInfo>();


    getHandle(name: string): string {
        return '@' + name.replace(' ', '_').toLowerCase();
    }
}
