import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-logout-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './logout-dialog.html',
  styleUrl: './logout-dialog.css'
})
export class LogoutDialog {
}
