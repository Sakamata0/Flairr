import { Component, input } from '@angular/core';
import { Contact } from '../../model/contact.type';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-message-component',
  imports: [
    NgIf
],
  templateUrl: './message-component.html',
  styleUrl: './message-component.css'
})
export class MessageComponent {

    info = input<Contact> (
        {name: "Mohammed Houcine", avatarUrl: "assets/images/skander.png", lastMsg: "ismail azber msdmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmeni", lastMsgDate: "30 min", unreadMsgs: 1}
    )

}
