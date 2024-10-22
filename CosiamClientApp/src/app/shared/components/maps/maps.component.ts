import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import OSM from 'ol/source/OSM';
import * as olProj from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import { Attribution, defaults as defaultControls } from 'ol/control';
import Rotate from 'ol/control/Rotate';

// https://medium.com/front-end-weekly/angular-9-create-an-interactive-map-with-openlayers-part-i-1b7c30d37ceb

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MapsComponent implements OnInit {
  map: any;


  constructor() { }

  ngOnInit(): void {
    this.map = new Map({
      target: 'hotel_map',
      controls: defaultControls({attribution: false}),
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: olProj.fromLonLat([30.902782, 32.496365]),
        zoom: 7,

      })
    });

  }

}
