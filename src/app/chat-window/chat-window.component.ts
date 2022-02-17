import { Component, Input, OnInit } from '@angular/core';
import { Form, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnInit {

  socket = new WebSocket("ws://127.0.0.1:8181/core");
  userMessages: any = [];
  messageSend = new FormControl("", [Validators.required, Validators.pattern("^[ a-zA-Z0-9]*$")]);

  constructor() { }

  ngOnInit(): void {
    console.log(this.socket);
    this.socket.onopen = (e) => {
      console.log("[open] Connection established");
      console.log("Sending to server");
      this.socket.send("My name is John");
    };

    this.socket.onmessage = (event) => {
      // console.log(data.type);
      // console.log(`${event.data}`);
      let data = JSON.parse(event.data)
      if (data.type == "recognizer_loop:utterance") {
        let newMessage = {
          type: "You",
          message: data.data.utterances[0]
        }
        this.userMessages.push(newMessage)
        console.log(data.data.utterances);
      }
      if (data.type == "speak") {
        let newMessage = {
          type: "Billy",
          message: data.data.utterance
        }
        console.log(newMessage);
        this.userMessages.push(newMessage);
      }
    };


    this.socket.onclose = (event) => {
      if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        console.log('[close] Connection died');
      }
    };

    this.socket.onerror = (error) => {
      console.log(`[error] ${error}`);
    };
  }

  send(): void {
    console.log(this.messageSend.value);
    this.socket.send(`{"type": "recognizer_loop:utterance", "data": {"utterances" : ["${this.messageSend.value}"]}}`);
    this.messageSend.setValue("");
  }


}
