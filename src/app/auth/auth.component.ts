
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AuthService, AuthResonseData } from './auth.service';
import { User } from './user.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, concat, interval, merge } from 'rxjs';
import { concatMap, tap, map, take } from 'rxjs/operators';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit {

  isLoginMode = true;
  isLoading = false;
  error: string = null;

  loginForm: FormGroup;


  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {

  }

  ngOnInit(): void {

    this.loginForm = this.formBuilder.group({
      email: [null, { validators: [Validators.required, Validators.email], updateOn: 'blur' }]
      , password: [null, [Validators.required, Validators.minLength(6)]]
    });
  }

  private consolLoguj(data) {

    console.log(data);
  }

  onSubmit() {
    if (!this.loginForm.valid) {
      return;
    }
    this.isLoading = true;
    let authObs: Observable<AuthResonseData>;

    if (this.isLoginMode) {
      authObs = this.authService.signin({ ...this.loginForm.value });
    } else {
      authObs = this.authService.signup({ ...this.loginForm.value });
    }

    authObs.subscribe(x => {
      this.isLoading = false;
      this.error = null;
      this.router.navigate(['/recipes']);
    }, err => {
      this.handleError(err);
      this.isLoading = false;

      console.error(err);
    });

    this.resetForm();

  }
  handleError(error: any) {
    this.error = error;
  }

  get formControls() { return this.loginForm.controls; }


  resetForm() {
    this.loginForm.reset();
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }
}
// function dummyValidator(control: FormControl) {
//   console.log('checking...');
//   return null;
// }
