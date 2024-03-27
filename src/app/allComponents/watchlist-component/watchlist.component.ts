import { Component } from "@angular/core";
import { SharedService } from '../../shared.service';


@Component({
    selector:'app-watchlist',
    templateUrl: './watchlist.component.html',
    styleUrls: ['./watchlist.component.css'],
})

export class WatchlistComponent {
    isCardVisible: boolean = true;
    noMatchFound = false;
    stockPrice: any;
    price: any;
    stockdata: any;

    constructor(private sharedService: SharedService) { } 

    ngOnInit(): void {
        this.sharedService.data1.subscribe((data: any) => {
          this.stockdata = data;
        });
  
        this.sharedService.data2.subscribe((data: any) => {
          this.price = data;
        });
      }

    clearCard() {
        this.isCardVisible = false;
        this.noMatchFound = true;
    }
}