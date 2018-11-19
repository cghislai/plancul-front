import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, timer} from 'rxjs';
import {Message, MessageService} from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class NotificationMessageService {

  private readonly MESSAGE_DELAY_TIMOUT_MS = 3000;

  constructor(private messageService: MessageService) {
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

  addError(title: string, error?: any) {
    const message = <Message>{
      summary: title,
      detail: this.getErrorMessage(error),
      severity: 'error',
    };
    this.addMessage(message);
  }


  addMessage(message: Message) {
    this.messageService.add(message);
  }

  private getErrorMessage(error: any) {
    const errorMessageNullable = this.getErrorMessageNullable(error);
    return errorMessageNullable == null ? 'Unknown error' : errorMessageNullable;
  }

  private getErrorMessageNullable(error: any): string | null {
    if (typeof error === 'string') {
      return error;

    } else if (typeof error === 'object') {

      const subError = error['error'];
      if (subError != null) {
        const subErrorMessage = this.getErrorMessageNullable(subError);
        if (subErrorMessage != null) {
          return subErrorMessage;
        }
      }

      const messageValue = error['message'];
      if (messageValue != null) {
        return messageValue;
      }
    }
    return null;
  }
}
