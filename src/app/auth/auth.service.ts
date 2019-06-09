import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { throwError, Subject, BehaviorSubject } from 'rxjs';
import { User } from './user.model';
import { Router } from '@angular/router';
import { isFulfilled } from 'q';


export interface AuthResonseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expression: string;
  expiresIn: string;
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
  User = new BehaviorSubject<User>(null);
  timer: any;

  constructor(private http: HttpClient, private router: Router) {


  }


  signup(user: UserBre) {
    // tslint:disable-next-line:max-line-length
    return this.http.post<AuthResonseData>('https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=' + environment.firebaseAPIKey,
      {
        email: user.email,
        password: user.password,
        returnSecureToken: true
      }
    ).pipe(catchError(this.handleError), tap(data => this.handleSucess(data)));
  }
  signin(user: UserBre) {
    // tslint:disable-next-line:max-line-length
    return this.http.post<AuthResonseData>(`https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${environment.firebaseAPIKey}`, {
      email: user.email,
      password: user.password,
      returnSecureToken: true
    }).pipe(catchError(this.handleError), tap(data => this.handleSucess(data)));
  }


  private handleSucess(responseData) {
    // tslint:disable-next-line:max-line-length
    const expiresIN = new Date(new Date().getTime() + +responseData.expiresIn * 1000);
    const user = new User(responseData.email, responseData.localId, responseData.idToken, expiresIN);

    this.User.next(user);
    this.autoLogout(responseData.expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }
  autoLogin() {

    const user: {
      email: string;
      id: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData'));

    if (!user) {
      return;
    }
    const loadedUser = new User(user.email, user.id, user._token, new Date(user._tokenExpirationDate));

    if (loadedUser.token) {
      this.User.next(loadedUser);
      const expDate = new Date(user._tokenExpirationDate).getTime() - new Date().getTime();

      this.autoLogout(expDate);
      this.router.navigate(['/recipes']);
    } else {

    }

  }
  autoLogout(expirationDuration: number) {
    console.log(expirationDuration);
    this.timer = setTimeout(() => {
      this.logout();
    }, expirationDuration);

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
  logout() {
    this.User.next(null);
    localStorage.removeItem('userData');
    this.router.navigate(['auth']);
    clearTimeout(this.timer);
    this.timer = null;
  }

}
