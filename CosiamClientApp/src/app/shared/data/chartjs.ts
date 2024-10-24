// line chart

export let lineChartData: Array<any> = [

  { data: [65, 59, 80, 81, 56, 55, 40], label: 'My First dataset' },
  { data: [28, 48, 40, 19, 86, 27, 90], label: 'My Second dataset' },
  { data: [45, 25, 16, 36, 67, 18, 76], label: 'My Third dataset - No bezier' }

];
export let lineChartLabels: Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
export let lineChartOptions: any = {
  animation: {
    duration: 1000, // general animation time
    easing: 'easeOutBack'
  },
  hover: {
    animationDuration: 1000, // duration of animations when hovering an item
    mode: 'label'
  },
  responsiveAnimationDuration: 1000, // animation duration after a resize
  responsive: true,
  maintainAspectRatio: false,
  legend: {
    position: 'bottom',
  },
  scales: {
    xAxes: [{
      display: true,
      gridLines: {
        color: '#F5F5F5',
        drawTicks: false,
      },
      scaleLabel: {
        display: true,
        labelString: 'Month'
      }
    }],
    yAxes: [{
      display: true,
      gridLines: {
        color: '#F5F5F5',
        drawTicks: false,
      },
      scaleLabel: {
        display: true,
        labelString: 'Value'
      }
    }]
  },
  title: {
    display: true,
    text: 'Chart.js Line Chart - Legend'
  }
};
export let lineChartColors: Array<any> = [

  {

    fill: false,
    borderDash: [5, 5],
    borderColor: '#975AFF',
    pointBorderColor: '#975AFF',
    pointBackgroundColor: '#FFF',
    pointBorderWidth: 2,
    pointHoverBorderWidth: 2,
    pointRadius: 4,
  },
  {

    fill: false,
    borderDash: [5, 5],
    borderColor: '#F77E17',
    pointBorderColor: '#F77E17',
    pointBackgroundColor: '#FFF',
    pointBorderWidth: 2,
    pointHoverBorderWidth: 2,
    pointRadius: 4,
  },
  {
    lineTension: 0,
    fill: false,
    borderColor: '#40C057',
    pointBorderColor: '#40C057',
    pointBackgroundColor: '#FFF',
    pointBorderWidth: 2,
    pointHoverBorderWidth: 2,
    pointRadius: 4,
  },

];
export let lineChartLegend = true;
export let lineChartType = 'line';


// area chart
export let areaChartData: Array<any> = [

  { data: [0, 150, 140, 105, 190, 230, 270], label: 'Series A' },
  { data: [0, 90, 120, 240, 140, 250, 190], label: 'Series B' }

];
export let areaChartLabels: Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
export let areaChartOptions: any = {
  animation: {
    duration: 1000, // general animation time
    easing: 'easeOutBack'
  },
  legend: {
    position: 'bottom',
  },
  hover: {
    mode: 'label',
    animationDuration: 1000, // duration of animations when hovering an item
  },
  responsiveAnimationDuration: 1000, // animation duration after a resize
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    xAxes: [{
      display: true,
      gridLines: {
        color: '#F5F5F5',
        drawTicks: false,
      },
      scaleLabel: {
        display: true,
        labelString: 'Month'
      }
    }],
    yAxes: [{
      display: true,
      gridLines: {
        color: '#F5F5F5',
        drawTicks: false,
      },
      scaleLabel: {
        display: true,
        labelString: 'Value'
      }
    }]
  },
  title: {
    display: true,
    text: 'Chart.js Area Chart - Legend'
  }
};
export let areaChartColors: Array<any> = [


  {

    backgroundColor: 'rgba(189, 189, 189, 0.3)',
    borderColor: 'transparent',
    pointBackgroundColor: '#FFF',
    pointBorderColor: '#BDBDBD',
    pointHoverBackgroundColor: 'rgba(255, 141, 96,1)',
    pointRadius: '5',
    pointHoverBorderColor: '#FFF',
    pointHoverRadius: '5',
    pointBorderWidth: '2'
  },
  {

    backgroundColor: 'rgba(47, 139, 230, 0.7)',
    borderColor: 'transparent',
    pointBackgroundColor: '#FFF',
    pointBorderColor: '#2F8BE6',
    pointHoverBackgroundColor: '#2F8BE6',
    pointRadius: '5',
    pointHoverBorderColor: '#FFF',
    pointHoverRadius: '5',
    pointBorderWidth: '2'
  },

];
export let areaChartLegend = true;
export let areaChartType = 'line';

// scatter chart
export let scatterChartData: Array<any> = [

  {
    data: [
      {
        x: 1,
        y: -1.711e-2,
      }, {
        x: 1.26,
        y: -2.708e-2,
      }, {
        x: 1.58,
        y: -4.285e-2,
      }, {
        x: 2.0,
        y: -6.772e-2,
      }, {
        x: 2.51,
        y: -1.068e-1,
      }, {
        x: 3.16,
        y: -1.681e-1,
      }, {
        x: 3.98,
        y: -2.635e-1,
      }, {
        x: 5.01,
        y: -4.106e-1,
      }, {
        x: 6.31,
        y: -6.339e-1,
      }, {
        x: 7.94,
        y: -9.659e-1,
      }, {
        x: 10.00,
        y: -1.445,
      }, {
        x: 12.6,
        y: -2.110,
      }, {
        x: 15.8,
        y: -2.992,
      }, {
        x: 20.0,
        y: -4.102,
      }, {
        x: 25.1,
        y: -5.429,
      }, {
        x: 31.6,
        y: -6.944,
      }, {
        x: 39.8,
        y: -8.607,
      }, {
        x: 50.1,
        y: -1.038e1,
      }, {
        x: 63.1,
        y: -1.223e1,
      }, {
        x: 79.4,
        y: -1.413e1,
      }, {
        x: 100.00,
        y: -1.607e1,
      }, {
        x: 126,
        y: -1.803e1,
      }, {
        x: 158,
        y: -2e1,
      }, {
        x: 200,
        y: -2.199e1,
      }, {
        x: 251,
        y: -2.398e1,
      }, {
        x: 316,
        y: -2.597e1,
      }, {
        x: 398,
        y: -2.797e1,
      }, {
        x: 501,
        y: -2.996e1,
      }, {
        x: 631,
        y: -3.196e1,
      }, {
        x: 794,
        y: -3.396e1,
      }, {
        x: 1000,
        y: -3.596e1,
      }
    ], label: 'V(node2)'
  }

];
export let scatterChartLabels: Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
export let scatterChartOptions: any = {
  animation: {
    duration: 1000, // general animation time
    easing: 'easeOutBack'
  },
  hover: {
    animationDuration: 1000, // duration of animations when hovering an item
  },
  responsiveAnimationDuration: 1000, // animation duration after a resize
  responsive: true,
  maintainAspectRatio: false,
  title: {
    display: false,
    text: 'Chart.js Scatter Chart - Logarithmic X-Axis'
  },
  scales: {
    xAxes: [{
      type: 'logarithmic',
      position: 'bottom',
      gridLines: {
        zeroLineColor: 'rgba(0,0,0,.1)',
        color: '#F5F5F5',
        drawTicks: false,
      },
      scaleLabel: {
        labelString: 'Frequency',
        display: true,
      }
    }],
    yAxes: [{
      type: 'linear',
      ticks: {
        userCallback: function (tick) {
          return tick.toString() + 'dB';
        }
      },
      gridLines: {
        zeroLineColor: '#2F8BE6',
        color: '#F5F5F5',
        drawTicks: false,
      },
      scaleLabel: {
        labelString: 'Voltage',
        display: true
      }
    }]
  }
};
export let scatterChartColors: Array<any> = [
  {

    backgroundColor: 'rgba(81,117,224,.6)',
    borderColor: 'transparent',
    pointBorderColor: '#5175E0',
    pointBackgroundColor: '#FFF',
    pointBorderWidth: 2,
    pointHoverBorderWidth: 2,
    pointRadius: 4,
  }

];
export let scatterChartLegend = true;
export let scatterChartType = 'scatter';

// barChart
export let barChartOptions: any = {
  elements: {
    rectangle: {
      borderWidth: 2,
      borderSkipped: 'bottom'
    }
  },
  responsive: true,
  maintainAspectRatio: false,
  responsiveAnimationDuration: 500,
  legend: {
    position: 'top',
  },
  scales: {
    xAxes: [{
      display: true,
      gridLines: {
        color: '#F5F5F5',
        drawTicks: false,
      },
      scaleLabel: {
        display: true,
      }
    }],
    yAxes: [{
      display: true,
      gridLines: {
        color: '#F5F5F5',
        drawTicks: false,
      },
      scaleLabel: {
        display: true,
      }
    }]
  },
  title: {
    display: true,
    text: 'Chart.js Bar Chart'
  }

};
export let barChartLabels: string[] = ['January', 'February', 'March', 'April', 'May'];
export let barChartType = 'bar';
export let barChartLegend = true;

export let barChartData: any[] = [
  { data: [65, 59, 80, 81, 56], label: 'My First dataset' },
  { data: [28, 48, 40, 19, 86], label: 'My Second dataset' }
];

export let barChartColors: Array<any> = [


  {

    backgroundColor: '#975AFF',
    borderColor: 'transparent',
    pointBackgroundColor: 'transparent',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  },
  {

    backgroundColor: '#F77E17',
    borderColor: 'transparent',
    pointBackgroundColor: 'transparent',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  },

];

// Doughnut
export let doughnutChartLabels: string[] = ['January', 'February', 'March', 'April', 'May'];
export let doughnutChartData: number[] = [65, 35, 24, 45, 85];
export let doughnutChartColors: any[] = [{ backgroundColor: ['#975AFF', '#F77E17', '#40C057', '#F55252', '#2F8BE6'] }];
export let doughnutChartType = 'doughnut';
export let doughnutChartOptions: any = {
  animation: false,
  responsive: true,
  maintainAspectRatio: false
};
// Radar
export let radarChartLabels: string[] = ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'];

export let radarChartData: any = [
  { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
  { data: [45, 25, 16, 36, 67, 18, 76], label: 'Hidden dataset', hidden: true },
  { data: [28, 48, 40, 19, 86, 27, 78], label: 'Series B' },
];
export let radarChartType = 'radar';
export let radarChartColors: any[] = [
  {
    backgroundColor: 'rgba(151, 90, 255, 0.3)',
    borderColor: 'transparent',
    pointBorderColor: '#975AFF',
    pointBackgroundColor: '#FFF',
    pointBorderWidth: 2,
    pointHoverBorderWidth: 2,
    pointRadius: 4
  },
  {

  },
  {
    backgroundColor: 'rgba(151, 90, 255, 0.8)',
    borderColor: 'transparent',
    pointBorderColor: '#975AFF',
    pointBackgroundColor: '#FFF',
    pointBorderWidth: 2,
    pointHoverBorderWidth: 2,
    pointRadius: 4,
  }
];
export let radarChartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  responsiveAnimationDuration: 500,
  legend: {
    position: 'top',
  },
  title: {
    display: true,
    text: 'Chart.js Radar Chart'
  },
  scale: {
    reverse: false,
    ticks: {
      beginAtZero: true
    }
  }
};


// Pie
export let pieChartLabels: string[] = ['January', 'February', 'March', 'April', 'May'];
export let pieChartData: number[] = [85, 65, 34, 45, 35];
export let pieChartType = 'pie';
export let pieChartColors: any[] = [{ backgroundColor: ['#975AFF', '#F77E17', '#40C057', '#F55252', '#2F8BE6'] }];
export let pieChartOptions: any = {
  animation: false,
  responsive: true,
  maintainAspectRatio: false
};

// PolarArea
export let polarAreaChartLabels: string[] = ['January', 'February', 'March', 'April', 'May'];
export let polarAreaChartData: number[] = [65, 59, 80, 81, 56];
export let polarAreaLegend = true;
export let ploarChartColors: any[] = [{ backgroundColor: ['#975AFF', '#F77E17', '#40C057', '#F55252', '#2F8BE6'] }];


export let polarAreaChartType = 'polarArea';
export let polarChartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  responsiveAnimationDuration: 500,
  legend: {
    position: 'top',
  },
  title: {
    display: false,
    text: 'Chart.js Polar Area Chart'
  },
  scale: {
    ticks: {
      beginAtZero: true
    },
    reverse: false
  },
  animation: {
    animateRotate: false
  }
};
