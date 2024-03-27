import { Component, TemplateRef } from "@angular/core";
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from '../../shared.service';



@Component({
    selector:'app-portfolio',
    templateUrl: './portfolio.component.html',
    styleUrls: ['./portfolio.component.css'],
})

export class PortfolioComponent {
  stockPrice: any;
  price: any;
  stockdata: any;
    constructor(private modalService: NgbModal, private sharedService: SharedService) { } 

    isCardVisible: boolean = true;
    noMatchFound = false;
    closeResult = '';

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

    open(content: TemplateRef<any>, newsItem: any) {
        this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
          (result) => {
            this.closeResult = `Closed with: ${result}`;
          },
          (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          },
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
    
}