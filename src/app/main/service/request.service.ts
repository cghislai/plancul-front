import {Credential} from '../domain/credential';
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {EMPTY, forkJoin, Observable, of, throwError} from 'rxjs';
import {Inject, Injectable} from '@angular/core';
import {CredentialProviderService} from './credential-provider.service';
import {catchError, filter, map, mergeMap, take} from 'rxjs/operators';
import {NotificationMessageService} from './notification-message.service';
import {Pagination} from '../domain/pagination';
import {WsContraintViolation, WsError, WsSearchQueryParams} from '@charlyghislain/plancul-api';
import {PaginationUtils} from './util/pagination-utils';
import {PlanCulClientConfig} from '../domain/plan-cul-client-config';
import {PLAN_CUL_CLIENT_CONFIG} from './util/client-config.token';
import {JwtCrential} from '../domain/jwt-crential';
import {Router} from '@angular/router';
import {LocalizationService} from './localization.service';
import {MessageKeys} from './util/message-keys';

@Injectable({
  providedIn: 'root',
})
export class RequestService {


  constructor(private http: HttpClient,
              private router: Router,
              private localizationService: LocalizationService,
              private notificationMessageService: NotificationMessageService,
              private credentialProvider: CredentialProviderService,
              @Inject(PLAN_CUL_CLIENT_CONFIG) private clientConfig: PlanCulClientConfig) {
  }


  get<T>(url: string, credential?: Credential): Observable<T> {
    return this.http.get<T>(url, {
      headers: {
        'Authorization': this.getAuthorizationHeader(credential),
      },
      withCredentials: true,
    })
      .pipe(catchError(e => this.handleRequestError(e)));
  }

  getPlainText(url: string, credential?: Credential): Observable<string> {
    return this.http.get(url, {
      headers: {
        'Authorization': this.getAuthorizationHeader(credential),
      },
      withCredentials: true,
      responseType: 'text',
    })
      .pipe(catchError(e => this.handleRequestError(e)));
  }


  sendLoginRequest(credential?: Credential) {
    const url = this.getAuthenticatorTokenUrl();
    return this.http.get(url, {
      headers: {
        'Authorization': this.getAuthorizationHeader(credential),
      },
      withCredentials: true,
      responseType: 'text',
    });
  }


  post<T>(url: string, body: any, pagination?: Pagination): Observable<T> {
    return this.http.post<T>(url, body, {
      headers: {
        'Authorization': this.getAuthorizationHeader(),
      },
      params: this.getPaginationParams(pagination),
      withCredentials: true,
    })
      .pipe(catchError(e => this.handleRequestError(e)));
  }

  put<T>(url: string, body: any, credential?: Credential): Observable<T> {
    return this.http.put<T>(url, body, {
      headers: {
        'Authorization': this.getAuthorizationHeader(credential),
      },
      withCredentials: true,
    })
      .pipe(catchError(e => this.handleRequestError(e)));
  }

  delete<T>(url: string, credential?: Credential): Observable<T> {
    return this.http.delete<T>(url, {
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

  parseValidationErrorsDictMaybe$(error: any): Observable<any> {
    const jsonBody = this.parseHttpErrorJsonBody(error);
    return of(jsonBody).pipe(
      filter(body => body != null),
      map(body => body['errors']),
      filter(errors => errors != null),
      map(errors => this.createViolationErrorDict(errors)),
    );
  }

  renewToken() {
    this.credentialProvider.getJosePayloadObservable()
      .pipe(
        take(1),
        map(payload => this.credentialProvider.isJosePayloadValid(payload)),
        mergeMap(valid => valid ? this.sendLoginRequest() : throwError('expired')),
      ).subscribe(
      newToken => this.credentialProvider.setCredential(new JwtCrential(newToken)),
      error => this.handletokenRenewalError(error));
  }

  buildPlanCulApiUrl(apiPth: string) {
    const apiUrl = this.clientConfig.apiUrl;
    return `${apiUrl}${apiPth}`;
  }

  builAuthenticatordApiUrl(apiPth: string) {
    const apiUrl = this.clientConfig.authenticatorApiUrl;
    return `${apiUrl}${apiPth}`;
  }

  buildAstronomuApiUrl(apiPth: string) {
    const apiUrl = this.clientConfig.astronomyApiUrl;
    return `${apiUrl}${apiPth}`;
  }

  getAuthenticatorTokenUrl() {
    const appName = this.clientConfig.authenticatorApplicationName;
    const url = this.builAuthenticatordApiUrl(`/token/${appName}`);
    return url;
  }

  private getAuthorizationHeader(providedCredential?: Credential) {
    const credential = providedCredential == null ? this.credentialProvider.getCredential() : providedCredential;
    const header = credential == null ? '' : credential.getAuthorizationHeaderValue();
    return header;
  }

  private handleRequestError(error: any) {
    let errorMessage = this.getHttpErrorMessage(error);
    if (this.isHttpErrorWithStatusCodeStartingWith(error, 5)) {
      if (errorMessage == null) {
        errorMessage = 'Unexpected server error';
      }
      this.notificationMessageService.addError('Request errored', errorMessage);
      return EMPTY;
    } else if (this.isHttpErrorWithStatusCodeStartingWith(error, 401)) {
      // Try to renew the token. If it is expired or renewal fails, the user will be logged off
      this.renewToken();
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


  private handletokenRenewalError(error: any) {
    forkJoin(
      this.localizationService.getTranslation(MessageKeys.SESSION_EXPIRED_TITLE),
      this.localizationService.getTranslation(MessageKeys.SIGN_IN_AGAIN_MESSAGE),
    ).subscribe(msgs => this.notificationMessageService.addError(msgs[0], msgs[1]));
    this.credentialProvider.setCredential(null);
    this.router.navigate(['/login']);
  }


  private createViolationErrorDict(list: WsContraintViolation[]): any {
    const dict = {};
    list.forEach(violation => {
      let keyedList = dict[violation.propertyName];
      if (keyedList == null) {
        keyedList = [];
        dict[violation.propertyName] = keyedList;
      }
      const messageKey = violation.message;
      this.localizationService.getTranslation(messageKey)
        .subscribe(message => keyedList.push(message));
    });
    // Should wait for all list to be filled..
    return dict;
  }
}
