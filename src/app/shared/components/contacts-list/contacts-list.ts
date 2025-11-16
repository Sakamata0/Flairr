import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';   
import { MessageComponent } from "../message-component/message-component";


@Component({
    selector: 'app-contacts-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MessageComponent],
    templateUrl: './contacts-list.html',
    styleUrls: ['./contacts-list.css']
})
export class ContactsList {
    selectedFilter = 'All';

    setFilter(filter: string) {
        this.selectedFilter = filter;
    }
}
