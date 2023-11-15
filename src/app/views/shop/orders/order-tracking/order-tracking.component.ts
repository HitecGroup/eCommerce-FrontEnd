import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ServiceService } from 'app/shared/services/service.service';
import { StorageService } from 'app/shared/services/storage.service';

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss']
})
export class OrderTrackingComponent implements OnInit {

  constructor(
    private storage: StorageService,
    private service: ServiceService,
    private loader: AppLoaderService,
    private route : ActivatedRoute
  ) { }

  shoppingCartID:number;
  skuId: number;
  ngOnInit(): void {
    this.shoppingCartID = this.route.snapshot.queryParams.shoppingCartId;
    this.skuId = this.route.snapshot.queryParams.skuId;
    this.getDetailsOrder();
  }

  order:any={};
  statusImage:string="";
  public getDetailsOrder() {
    this.loader.open();
    this.service.getOrderDetails(this.shoppingCartID, this.skuId).subscribe(
    (response: any) => {
      this.loader.close();
      if(response.body){
        this.order = response.body;
        this.statusImage = this.getNameStatus(response.body.orderStateId);
      }else{
        this.order = new Object();
      }
    }, 
    (http: HttpErrorResponse) => {
      this.loader.close();
      this.service.processHttpResponse(http);
    });
}

  orderDate:string;
  public getOrderDate(){
    this.orderDate = this.service.toISODate(this.order.createdAt);
    return this.orderDate;
  }

  public getOrderDateExtended(){
    this.orderDate = this.service.toExtendedDate(this.order.createdAt);
    return this.orderDate;
  }

  
  public getNameStatus(status:number):string{
    switch (status) {
      case 1:
        return 'estado1.png'; //Agregado
      break;
      
      case 2:
        return 'estado1.png'; //Comprado
      break;

      case 3:
        return 'estado2.png'; //Enviado
      break;

      case 4:
        return 'estado3.png'; //Llegando
      break;

      case 5:
        return 'estado4.png'; //Entregado
      break;

      case 6:
        return 'estado5.png'; //Cancelado
      break;
      
      default:
        return 'estado1.png';
    }
  }

  onImgError(event, id: any){
    let imgURoute = "assets/images/orders/default.jpg";
    switch (Number(id)) {
      case 1:
        imgURoute = "assets/images/orders/default.jpg"; //HITEC
      break;

      case 2:
        imgURoute = "assets/images/orders/2-SECO.jpg"; //SECO
      break;

      case 3:
        imgURoute = "assets/images/orders/3-SANDVIK.jpg"; //SANDVIK
        break;

      case 4:
        imgURoute = "assets/images/orders/4-DORMER.jpg"; //DORMER
        break;

      case 5:
        imgURoute = "assets/images/orders/5-NX SIEMENS.jpg"; //NXSIEMS 
        break;

      case 6:
        imgURoute = "assets/images/orders/6-UNIVERSAL ROBOTS.jpg"; // UNIVERSAL ROBOTS         
        break;
        
      case 7:
        imgURoute = "assets/images/orders/7-TOP SOLID.jpg"; // TOP SOLID
        break;
        
      case 8:
        imgURoute = "assets/images/orders/default.jpg";  // EZ PULLER / ACCUDYNE 
        break;

      case 9:
        imgURoute = "assets/images/orders/9-ROHM.jpg"; //ROHM
        break;

      case 10:
        imgURoute = "assets/images/orders/10-OAKSIGNATURE.jpg";  //OAK SIGNATURE
        break;

      case 11:
        imgURoute = "assets/images/orders/default.jpg"; // CNC EDM TOOL SYSTEMS LTD      
        break;

      case 12:
        imgURoute = "assets/images/orders/12-5thAxis.jpg"; // 5TH AXIS
        break;

      case 13:
        imgURoute = "assets/images/orders/13-VEKTEK-GERARDI.jpg"; // VEKTEK - GERARDI 
        break;

      case 14:
        imgURoute = "assets/images/orders/14-MIDACO.jpg"; // MIDACO
        break;

      case 15:
        imgURoute = "assets/images/orders/15-AIRTURBINE.jpg"; // AIRTURBINE 
        break;
    }
    
    event.target.src = imgURoute;
   //Do other stuff with the event.target
  }

}
