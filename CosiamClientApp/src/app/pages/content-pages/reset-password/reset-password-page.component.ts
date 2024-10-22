import { Component, ViewChild, OnInit } from '@angular/core';
import { NgForm, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

// import custom validator to validate that password and confirm password fields match
import { MustMatch } from '../../../shared/directives/must-match.validator';
import { ActivatedRoute, Router } from '@angular/router';
import { MissingRequiredFields } from 'app/shared/directives/missing-required-fields.validator';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from 'app/shared/services/configs/app-config.service';
import swal from 'sweetalert2';
import { LoggingService } from 'app/shared/services/logging/logging.service';


@Component({
  selector: 'app-reset-password-page',
  templateUrl: './reset-password-page.component.html',
  styleUrls: ['./reset-password-page.component.scss']
})

export class ResetPasswordPageComponent implements OnInit {
  resetFormSubmitted = false;
  resetForm: FormGroup;
  constructor(private formBuilder: FormBuilder, private router: Router, private _route: ActivatedRoute, private _http: HttpClient) { }

  ngOnInit() {
    
    var query = this._route.snapshot.queryParamMap;
    var user = query.get('user');
    var token = query.get('token');
    this.resetForm = this.formBuilder.group({
      token: [token, Validators.required],
      user: [user, Validators.required],
      // email: ['', [Validators.required, Validators.email]],
      newPasswd: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
      // acceptTerms: [false, Validators.requiredTrue]
    }, {
      validators: [
        MustMatch('newPasswd', 'confirmPassword'),
        //MissingRequiredFields(['token','user'])
      ]
    });
  }

  get rf() {
    return this.resetForm.controls;
  }


  //  On submit click, reset field value
  onSubmit() {
    this.resetFormSubmitted = true;
    if (this.resetForm.invalid) {
      return;
    }

    this._http.post(AppConfigService.settings.apiServer.baseUrl + '/api/Authenticate/reset-password', this.resetForm.value, { observe: 'response' })
      .subscribe(
        (res) => {
          if(res.ok) {
            swal.fire({
              icon: 'success',
              title: 'Recupero password completato!',
              text: 'Ora puoi provare ad accedere con le nuove credenziali. Sarai ridiretto alla pagina di login fra 10 secondi',
              timer: 10000,
              showConfirmButton: false,
              willClose: (opt) => {
                this.router.navigate(['/pages/login']);
              }
            })
          }
        },
        (err) => {
          swal.fire({
            icon: 'error',
            title: 'Recupero password non completato!',
            text: 'Si è verificato un errore, contatta il servizio di supporto!',
            confirmButtonText: 'Ho capito',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
          LoggingService.log("Errore in fase di reset della password:", err);
        }
      );
  }
}
