import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Personale } from 'app/models/personale.model';
import { User } from 'app/models/user.model';
import { PersonaleService } from 'app/shared/services/data/personale.service';
import { UserService } from 'app/shared/services/data/user.service';
// import { User } from 'app/models/user.model';
import { LoggingService, LogLevel } from 'app/shared/services/logging/logging.service';
import { usersListData } from './users-list.data';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss', '../../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UserDashboardComponent implements OnInit {

  // array contenente la lista di tutti gli utenti del gestionale
  public getUtenti;
  // array contenente la lista del personale
  public personaleget: Personale[];
  // variabile necessaria per ngx-datatable
  public ColumnMode = ColumnMode;
  // variabile utilizzata per la funzione mostra tot utenti nella tabella
  public limitRef = 10;
  private tempData;
  public livello = '';
  public stato = '';

  // roba per il form
  fff = false;
  // variabile che contiene il nuovo utente
  nuovoutente = new User();


  constructor(private _personaleservice: PersonaleService, private _modalService: NgbModal, private _userservice: UserService, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this._userservice.getAllUsers()
      .subscribe(
        (res) => {
          LoggingService.log('Users ottenuti', LogLevel.debug, res);
          this.getUtenti = {...res};
          this.tempData = res;
        },
        (err) => {
          LoggingService.log('ERRORE get Users ', LogLevel.error, err);

        },
        () => { },
      )
    this._personaleservice.getAllPersonale()
      .subscribe(
        (res) => {
          LoggingService.log('Personale ottenuto ', LogLevel.debug, res);
          this.personaleget = res;
        },
        (err) => {
          LoggingService.log('ERRORE get Personale ', LogLevel.error, err);

        },
        () => {
          this.personaleget.forEach(element => {
            element.fullName = element.name + ' ' + element.surname;
          });
        },
      )
  }



  /**
   * filterUpdate
   *
   * @param event
   */
  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    let temp;
    if(val) {
    // filter our data
      temp = this.tempData.filter(function (d) {
        return d.Name.toLowerCase().indexOf(val) !== -1 || !val;
      });
    } else {
      temp = this.tempData;
    }

    // update the rows
    this.getUtenti = temp;


  }
  createUser() {
    delete this.nuovoutente.persona;
    LoggingService.log('nuovo utente', LogLevel.debug, this.nuovoutente);
    this._userservice.postNewUser(this.nuovoutente)
    .subscribe(
      (res) => {
        LoggingService.log('nuovo utente postato', LogLevel.debug, res);
        this._userservice.setRoleUser(this.nuovoutente.username, this.nuovoutente.level)
        .subscribe(
          (res) => {
            LoggingService.log('ruolo nuovo utente settato', LogLevel.debug, res);
          },
          (err) => {
            LoggingService.log('ERRORE post ruolo utente', LogLevel.error, err);
          },
          () => {},
        )
        this.nuovoutente = new User();
      },
      (err) => {
        LoggingService.log('ERRORE post nuovo utente', LogLevel.error, err);
      },
      () => {

      },
    )
  }
  // metodo utilizzato dal tasto "crea utente" per aprire un popup
  openLg(content) {
    this._modalService.open(content, { size: 'xl', scrollable: true });
  }
  // funzione chiamata alla selezione del livello o dello stato usando le tendine nella user dashboard
  filtro() {
    const lvl = this.livello;
    const sts = this.stato;
    LoggingService.log('stato e livello sono', LogLevel.debug, [sts, lvl]);

    const temp = this.tempData.filter(function (d) {

      if (lvl == '') {
        return d.Status.indexOf(sts) !== -1 || !sts;
      }
      if (sts == '') {
        return d.Role.indexOf(lvl) !== -1 || !lvl;
      } else {
        return d.Role.indexOf(lvl) !== -1 && d.Status.indexOf(sts) !== -1 || !lvl || !sts;
      }
    });

    // update the rows
    this.getUtenti = temp;
  }

  pulisciFiltro() {
    LoggingService.log('Pulisco filtri tabella utenti', LogLevel.debug)
    this.livello = '';
    this.stato = '';
    this.getUtenti = usersListData;
  }

  /**
   * updateLimit
   *
   * @param limit
   */


  updateLimit(limit) {
    this.limitRef = limit.target.value;
  }

  // metodo chiamato al click del tasto azione su una riga della tabella. Apre la pagina di edit di un user
  onEdit(target) {
    LoggingService.log('richiesta modifica per', LogLevel.debug, target);
    // Navigo verso la pagina di edit di quell'utente
    this.router.navigate(['/page/dashboards/modifica/utente/', target.ID]);
  }
  // metodo chiamato cliccando su una riga della tabella. Apre la pagina di view di un user
  viewPage(event) {
    if (event.type == 'dblclick') {
      LoggingService.log('riga cliccata', LogLevel.debug);
      this.router.navigate(['/page/dashboards/utente/', event.row.ID]);
    }
  }
  showPassword() {
    const p = (document.getElementById('password')as HTMLInputElement);
    if (p.type == 'text') {
      p.type = 'password'
    } else if (p.type == 'password') {
      p.type = 'text'
    }
  }

  validationForm(form) {
    LoggingService.log('form', LogLevel.debug, form)
    if (form.status == 'VALID') {
      this.fff = true;
      return;
    } else {
      this.fff = false
      return;
    }
  }

}

