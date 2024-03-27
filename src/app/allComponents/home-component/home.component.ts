import { Highchart } from './../../models/highchart';
import { companyNews } from './../../models/companyNews';
import { peers } from './../../models/peers';
import { insiderSentiments } from './../../models/sentiments';
import { rTrends } from './../../models/rTrends';
import { stockPrice } from './../../models/stockPrice';
import { DataService } from './../../data.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import {
  startWith,
  map,
  finalize,
  tap,
  catchError,
  switchMap,
  filter,
  debounceTime,
} from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { HttpClient } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { HomeService } from './home.service';
import { ThisReceiver } from '@angular/compiler';
import { DatePipe } from '@angular/common';
import * as Highcharts from 'highcharts';
import HC_stock from 'highcharts/modules/stock';
import HC_indicators from 'highcharts/indicators/indicators';
import HC_vbp from 'highcharts/indicators/volume-by-price';
import { TemplateRef, Inject } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from '../../shared.service';

HC_stock(Highcharts);
HC_indicators(Highcharts);
HC_vbp(Highcharts);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  public positiveSumChange = 0;
  public negativeSumChange = 0;
  public positiveSumMspr = 0;
  public negativeSumMspr = 0;
  public totalSumChange = 0;
  public totalSumMspr = 0;
  starClicked: boolean = false;
  stockData: any;
  peers: any;
  error: string;
  stockPrice: any;
  companyNews: any;
  insiderSentiments: any;
  currentNewsItem: any;
  Highchart: Highchart;
  constructor(
    private http: HttpClient,
    private router: Router,
    private data: DataService,
    private modalService: NgbModal,
    private homeService: HomeService,
    private sharedService: SharedService
  ) {}
  control = new FormControl('');
  symbols: string[] = [];
  symbolValue: string;
  filteredSymbols: Observable<string[]>;
  searching = false;
  noMatchFound = false;
  noInputEntered = false;
  closeResult = '';

  open(content: TemplateRef<any>, newsItem: any) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
    this.currentNewsItem = newsItem;
  }

  openModal2(content: TemplateRef<any>) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  ngOnInit() {
    this.filteredSymbols = this.control.valueChanges.pipe(
      tap(() => (this.searching = true)),
      debounceTime(300),
      switchMap((value) => this._fetchData(value ?? '')),
      finalize(() => (this.searching = false))
    );
    this.data.currentSearch.subscribe((search) =>
      this.control.setValue(search)
    );
  }

  private _fetchData(value: string): Observable<string[]> {
    if (!value) {
      return of([]);
    }
    return this.http
      .get<any>('http://localhost:3000/fetch-data', {
        params: { search: value },
      })
      .pipe(
        map((data: { result?: any[] }) => {
          if (!data.result) {
            return [];
          }
          this.symbols = data.result.map(
            (item: { displaySymbol: any; description: any }) =>
              item.displaySymbol
                ? `${item.displaySymbol} | ${item.description}`
                : ''
          );
          return this.symbols;
        }),
        catchError((error) => {
          console.error(error);
          this.error = 'An error occurred while fetching data';
          return of([]);
        })
      );
  }

  splitStockName(symbol: string): string {
    return symbol.split(' | ')[0];
  }

  private _filter(value: string): string[] {
    const filterValue = this._normalizeValue(value);
    return this.symbols.filter((symbol) =>
      this._normalizeValue(symbol).includes(filterValue)
    );
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  onClear() {
    this.control.reset();
    this.stockData = null;
    this.insiderSentiments = null;
    this.peers = null;
    this.companyNews = null;
    this.stockPrice = null;
    this.noMatchFound = false;
    this.noInputEntered = false;
  }

  onSearch() {
    this.noMatchFound = false;
    this.noInputEntered = false;
    if (!this.control.value) {
      // check if control.value is truthy
      this.noInputEntered = true; // show warning when no ticker is entered
      return;
    }
    if (this.control.value !== null) {
      this.homeService
        .checkTickerExists(this.control.value)
        .subscribe((exists) => {
          if (exists) {
            if (this.control.value !== null) {
              this.data.changeSearch(this.control.value);
              this.stock(this.control.value); // Call the stock method to get the stock data
              //this.router.navigate(['/search', this.symbolValue]); // Navigate to the new route
              this.Price(this.control.value);
              this.rTrends(this.control.value);
              this.insiderSentimentsData(this.control.value);
              this.peersData(this.control.value);
              this.earnings(this.control.value);
              this.companyNewsData(this.control.value);
              this.HighchartData(this.control.value);
            }
          } else {
            this.noMatchFound = true;
            this.stockData = null;
            this.insiderSentiments = null;
            this.peers = null;
            this.companyNews = null;
            this.stockPrice = null;
          }
        });
    } else {
      this.noInputEntered = true;
    }
  }

  isMarketOpen(t: number): boolean {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    return now - t * 1000 < fiveMinutes;
  }
  transformTimestamp(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString().replace(/,/g, '');
  }

  stock(ticker: string) {
    console.log(ticker);
    this.homeService.stockData(ticker).subscribe((data) => {
      this.stockData = data;
      console.log(data);
      this.sharedService.updateData1(data);
    });
  }

  Price(ticker: string) {
    this.homeService.stockPrice(ticker).subscribe((data) => {
      this.stockPrice = data;
      console.log(data);
      this.sharedService.updateData2(data);
    });
  }

  rTrends(ticker: string) {
    this.homeService.rTrends(ticker).subscribe((data) => {
      console.log(data);
    });
  }

  insiderSentimentsData(ticker: string) {
    this.homeService.insiderSentiments(ticker).subscribe((data) => {
      this.insiderSentiments = data;
      this.calculateSums(this.insiderSentiments);
      console.log(data);
    });
  }

  calculateSums(response: any) {
    this.positiveSumChange = 0;
    this.negativeSumChange = 0;
    this.positiveSumMspr = 0;
    this.negativeSumMspr = 0;
    this.totalSumChange = 0;
    this.totalSumMspr = 0;

    response.data.forEach((item: { change: number; mspr: number }) => {
      if (item.change > 0) {
        this.positiveSumChange += item.change;
        this.positiveSumMspr += item.mspr;
      } else {
        this.negativeSumChange += item.change;
        this.negativeSumMspr += item.mspr;
      }
      this.totalSumChange += item.change;
      this.totalSumMspr += item.mspr;
    });
    this.positiveSumChange = parseFloat(this.positiveSumChange.toFixed(2));
    this.negativeSumChange = parseFloat(this.negativeSumChange.toFixed(2));
    this.positiveSumMspr = parseFloat(this.positiveSumMspr.toFixed(2));
    this.negativeSumMspr = parseFloat(this.negativeSumMspr.toFixed(2));
    this.totalSumMspr = parseFloat(this.totalSumMspr.toFixed(2));
  }

  peersData(ticker: string) {
    this.homeService.peers(ticker).subscribe((data) => {
      this.peers = data;
      console.log(data);
    });
  }

  earnings(ticker: string) {
    this.homeService.earnings(ticker).subscribe((data) => {
      console.log(data);
    });
  }

  companyNewsData(ticker: string) {
    this.homeService.companyNews(ticker).subscribe((data) => {
      this.companyNews = data;
      console.log(data);
    });
  }

  HighchartData(ticker: string) {
    this.homeService.Highchart(ticker).subscribe((data) => {
      this.Highchart = data;
      console.log(data);
    });
  }

  public Highcharts: typeof Highcharts = Highcharts;
  updateFlag = true;
  public chartOptions: Highcharts.Options = {
    chart: {
      backgroundColor: '#f7f7f7',
    },
    title: {
      text: 'AAPL Hourly Price Variation',
      align: 'center',
      style: {
        color: '#bcbcbc',
        fontSize: '15px',
      },
    },
    series: [
      {
        type: 'line',
        data: [1, 2, 3, 4, 5],
      },
    ],
  };

  public barChartOptions: Highcharts.Options = {
    chart: {
      type: 'column',
      backgroundColor: '#f7f7f7',
    },

    title: {
      text: 'Recommendation Trends',
      align: 'center',
      style: {
        fontSize: '15px',
      },
    },

    xAxis: {
      categories: ['Gold', 'Silver', 'Bronze'],
    },

    yAxis: {
      allowDecimals: false,
      min: 0,
      title: {
        text: '#Analysis',
      },
    },

    plotOptions: {
      column: {
        stacking: 'normal',
      },
    },

    series: [
      {
        type: 'column',
        name: 'Strong Buy',
        color: 'darkgreen',
        data: [],
      },
      {
        type: 'column',
        name: 'Buy',
        color: 'green',
        data: [],
      },
      {
        type: 'column',
        name: 'Hold',
        color: 'yellow',
        data: [],
      },
      {
        type: 'column',
        name: 'Sell',
        color: 'orange',
        data: [],
      },
      {
        type: 'column',
        name: 'Strong Sell',
        color: 'red',
        data: [],
      },
    ],
  };

  public splineChartOptions: Highcharts.Options = {
    chart: {
      type: 'spline',
      backgroundColor: '#f7f7f7',
    },
    title: {
      text: 'Historical EPS Surprises',
      align: 'center',
      style: {
        fontSize: '15px',
      },
    },
    xAxis: {
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      accessibility: {
        description: 'Months of the year',
      },
    },
    yAxis: {
      title: {
        text: 'Temperature',
      },
      labels: {
        format: '{value}°',
      },
    },
    tooltip: {
      shared: true,
    },
    plotOptions: {
      spline: {
        marker: {
          radius: 4,
          lineColor: '#666666',
          lineWidth: 1,
        },
      },
    },
    series: [
      {
        type: 'line',
        name: 'Tokyo',
        marker: {
          symbol: 'square',
        },
        data: [
          5.2,
          5.7,
          8.7,
          13.9,
          18.2,
          21.4,
          25.0,
          {
            y: 26.4,
            marker: {
              symbol:
                'url(https://www.highcharts.com/samples/graphics/sun.png)',
            },
            accessibility: {
              description:
                'Sunny symbol, this is the warmest point in the chart.',
            },
          },
          22.8,
          17.5,
          12.1,
          7.6,
        ],
      },
      {
        type: 'line',
        name: 'Bergen',
        marker: {
          symbol: 'diamond',
        },
        data: [
          {
            y: 1.5,
            marker: {
              symbol:
                'url(https://www.highcharts.com/samples/graphics/snow.png)',
            },
            accessibility: {
              description:
                'Snowy symbol, this is the coldest point in the chart.',
            },
          },
          1.6,
          3.3,
          5.9,
          10.5,
          13.5,
          14.5,
          14.4,
          11.5,
          8.7,
          4.7,
          2.6,
        ],
      },
    ],
  };

  public smaChartOptions: Highcharts.Options = {
    rangeSelector: {
      selected: 2,
    },
    title: {
      text: 'AAPL Historical',
    },
    subtitle: {
      text: 'With SMA and Volume by Price technical indicators',
    },
    yAxis: [
      {
        startOnTick: false,
        endOnTick: false,
      },
    ],
    series: [
      {
        type: 'candlestick',
        name: 'AAPL',
        id: 'aapl',
        zIndex: 2,
        data: [], // Your data goes here
      },
      {
        type: 'column',
        id: 'volume',
        data: [], // Your volume data goes here
      },
      {
        type: 'vbp',
        linkedTo: 'aapl',
        params: {
          volumeSeriesID: 'volume',
        },
        dataLabels: {
          enabled: false,
        },
        zoneLines: {
          enabled: false,
        },
      },
      {
        type: 'sma',
        linkedTo: 'aapl',
        zIndex: 1,
        marker: {
          enabled: false,
        },
        params: {
          period: 14,
          index: 3,
        },
      },
    ],
  };
}
