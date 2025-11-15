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
        {
          name: "Mohammed Houcine", avatar: "assets/images/skander.png", last: "ismail azber msdmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmeni", status: "30 min", unread: 1,
          id: 0
        }
    )

}
