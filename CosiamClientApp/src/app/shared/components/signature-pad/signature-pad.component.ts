import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import SignaturePad from 'signature_pad';

// https://edupala.com/how-to-add-angular-signature-pad/
// https://www.npmjs.com/package/signature_pad
@Component({
  selector: 'app-signature-pad',
  templateUrl: './signature-pad.component.html',
  styleUrls: ['./signature-pad.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SignaturePadComponent {

  title = 'signatureJS';
  signaturePad: SignaturePad;
  @ViewChild('canvas') canvasEl: ElementRef;
  signatureImg: string;
  @Output() firma = new EventEmitter<string>();

  constructor() { }

  ngAfterViewInit() {
    this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
    // colore e dimensioni della linea
    this.signaturePad.minWidth = 0.5;
    this.signaturePad.maxWidth = 1;
    this.signaturePad.penColor = 'rgb(66, 133, 244)';
  }

  startDrawing(event: Event) {
    console.log(event);
    // works in device not in browser


  }

  moved(event: Event) {
    // works in device not in browser
  }

  clearPad() {
    this.signaturePad.clear();
    this.signatureImg = ''
    this.firma.emit(this.signatureImg);
  }

  savePad() {
    const base64Data = this.signaturePad.toDataURL();
    this.signatureImg = base64Data;
    this.firma.emit(this.signatureImg);
  }

}
