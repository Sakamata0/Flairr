import { Component, input } from '@angular/core';
import { Message } from '../../model/message.type';
import { Contact } from '../../model/contact.type';
import { NgFor, NgIf } from '@angular/common';

@Component({
    selector: 'app-chat-view',
    imports: [
        NgIf
    ],
    templateUrl: './chat-view.html',
    styleUrl: './chat-view.css'
})
export class ChatView {

    info = input<Message> (
        {id: 1, from: 'me', text: "ahla", time: "10:30PM", avatar: "assets/images/profile-picture-test.jpg" }
    )

    info1 = input<Contact> (
        {name: "Ismail Mechkene", avatarUrl: "assets/images/profile-picture-test.jpg", lastMsg: "ismail azber msdmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmeni", lastMsgDate: "30 min", unreadMsgs: 1}
    )
}
