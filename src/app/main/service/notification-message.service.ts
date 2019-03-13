import {Injectable} from '@angular/core';
import {Message, MessageService} from 'primeng/api';
import {LocalizationService} from './localization.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationMessageService {


  constructor(private messageService: MessageService,
              private localizationService: LocalizationService) {
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

  getErrorMessage(error: any) {
    const errorMessageNullable = this.getErrorMessageNullable(error);
    return errorMessageNullable == null ? 'Unknown error' : errorMessageNullable;
  }

  private getErrorMessageNullable(error: any, httpStatus?: number): string | null {
    if (typeof error === 'string') {
      return error;

    } else if (typeof error === 'object') {

      const status = httpStatus == null ? error['status'] : httpStatus;
      const subError = error['error'];
      const subErrors = error['errors'];

      if (subError != null) {
        const subErrorMessage = this.getErrorMessageNullable(subError, status);
        if (subErrorMessage != null) {
          return subErrorMessage;
        }
      }

      if (subErrors != null && subErrors.length > 0) {
        const errorMessages = subErrors.map(
          se => this.getErrorMessageNullable(se, httpStatus),
        ).reduce((cur, next) => cur == null ? next : `${cur}\n${next}`, null);
        return errorMessages;
      }

      const messageValue = error['message'];
      if (messageValue != null) {
        const msgTranslation = this.localizationService.getTranslationNow(messageValue);
        if (msgTranslation != null) {
          return msgTranslation;
        } else {
          return messageValue;
        }
      }
    }
    return null;
  }
}
