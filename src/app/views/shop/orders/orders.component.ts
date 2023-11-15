import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ServiceService } from 'app/shared/services/service.service';
import { StorageService } from 'app/shared/services/storage.service';
import { ShopService } from '../shop.service';
import { egretAnimations } from "../../../shared/animations/egret-animations";
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  animations: [egretAnimations]
})
export class OrdersComponent implements OnInit {

  constructor(
    private shopService: ShopService,
    private service: ServiceService,
    private storage: StorageService,
    private loader:AppLoaderService,
    private router:Router
  ) { }

  public dollar:number = 0;
  userInfo:any;
  address:string;
  ngOnInit(): void {
    this.dollar = this.shopService.dollar;
    this.userInfo = this.storage.getUserInfo();
    if(this.userInfo?.accountAddresses.length > 0){
      this.address = `${this.userInfo.accountAddresses[0].address || ''} ${this.userInfo.accountAddresses[0].exteriorNumber || ''} CP - ${this.userInfo.accountAddresses[0].postalCode || ''} ${this.userInfo.accountAddresses[0].settlement || ''} ${this.userInfo.accountAddresses[0].municipality || ''} ${this.userInfo.accountAddresses[0].city || ''} ${this.userInfo.accountAddresses[0].state || ''}`;
    }else{
      // this.router.navigateByUrl('/registerAddress');
    }
    
    // let shoppingCarId = this.userInfo.shoppingCar[0].id;
    this.getCart();
  }

  cart:any[] = [];
  // orders:any[] = [];
  getCart() {
    if(this.userInfo){
      this.loader.open('Cargando productos ...');
      // this.service.getShoppingCar().subscribe(cart => { 
      this.service.getShoppingCarsSimpleByNoEmpty().subscribe(
        (data:any) => {
          this.loader.close();
          if(data.body){
            let shoppingcar = JSON.parse(data.body);
            this.cart = shoppingcar.filter((s)=>s.shoppingStatusId != 1 && s.shoppingStatusId != 7);
          } else {
            this.service.openDialog('No se ha realizado ningún pedido.');
          }
          // this.cart.push(cart.body);
          // this.orders = cart.body.orders;
          // console.log(this.orders);
          // this.orders.forEach(item => {
          //   item.skuSapNavigation.salePriceDiscount = item.skuSapNavigation.salePrice - (item.skuSapNavigation.discount == null ? 0 : item.skuSapNavigation.discount);
          // });  
          // this.onQuantityChange();
          this.shopService.getBadgeCount();
        },
        (http: HttpErrorResponse) => {
          this.loader.close();
          this.service.processHttpResponse(http);
        });    
    }
  }

  public getOrderDate(date:Date){
    let orderDate = this.service.toOrderDatetime(date);
    return orderDate;
  }

  public getState(stateChar: number) : string
  {
    let stateResult = "No asignado";

    switch(stateChar){
      case 1:
        stateResult = "Agregado";
      break;

      case 2:
        stateResult = "Comprado";
      break;

      case 3:
        stateResult = "Enviado";
      break;

      case 4:
        stateResult = "Llegando";
      break;

      case 5:
        stateResult = "Entregado";
      break;

      case 6:
        stateResult = "Cancelado";
      break;
    }

    return stateResult;
  }

  businessRules(tiempoEstimado:Date, numeroGuia, stock, stockUs, stockEr, stockAs, trademarkId){
    // console.log(tiempoEstimado, numeroGuia, stock, stockUs, stockEr, stockAs, trademarkId);
    if(tiempoEstimado == null && numeroGuia == null){
      switch(Number(trademarkId)){
        // ======== REGLA DE NEGOCIO HITEC ======== //
        case 1:
          //Su hay stock en SAP
          if(stock > 0){
            return("3 a 5 días");
          }
          //
          else{
            return("No disponible por el momento");
          }
          break;
        // ======== REGLA DE NEGOCIO SECO ======== //
        case 2:
          //Si hay stock en US
          if(stockUs > 0){
            return("4 a 6 días");
          }
          //Si no hay stock en US, pero en EU
          else if(stockEr > 0){
            return("7 a 9 días");
          }
          //Si no hay stock en ninguno
          else{
            return("No disponible por el momento");
          }
          break;
        // ======== REGLA DE NEGOCIO DORMER ======== //
        case 4:
          //Si hay stock en US
          if(stockUs > 0){
            return("5 a 7 días");
          }
          //Si no hay stock en US, pero hay stock en EU
          else if(stockEr > 0){
            return("9 a 12 días");
          }
          //Si no hay stock en ninguno
          else{
            return("No disponible por el momento");
          }
          break;
  
        // ======== REGLA DE NEGOCIO SANDVIK ======== //
        case 3:
          //Si hay stock en US
          if(stockUs > 0){
            return("3 a 5 días");
          }
          //Si no hay stock en US, pero hay stock en EU
          else if(stockEr > 0){
            return("8 a 10 días");
          }
          //Si no hay en US, ni EU, pero hay stock en AS
          else if(stockAs > 0){
            return("12 a 18 días");
          }
          //Si no hay stock en ninguno
          else{
            return("No disponible por el momento");
          }
          break;
  
        // ======== REGLA DE NEGOCIO UNIVERSAL ROBOTS ======== //
        case 6:
          //Si hay stock en PIM
          if (stock > 0) {
            return("8 a 10 días");
          }
          else {
            return("No disponible por el momento");
          }
          break;
        // ======== REGLA DE NEGOCIO 5th AXIS ======== //
        case 12:
          //Si hay stock en PIM
          if (stock > 0) {
            return("10 a 12 días");
          }
          else {
            return("No disponible por el momento");
          }
          break;
  
        // ======== DEFAULT ======== //
        default:
          return("3 a 5 días");
          break;
      }
    } else {
      if(tiempoEstimado == null && numeroGuia != null){
        return("Determinado por número de guía");
      }
      else{
        // moment.locale('es-mx');
        // const format1 = "DD-MMM-YYYY";
        // tiempoEstimado = moment(tiempoEstimado).format(format1);
        return (this.service.toISODate(tiempoEstimado));
        //return(tiempoEstimado.substring(0, 10));
      }
    }
    
  }

  public goToOdrerDetails(order: any ){
    this.router.navigate(['/shop/orders/tracking'], { queryParams: { shoppingCartId: order.shoppingCarId , skuId: order.skuSap } });
    // let shoppingCartId:number = 1;
    // this.router.navigate(['/shop/orders/tracking'], { queryParams: { shoppingCartId: shoppingCartId , skuId: order.skuSap } });
    // this.router.navigate(['/pedidos/trackOrder'], { queryParams: { shopingCardId: order.shoppingCarId , skuId: order.skuSap } });
  }

  public getLogisticCompany(logisticCompanyId:string) : string
  {
    let stateResult = "";
    switch(logisticCompanyId){
      case '1':
        stateResult = "Paquetería: DHL";
        break;
      case '2':
        stateResult = "Paquetería: UPS";
        break;
      case '3':
        stateResult = "Paquetería: Paquetería Express";
        break;
      default:
        stateResult = "Paquetería: No asignado";
        break;
    }
    return stateResult;
  }

  public getLinkLogisticCompany(logisticCompanyId:string,guideNumber:string){
    let link = "";
    switch(logisticCompanyId){
      case '1':
        link = `https://www.dhl.com/mx-es/home/tracking/tracking-express.html?submit=1&tracking-id=${guideNumber}`;
        break;
      case '2':
        link = `https://www.ups.com/track?loc=es_MX&tracknum=${guideNumber}&requester=WT/`;
        break;
      case '3':
        link = `https://www.paquetexpress.com.mx/rastreo-de-envios/${guideNumber}`;
        break;
      default:
        link = "";
        break;
    }
    return link;
  }
}
