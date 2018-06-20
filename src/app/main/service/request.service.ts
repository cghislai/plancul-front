import {Credential} from '../domain/credential';
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {EMPTY, Observable, throwError} from 'rxjs';
import {API_URL} from './api-url.token';
import {Inject, Injectable} from '@angular/core';
import {CredentialProviderService} from './credential-provider.service';
import {catchError} from 'rxjs/operators';
import {NotificationMessageService} from './notification-message.service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RequestService {


  constructor(private http: HttpClient,
              private notificationMessageService: NotificationMessageService,
              private credentialProvider: CredentialProviderService,
              @Inject(API_URL) private apiUrl: string) {
  }


  get<T>(apiPath: string, credential?: Credential): Observable<T> {
    return this.http.get<T>(this.buildUrl(apiPath), {
      headers: {
        'Authorization': this.getAuthorizationHeader(credential),
      },
      withCredentials: true,
    })
      .pipe(catchError(e => this.handleRequestError(e)));
  }

  getPlainText(apiPath: string, credential?: Credential): Observable<string> {
    return this.http.get(this.buildUrl(apiPath), {
      headers: {
        'Authorization': this.getAuthorizationHeader(credential),
      },
      withCredentials: true,
      responseType: 'text',
    })
      .pipe(catchError(e => this.handleRequestError(e)));
  }

  post<T>(apiPath: string, body: any, credential?: Credential): Observable<T> {
    return this.http.post<T>(this.buildUrl(apiPath), body, {
      headers: {
        'Authorization': this.getAuthorizationHeader(credential),
      },
      withCredentials: true,
    })
      .pipe(catchError(e => this.handleRequestError(e)));
  }

  isHttpErrorWithStatusCodeStartingWith(error: any, statusCodeStart: number): boolean {
    const startString = statusCodeStart.toString(10);
    const statusCode = this.getHttpErrorStatus(error);
    const statusCodeString = statusCode.toString(10);
    return statusCodeString.startsWith(startString);
  }

  getHttpErrorStatus(error: any): number {
    if (error == null) {
      return 0;
    } else if (error instanceof HttpResponse) {
      return error.status;
    } else if (error instanceof HttpErrorResponse) {
      return error.status;
    }
    return 0;
  }

  getHttpErrorMessage(error: any): string | null {
    if (error == null) {
      return null;
    } else if (error instanceof HttpResponse) {
      return this.extractErrorMessageFromHttpResponse(error);
    }
    return null;
  }

  private extractErrorMessageFromHttpResponse(response: HttpResponse<any>) {
    const body = response.body;
    const contentType = response.headers.get('Content-Type');

    if (contentType === 'application/json') {
      const jsonObject = JSON.parse(body);
      const messageKey = jsonObject['message'];
      if (messageKey != null) {
        return messageKey;
      }
    }
    return null;
  }

  private buildUrl(apiPth: string) {
    return `${this.apiUrl}${apiPth}`;
  }

  private getAuthorizationHeader(providedCredential?: Credential) {
    const credential = providedCredential == null ? this.credentialProvider.getCredential() : providedCredential;
    const header = credential == null ? '' : credential.getAuthorizationHeaderValue();
    return header;
  }

  private handleRequestError(error: any) {
    if (this.isHttpErrorWithStatusCodeStartingWith(error, 5)) {
      this.notificationMessageService.addError('Request errored', 'Unexpected server error');
      return EMPTY;
    }
    return throwError(error);
  }
}
