import { Component } from '@angular/core';
import { ProfileHeader } from "../../shared/components/profile/profile-header/profile-header";

@Component({
  selector: 'app-profile',
  imports: [ProfileHeader],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  
}
