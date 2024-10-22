import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LoggingService, LogLevel } from 'app/shared/services/logging/logging.service';

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss']
})
export class ImageGalleryComponent implements OnChanges, OnInit {
  page = 1;
  pageSize = 8; // numero di elementi per ogni pagina
  @Input() images: string[];
  pagedImages: string[];

  onImageSelection(event: string): void {
    LoggingService.log('immagine selezionata', LogLevel.debug, event);
  }

  onPageChange(event: number): void {
    LoggingService.log('pagina selezionata', LogLevel.debug, event);
    const start = event - 1;
    this.pagedImages = this.images.slice(start * this.pageSize, start * this.pageSize + this.pageSize);
  }

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    
    LoggingService.log('ngOnChanges', LogLevel.debug, changes);
    this.images = [...changes.images.currentValue];
    this.onPageChange(this.page);
  }

  ngOnInit(): void {
    LoggingService.log('Immagini da mostrare:', LogLevel.debug, this.images);
    this.onPageChange(this.page);
  }

}
