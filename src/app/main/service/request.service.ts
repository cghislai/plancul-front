import {Credential} from '../domain/credential';
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {EMPTY, Observable, throwError} from 'rxjs';
import {API_URL} from './api-url.token';
import {Inject, Injectable} from '@angular/core';
import {CredentialProviderService} from './credential-provider.service';
import {catchError} from 'rxjs/operators';
import {NotificationMessageService} from './notification-message.service';
import {Pagination} from '../domain/pagination';
import {WsError, WsSearchQueryParams} from '@charlyghislain/plancul-ws-api';
import {PaginationUtils} from './util/pagination-utils';

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

  post<T>(apiPath: string, body: any, pagination?: Pagination): Observable<T> {
    return this.http.post<T>(this.buildUrl(apiPath), body, {
      headers: {
        'Authorization': this.getAuthorizationHeader(),
      },
      params: this.getPaginationParams(pagination),
      withCredentials: true,
    })
      .pipe(catchError(e => this.handleRequestError(e)));
  }

  postPlainText(apiPath: string, body: any, credential?: Credential): Observable<string> {
    return this.http.post(this.buildUrl(apiPath), body, {
      headers: {
        'Authorization': this.getAuthorizationHeader(credential),
      },
      withCredentials: true,
      responseType: 'text',
    })
      .pipe(catchError(e => this.handleRequestError(e)));
  }

  put<T>(apiPath: string, body: any, credential?: Credential): Observable<T> {
    return this.http.put<T>(this.buildUrl(apiPath), body, {
      headers: {
        'Authorization': this.getAuthorizationHeader(credential),
      },
      withCredentials: true,
    })
      .pipe(catchError(e => this.handleRequestError(e)));
  }

  delete<T>(apiPath: string, credential?: Credential): Observable<T> {
    return this.http.delete<T>(this.buildUrl(apiPath), {
      headers: {
        'Authorization': this.getAuthorizationHeader(credential),
      },
      withCredentials: true,
    })
      .pipe(catchError(e => this.handleRequestError(e)));
  }

  isClientError(error: any): boolean {
    return this.isHttpErrorWithStatusCodeStartingWith(error, 4);
  }

  isBadRequestError(error: any): boolean {
    return this.isHttpErrorWithStatusCodeStartingWith(error, 400);
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
    const body = this.parseHttpErrorJsonBody<WsError>(error);
    if (body == null) {
      return null;
    }
    return body.message;
  }


  parseHttpErrorJsonBody<T>(error: any): T | null {
    if (error == null) {
      return null;
    } else if (error instanceof HttpResponse) {
      const contentType = error.headers.get('Content-Type');
      if (contentType === 'application/json') {
        return <T>JSON.parse(error.body);
      }
    } else if (error instanceof HttpErrorResponse) {
      return error.error;
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

  private getPaginationParams(pagination?: Pagination) {
    if (pagination == null) {
      return null;
    }
    const params = {};
    params[WsSearchQueryParams.offset] = pagination.offset.toString(10);
    params[WsSearchQueryParams.length] = pagination.length.toString(10);
    if (pagination.sorts != null) {
      const sortsParam = PaginationUtils.serializeSorts(pagination.sorts);
      params[WsSearchQueryParams.sorts] = sortsParam;
    }
    return params;
  }


}
