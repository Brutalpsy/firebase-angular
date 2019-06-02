import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';


export interface AuthResonseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expression: string;
  localId: string;
  registered?: boolean;
}

export interface UserBre {
  email: string;
  password: string;
  asaa: boolean;
}
export class UserBre2 {
  email: string;
  password: string;
  asaa: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {


  }

  signup(user: UserBre) {
    // tslint:disable-next-line:max-line-length
    return this.http.post<AuthResonseData>('https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=' + environment.firebaseAPIKey,
      {
        email: user.email,
        password: user.password,
        returnSecureToken: true
      }
    ).pipe(catchError(this.handleError));
  }
  signin(user: UserBre) {
    // tslint:disable-next-line:max-line-length
    return this.http.post<AuthResonseData>(`https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${environment.firebaseAPIKey}`, {
      email: user.email,
      password: user.password,
      returnSecureToken: true
    }).pipe(catchError(this.handleError));
  }
  private handleError(err: HttpErrorResponse) {
    let error = '';
    const isErrorIncluded = err.error && err.error.error && err.error.error.message && err.error.error.message.replace('_', ' ');
    if (!isErrorIncluded) {
      return throwError('Unknown error');
    }
    error = isErrorIncluded && isErrorIncluded.charAt(0).toUpperCase() + isErrorIncluded.slice(1).toLowerCase();
    return throwError(error);
  }

}
