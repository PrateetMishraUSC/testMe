import { Highchart } from './../../models/highchart';
import { earnings } from './../../models/earnings';
import { peers } from './../../models/peers';
import { insiderSentiments } from './../../models/sentiments';
import { rTrends } from './../../models/rTrends';
import { autoComplete } from './../../models/automcomplete';
import { companyNews } from './../../models/companyNews';
import { stockPrice } from './../../models/stockPrice';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Stock } from '../../models/stock';
import { map, filter, catchError, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http: HttpClient) { }

  stockData(ticker: string) : Observable<Stock> {
    let url = "http://localhost:3000/api/data/profile?ticker=" + ticker;
    return this.http.get<Stock>(url);
  }

  stockPrice(ticker: string) : Observable<stockPrice> {
    let url = "http://localhost:3000/api/data/stockprice?ticker=" + ticker;
    return this.http.get<stockPrice>(url);
  }

  rTrends(ticker: string) : Observable<rTrends> {
    let url = "http://localhost:3000/api/data/rtrends?ticker=" + ticker;
    return this.http.get<rTrends>(url);
  }

  insiderSentiments(ticker: string) : Observable<insiderSentiments> {
    let url = "http://localhost:3000/api/data/sentiments?ticker=" + ticker;
    return this.http.get<insiderSentiments>(url);
  }

  peers(ticker: string) : Observable<peers> {
    let url = "http://localhost:3000/api/data/peers?ticker=" + ticker;
    return this.http.get<peers>(url);
  }

  earnings(ticker: string) : Observable<earnings> {
    let url = "http://localhost:3000/api/data/earnings?ticker=" + ticker;
    return this.http.get<earnings>(url);
  }

  companyNews(ticker: string) : Observable<companyNews[]> {
    let url = "http://localhost:3000/api/data/companynews?ticker=" + ticker;
    return this.http.get<companyNews[]>(url).pipe(
      map(news => news.filter(item => item.image !== '')), 
      map(news => news.slice(0, 20))
    );
  }

  Highchart(ticker: string) : Observable<Highchart> {
    let url = "http://localhost:3000/api/data/highcharts?ticker=" + ticker;
    return this.http.get<Highchart>(url);
  }

  checkTickerExists(ticker: string) : Observable<boolean> {
    let url = "http://localhost:3000/api/data/profile?ticker=" + ticker;
    return this.http.get(url).pipe(
      map(response => Object.keys(response).length > 0), // returns true if response is not an empty object
      catchError(() => of(false)) // returns false if there's an error (e.g., server is down)
    );
  }
}
