import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceService } from 'app/shared/services/service.service';
import { IProduct, ShopService } from '../../shop.service';
import { egretAnimations } from "../../../../shared/animations/egret-animations";
import { LayoutService } from 'app/shared/services/layout.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';

@Component({
  selector: 'app-order-pay',
  templateUrl: './order-pay.component.html',
  styleUrls: ['./order-pay.component.scss'],
  animations: egretAnimations
})
export class OrderPayComponent implements OnInit {

  public key:String = "";
  public hmacDigest:string;
  public order:string = "";
  public reference:String = "";
  public price:string = "";
  public infoUser:any;
  public address:string;
  public dollar:number = 0;
  public path:string = this.order+this.reference+this.price;
  public ordersBack:any;
  layoutConf:any;
  dataSource: IProduct[];
  displayedColumns: string[] = ['article', 'quantity', 'price', 'total'];
  cart:any[] = [];
  PROD:boolean     = true;
  mpAccount:string = "";
  URL_BBVA:string  = "";
  URL_BBVA_SUCCESS:string = "";
  URL_BBVA_FAILED:string  = "";
  shoppingCarId:number    = -1;
  discountCodeKey:string  = "";

  constructor(
    private service:ServiceService,
    private shopService: ShopService,
    private router:Router,
    private layout:LayoutService,
    private loader:AppLoaderService,
  ) { }

  @ViewChild('form') formElement;

  initBBVAParams():void {
    this.mpAccount = this.PROD === true ? "10396" : "10084";
    this.URL_BBVA  = this.PROD === true ? "https://www.adquiramexico.com.mx/clb/endpoint/hitecTools/" : "https://prepro.adquiracloud.mx/clb/endpoint/hitecTools/";
    this.URL_BBVA_FAILED  = this.service.URL_BBVA_FAILED;
    this.URL_BBVA_SUCCESS = this.service.URL_BBVA_SUCCESS;
    this.URL_BBVA_SUCCESS = `${this.URL_BBVA_SUCCESS}/${this.shoppingCarId}/${this.requireBillChecked}${this.discountCodeKey?.length > 0 ? '/'+this.discountCodeKey : ''}`;
    //console.log('URL_FAILED',this.URL_BBVA_FAILED);
    //console.log('URL_SUCCESS',this.URL_BBVA_SUCCESS);
  }

  ngOnInit(): void {
    this.layoutConf = this.layout.layoutConf;
    let cart = JSON.parse(localStorage.getItem('cartToPay'));
    if(cart){
      this.cart = cart;
      this.cart.forEach(e => {
        e.priceStr = parseFloat((String(e.skuSapNavigation.salePrice))).toFixed(2);
        e.totalStr = parseFloat((String(e.skuSapNavigation.salePrice * e.quantity))).toFixed(2);
      });
      this.dataSource = this.cart;
    }
    let infoOrderUser:any = JSON.parse(localStorage.getItem('infoOrderUser'));
    this.order = infoOrderUser.int1;
    this.reference = infoOrderUser.string1;
    this.price =  Number(infoOrderUser.decimal1).toFixed(2);
    this.hmacDigest = infoOrderUser.string2;
    this.dollar = infoOrderUser.currentCurrency;
    //this.hashConvert();
    //Para mostrar la info de la direción de envío
    let infoUser = this.service.getSession();
    this.infoUser = infoUser;

    if(infoUser.accountAddresses?.length > 0){
      this.address = `${infoUser.accountAddresses[0].address || ''} ${infoUser.accountAddresses[0].exteriorNumber || ''} CP - ${infoUser.accountAddresses[0].postalCode || ''} ${infoUser.accountAddresses[0].settlement || ''} ${infoUser.accountAddresses[0].municipality || ''} ${infoUser.accountAddresses[0].city || ''} ${infoUser.accountAddresses[0].state || ''}`;
    }else{
      this.service.openDialog(`Para continuar: debes registrar/completar los datos de tu dirección.`).subscribe(
        () => {this.openRegister();}
      );
    }
    this.shoppingCarId   = cart[0]?.shoppingCarId;
    this.discountCodeKey = cart[0]?.discountCodeKey;
    this.initBBVAParams();
    this.getOrder();
  }

  async getOrder(submit:boolean = false){
    this.loader.open();
    await this.service.getOrders(this.infoUser.idUser).toPromise().then(
      async (data:any) => {
        this.ordersBack = data.body.shoppingCar.orders;
        this.loader.close();
        if(!this.verifyOrder()){
          this.service.openDialog(`La información de la orden ha cambiado con su carrito, verifique su información e intente de nuevo.`).subscribe(
            () => {this.router.navigate(['/shop/cart']);}
          );
        }else{
          if(submit){
            this.formElement.nativeElement.submit();
          }
        }
      },
      (http: HttpErrorResponse) => {
        this.loader.close();
        this.service.processHttpResponse(http);
        console.log(http);
      }
    );
  }

  verifyOrder(){
    if(this.ordersBack.length != this.dataSource.length) return false;
    for(let i = 0; i<this.dataSource.length; i++){
      if(this.ordersBack[i].skuSapNavigation?.salePrice != this.ordersBack[i].skuSapNavigation?.salePrice){
        return false;
      }
      if(this.ordersBack[i].quantity != this.ordersBack[i].quantity){
        return false;
      }
    }
    return true;
  }

  openRegister(){
    this.router.navigate(['/sessions/profile']);
  }

  requireBillChecked:number = 0;
  onChange(event:any) {
    this.requireBillChecked = event.checked ? 1 : 0;
    this.initBBVAParams();
  }

  public currentCurrency:number;
  getCurrentCurrencySAPSimple(){
    return this.service.getCurrentCurrencySAPSimple().toPromise().then(
    (data:any)=>{
      this.currentCurrency = data.body.decimal1;
      this.dollar = this.currentCurrency ? this.currentCurrency:this.dollar;
      /*
      switch(this.shoppingCar.transactionStateId){
        case 1:
          // this.createOrder();
          break;
        case 3:
            this.service.openDialog('Pago fallido');
          break;
      }*/
    },
    (error:HttpErrorResponse) => {
      this.service.processHttpResponse(error);
    });
  }

  submitForm(){
    this.getOrder(true);
  }
}
