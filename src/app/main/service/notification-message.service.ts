import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, timer} from 'rxjs';
import {Message} from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class NotificationMessageService {

  private messageSource = new BehaviorSubject<Message[]>([]);
  private readonly MESSAGE_DELAY_TIMOUT_MS = 3000;

  constructor() {
  }

  getMessagesObservable(): Observable<Message[]> {
    return this.messageSource.asObservable();
  }

  addInfo(title: string, details?: string) {
    const message = <Message>{
      summary: title,
      detail: details,
      severity: 'info',
    };
    this.addMessage(message);
  }

  addWarning(title: string, details?: string) {
    const message = <Message>{
      summary: title,
      detail: details,
      severity: 'warn',
    };
    this.addMessage(message);
  }

  addError(title: string, details?: string) {
    const message = <Message>{
      summary: title,
      detail: details,
      severity: 'error',
    };
    this.addMessage(message);
  }


  addMessage(message: Message) {
    const newMessages = [
      ...this.messageSource.getValue(),
      message,
    ];
    this.messageSource.next(newMessages);
    this.delayMessageRemoval(message);
  }

  private delayMessageRemoval(message: Message) {
    timer(this.MESSAGE_DELAY_TIMOUT_MS)
      .subscribe(() => this.removeMessage(message));
  }

  private removeMessage(message: Message) {
    const newMessages = this.messageSource.getValue()
      .filter(m => m !== message);
    this.messageSource.next(newMessages);
  }
}
