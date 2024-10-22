import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { PrezziarioComponent } from '../prezziario.component';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ServiziClienteService } from 'app/shared/services/data/servizicliente.service';
import { PrezziarioGeneraleService } from 'app/shared/services/data/prezziariogenerale.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SharedModule } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PrezziarioGenerale } from 'app/models/benieservizi.model';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'prezzario-small-form',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './prezzario-small-form.component.html',
  styleUrl: './prezzario-small-form.component.scss',
})
export class PrezzarioSmallFormComponent implements OnInit {


  prezzariGenerali: PrezziarioGenerale[] = [];

  //NON RISCRIVO LE FUNZIONI MA USO DIRETTAMENTE QUELLE NEL COMPONENTE DEL PREZZARIO COMPONENT
  pc: PrezziarioComponent;
  @Input() idPrezzari: number[];
  @Output() articoloPrezzarioAdded = new EventEmitter<boolean>();
  /**
   *
   */
  constructor(private _router: Router, private modalService: NgbModal, private serviziClientiservice: ServiziClienteService, private activatedRoute: ActivatedRoute, private _prezziarioGeneraleService: PrezziarioGeneraleService, private spinner: NgxSpinnerService) {
    this.pc = new PrezziarioComponent(_router, modalService, serviziClientiservice, activatedRoute, _prezziarioGeneraleService, spinner);
  }
  ngOnInit(): void {
    //dall'id del contratto prendo i prezzari generali collegati
    console.log("ID PREZZARI SMALL", this.idPrezzari);
    lastValueFrom(this._prezziarioGeneraleService.getPrezzariGenerali(this.idPrezzari)).then((res) => {
      this.prezzariGenerali = [...res];
      this.prezzariGenerali = [...this.prezzariGenerali]
    })
  }

  addCustomUms = (term) => ({ name: term });
}
