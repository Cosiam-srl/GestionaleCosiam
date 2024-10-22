import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoggingService, LogLevel } from 'app/shared/services/logging/logging.service';

@Component({
  selector: 'app-view-user-component',
  templateUrl: './view-user-component.component.html',
  styleUrls: ['./view-user-component.component.scss', '../../../../../assets/sass/pages/page-users.scss']
})
export class ViewUserComponentComponent implements OnInit {

  idPersona: number;

  constructor(private activatedRoute: ActivatedRoute, private router: Router) { }

ngOnInit(): void {
  const target = this.activatedRoute.snapshot.paramMap.get('id');
  this.idPersona = Number.parseInt(target);
}

// metodo chiamato al click del tasto azione su una riga della tabella. Apre la pagina di edit di un user
onEdit() {
  LoggingService.log('richiesta modifica per', LogLevel.debug, this.idPersona);
  // Navigo verso la pagina di edit di quell'utente
  this.router.navigate(['/page/dashboards/modifica/utente/', this.idPersona]);
}
}
