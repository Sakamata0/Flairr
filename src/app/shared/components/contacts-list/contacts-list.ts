import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessageComponent } from "../message-component/message-component";


@Component({
    selector: 'contacts-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MessageComponent],
    templateUrl: './contacts-list.html',
    styleUrls: ['./contacts-list.css']
})
export class ContactsList {
    selected: string = 'All';
    options: string[] = ['All', 'Unread'];
}
