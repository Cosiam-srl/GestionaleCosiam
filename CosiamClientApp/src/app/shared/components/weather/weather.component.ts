import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Weather } from 'app/models/weather.model';
import { CantieriService } from 'app/shared/services/data/cantieri.service';
import { LoggingService, LogLevel } from 'app/shared/services/logging/logging.service';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss']
})
export class WeatherComponent implements OnInit {
  meteo: Weather = new Weather();

  constructor(private cantieriService: CantieriService) { }

  ngOnInit(): void {
    // this.cantieriService.getmeteo()
    // .subscribe(
    //   (res) => {
    //     this.meteo = res;
    //   },
    //   (err) => {
    //     LoggingService.log('errore nel recupero del meteo', LogLevel.warn, err)
    //   },
    //   () => { LoggingService.log('meteo estratto', LogLevel.debug, this.meteo) }
    // )
  }


}
