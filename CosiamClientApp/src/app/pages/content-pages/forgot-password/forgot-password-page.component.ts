import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { AppConfigService } from 'app/shared/services/configs/app-config.service';
import { LoggingService } from 'app/shared/services/logging/logging.service';
import swal from 'sweetalert2';

@Component({
    selector: 'app-forgot-password-page',
    templateUrl: './forgot-password-page.component.html',
    styleUrls: ['./forgot-password-page.component.scss']
})

export class ForgotPasswordPageComponent {
    usernameOrEmail: string = '';

    constructor(private router: Router,
        private route: ActivatedRoute,
        private http: HttpClient) { }

    // On submit click, reset form fields
    onSubmit() {
        if(!this.usernameOrEmail || this.usernameOrEmail == '' || this.usernameOrEmail == ' ')
            return;
    
        this.http.post(AppConfigService.settings.apiServer.baseUrl + '/api/Authenticate/forgot-password',
            { username: this.usernameOrEmail },
            { observe: 'response' })
            .subscribe(
                (res) => {
                    if(res.ok) {
                        //this.onLogin();
                        swal.fire({
                            icon: 'success',
                            title: 'Procedura di recupero password avviata',
                            text: 
                                'Se lo username o l\'email inseriti corrispondono ad un utente valido, riceverai una email con i prossimi step da seguire per completare la procedura.\n'
                                + 'Sarai ridiretto alla pagina di login fra 10 secondi',
                            timer: 10000,
                            showConfirmButton: false,
                            willClose: (opt) => {
                                this.router.navigate(['/pages/login']);
                            }
                        })
                        this.router.navigate(['login'], { relativeTo: this.route.parent });
                    }
                },
                (err) => {
                    swal.fire({
                        icon: 'error',
                        title: 'Procedura di recupero password non avviata!',
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

    // On login link click
    onLogin() {
        this.router.navigate(['login'], { relativeTo: this.route.parent });
    }

    // On registration link click
    onRegister() {
        this.router.navigate(['register'], { relativeTo: this.route.parent });
    }
}
 