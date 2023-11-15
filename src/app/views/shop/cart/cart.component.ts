import { Component, OnInit } from '@angular/core';
import { ShopService, CartItem, IProduct } from '../shop.service';
import { egretAnimations } from "../../../shared/animations/egret-animations";
import { payForm, ServiceService } from 'app/shared/services/service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { StorageService } from 'app/shared/services/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutService } from 'app/shared/services/layout.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  animations: [egretAnimations]
})
export class CartComponent implements OnInit {
  public cart:any = [];
  public total: string;
  public subTotal: string;
  public envio:string;
  public minIVA: number = 8;
  public maxIVA: number = 16;
  public IVA: number = 16;  
  public dollar:number = 0;
  public addressId:number = 0;
  public addresses:any[] = [{id:0,address:"Col. Centro #12345"},{id:0,address:"Col. Norte #54321"}];
  public address:string;
  public shoppingCarID:any;
  public userInfo:any;
  public showCartSection:boolean = true;
  public showComboSection:boolean = false;
  layoutConf:any;
  
  constructor(
    private shopService: ShopService,
    private service: ServiceService,
    private storage: StorageService,
    private loader:AppLoaderService,
    private router:Router,
    private layout:LayoutService,
    private activatedRoute:ActivatedRoute
  ) { }

  async ngOnInit() {
    this.userInfo = this.storage.getUserInfo();
    this.layoutConf = this.layout.layoutConf;
    if(this.userInfo) {
      this.dollar = this.shopService.dollar;
      const response = await this.getCart();
      //Evaluamos si se realizó alguna compra
      await this.activatedRoute.queryParams.subscribe(
        (params:any) => {
          try {
            if (params.hasOwnProperty('success') && params.hasOwnProperty('msg')) {
              let success:boolean = params.success === 'true' ? true : false;
              let message:string  = String(params.msg) || undefined;
              this.service.openDialog(message).subscribe(
                () => {
                  if (success === true) {
                    //this.emptyCart();
                    this.router.navigate(['/shop/orders']);
                  }
                }
              )
            }
          } catch (error) {
            console.log(error);
            this.service.openDialog(`Ocurrió un error al obtener la información del pedido, contacte con el equipo de soporte.`);
          }
        }
      );
    }
  }

  async getCart() {
    await this.getOrders();
    await this.shopService.getBadgeCount();  
  }

  orders:any[] = [];
  ordersBackup:any[] = [];
  combos:any[] = [];
  totalCombos:any;
  shoppingCar:any;
  showDiv:boolean;
  isShow:boolean;
  getOrders(){
    this.loader.open('Cargando productos ...');
    this.orders = [];

    this.address  = this.userInfo.accountAddresses.length > 0 ? 
                    this.userInfo.accountAddresses[0].address + ' ' + this.userInfo.accountAddresses[0].postalCode : 'Sin dirección';

    return this.service.getOrders(this.userInfo.idUser).toPromise().then(
      async (data:any) => {
        this.loader.close();
        let messageOrderDelete = '';
        data.body.ordersDelete.map((orderd)=>{
          messageOrderDelete += `${orderd.skuSap} - ${orderd.skuSapNavigation.itemName}<br/>`;
        });
        let messageOrderUpdated = '';
        data.body.ordersUpdate.map((orderu)=>{
          messageOrderUpdated += `${orderu.skuSap} - ${orderu.skuSapNavigation.itemName} cambio a  ${orderu.quantity} <br/>`;
        });
        if(messageOrderDelete || messageOrderUpdated){
          messageOrderDelete = (messageOrderDelete) ? '<b>No se cuenta con stock:</b><br/>'+messageOrderDelete : '';
          messageOrderUpdated = (messageOrderUpdated) ? '<b>Productos con cantidades actualizadas:</b><br/>'+messageOrderUpdated : '';
          this.service.openDialog(messageOrderDelete+messageOrderUpdated);
        }
        this.loader.close();
        this.orders = data.body.shoppingCar.orders;
        this.combos = data.body.combos;
        //console.log(this.combos);
        this.totalCombos = new Array(this.combos.length);
        
        this.shoppingCar= data.body.shoppingCar;
        this.shoppingCarID = this.shoppingCar.id;
        if (this.totalCombos.length > 0) {
          for (let index = 0; index < this.combos.length; index++) {
            const element =  this.combos[index];
            if(element.orders) this.calculateTotalCartByCombo(element.orders, index);
          }
        }
        //console.log(this.totalCombos);
        if (this.orders?.length>0){
          this.ordersBackup = JSON.parse(JSON.stringify(this.orders));
          this.showDiv = true; 
          this.calculateTotalCart();
          this.isShow = true;
        } else {
          this.showDiv=false;
          this.cart = [];
          //this.service.openDialog('No hay productos en el carrito actualmente.');
          this.isShow = false;
        }
        await this.getCurrentCurrencySAPSimple();
        await this.getBadgeCount();
      },
      (http: HttpErrorResponse) => {
        this.loader.close();
        this.service.processHttpResponse(http);
      }
    );
  }

  removeProduct(order:any){
    let params = {
      shopingCarID: this.shoppingCarID,
      skuSap: order.skuSap
    };
    this.loader.open('Eliminando producto del carrito ...');
    this.service.deleteOrder(params).subscribe(
      (data:any) => {
        this.loader.close();
        this.service.openDialog(`Producto: '${params.skuSap}' eliminado satisfactoriamente.`).subscribe(
          () => 
          {
            this.getCart();
          }
        );
      },
      (http: HttpErrorResponse) => {
        this.loader.close();
        this.service.openDialog("Error en el Servicio 1201");
      }
    );
  }

  emptyCart(){
    this.loader.open('Vaciando carrito de compras ...');
    return this.service.deleteOrders(this.shoppingCarID).toPromise().then(
      (data:any) => {
        this.loader.close();
        this.service.openDialog(`Carrito de compras vacío.`).subscribe(
          () => {
            localStorage.removeItem('infoOrderUser');
            localStorage.removeItem('cartToPay');
            this.getCart();
          }
        );        
      },
      (http: HttpErrorResponse) => {
        this.loader.close();
        this.service.processHttpResponse(http);
      }
    );
  }
  
  onQuantityChange(item:any) {
    this.service.openDialog(`Para adicionar más artículos deberás borrar el artículo y dirigirte a la liga del detalle del artículo para configurar la nueva cantidad.`).subscribe(
      () => 
      { }
    );        
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

  businessRules(stock, stockUs, stockEr, stockAs, trademarkId){
    return this.service.businessRules(stock, stockUs, stockEr, stockAs, trademarkId);
  }

  getPriceCurrentCurrency(price:any){
    let valor:number = Number((Number(this.dollar)*Number(price)));
    return this.numberWithCommas(Number(valor.toFixed(2)));
  }

  public currentCurrency:number;
  public currentCurrencyMessage:string;
  getCurrentCurrencySAPSimple(){
    this.loader.open();
    return this.service.getCurrentCurrencySAPSimple().toPromise().then(
    (data:any)=>{
      this.loader.close();
      this.currentCurrency = data.body.decimal1;
      this.dollar = this.currentCurrency ? this.currentCurrency:this.dollar;
      this.currentCurrencyMessage = data.body.string1;
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
      this.loader.close();
      this.service.processHttpResponse(error);
    });
  }

  checked:boolean = false;
  discountCodeKey:string="";
  createOrder(){
    let formPago = this.getFormPay();
    if (this.shoppingCarID){
      this.loader.open('Generando compra ...');
      this.service.createOrder(this.shoppingCarID, this.checked, this.discountCodeKey, formPago).subscribe(
        async (data:any) => {
          this.loader.close();
          this.service.openDialog(data.string1);
          if(data.bool1){
            localStorage.removeItem('infoOrderUser');
            await this.getBadgeCount();
            this.router.navigate(['/shop/orders']);
          }
        },
        (http: HttpErrorResponse) => {
          this.loader.close();
          this.service.openDialog("Error en el Servicio1204");
        }
      );
    }
  }

  getBadgeCount(){
    return this.service.getBadgeCount().toPromise().then(
      (data:any) => {
          this.userInfo.shoppingCarCount  = data;
          localStorage.setItem('infoUser', JSON.stringify(this.userInfo));
          // this.paramsBadge.setParamsToBadgeContent(data);
      },
      (http: HttpErrorResponse) => {
        this.loader.close();
      }
    );
  }

  getFormPay(){
    let totalMXN:number = Number((Number(this.dollar)*Number(this.total)));
    let formPago:payForm = new payForm(Number(this.total),totalMXN);
    return formPago;
  }

  calculateTotal(price = 0, quantity=0, discount:number=0){
    var total:number = Number(Number(price) * Number(quantity));
    total = total - (total * (discount/100));
    return this.numberWithCommas(Number(total).toFixed(2));
  }

  public numberWithCommas(x:any) {
    x = Number(x).toFixed(2)
    return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  discount:any;
  aplicateDiscount:boolean=false;
  // subtotal:string;
  // Total:string;
  calculateTotalCart(){
    let totalPayA = 0;
    let total = 0;
    let envio = 0;
    let subTotal = 0;
    let iva = 0;
    this.orders.map((order)=>{
      let aplicateDiscountTemp = 0;
      for (let rbp = 0; rbp < order?.skuSapNavigation?.relBannersProducts?.length; rbp++) {
        let banner = order?.skuSapNavigation?.relBannersProducts[rbp]?.banner || {};
        let discountFound = banner?.discountCodeId ? 0 : (banner?.active ? banner?.discountReference : 0);
        if(banner?.discountCodeId && this.discount?.id == banner?.discountCodeId && this.discount && Number(this.discount.discount)>0){
          // si es descuento por codigo se aplica de una vez
          this.aplicateDiscount = true;
          discountFound = Number(this.discount.discount);
          aplicateDiscountTemp = discountFound;
        }else if(this.aplicateDiscount){
          // si es hay un descuento de producto mayor al del codigo no aplicar
          discountFound = 0;
        }
        // para obtener el mejor decuento por producto-banner
        if(discountFound>aplicateDiscountTemp)
          aplicateDiscountTemp = discountFound;
      }
      
      order.skuSapNavigation.discount = aplicateDiscountTemp;
      let price = Number(order.skuSapNavigation?.salePrice) * Number(order.quantity);
      let descuento = price - Number( price - (price * Number(aplicateDiscountTemp || 0)/100));
      totalPayA +=  price - descuento;
    });
    if(this.verifyOrderSECO() == true){
     envio=10;
    }
    subTotal = Number(totalPayA);
    iva = Number((Number(subTotal)+ Number(envio))*(this.iva/100));
    total = Number(subTotal)+Number(iva)+ Number(envio);
    this.subTotal = subTotal.toFixed(2);
    this.envio = envio.toFixed(2);
    this.ivaString = iva.toFixed(2);
    this.total = total.toFixed(2);
    this.cart = this.orders;
  }

  calculateTotalWithOutCommas(price = 0, quantity=0, discount:number=0){
    var total:number = Number(Number(price) * Number(quantity));
    total = total - (total * (discount/100));
    return Number(total).toFixed(2);
  }

  public iva:number = 16;
  public ivaString:string="0.00";
  calculateTotalCartByCombo(combo: Array<any>, pos:number){
    let totalPayA = 0;
    let total = 0;
    let envio = 0;
    let subTotal = 0;
    let iva = 0;
    let showDiv = combo.length > 0;
    let carId= 0;

    combo.map((order)=>{
      let aplicateDiscountTemp = 0;
      carId = order?.shoppingCarId;
      if(this.combos[pos].hasOwnProperty('comboDiscount') && this.combos[pos]?.comboDiscount != null ){
        aplicateDiscountTemp = this.combos[pos].comboDiscount;
      }

      order.skuSapNavigation.discount = aplicateDiscountTemp;
      
      //order.skuSapNavigation.discount = aplicateDiscountTemp;
      let price = Number(order.skuSapNavigation?.salePrice) * Number(order.quantity);
      let descuento = price - Number( price - (price * Number(aplicateDiscountTemp || 0)/100));
      totalPayA +=  price - descuento;
    })
    if(this.verifyOrderSECOCombo(this.combos[pos]) == true){
     envio=10;
    }

    subTotal = Number(totalPayA);
    iva = Number((Number(subTotal)+ Number(envio))*(this.iva/100));
    total = Number(subTotal)+Number(iva)+ Number(envio);
    // this.subTotal = subTotal.toFixed(2);
    // this.envio = envio.toFixed(2);
    // this.ivaString = iva.toFixed(2);
    // this.total = total.toFixed(2);
    var totales = {
      subTotal: subTotal.toFixed(2),
      envio: envio.toFixed(2),
      ivaString: iva.toFixed(2),
      total : total.toFixed(2),
      showDiv : true,
      shoppingCarID : carId,
      combo:this.combos[pos].comboName
    }

    this.totalCombos[pos]= totales;
  }

  public verifyOrderSECOCombo(combo : any ){
    let orders =combo?.orders;
    let hasSECO = false;
    orders.forEach(
      (order: any)=> {
        if(order.skuSapNavigation.trademarkId == 2){
          hasSECO = true;
        }
      });
    return hasSECO;
  }

  public verifyOrderSECO(){
    let orders = this.orders;
    let hasSECO = false;
    if(this.orders?.length){
      orders.forEach(
        (order: any)=> {
          if(order.skuSapNavigation.trademarkId == 2){
            hasSECO = true;
          }
        });
    }
    return hasSECO;
  }

  deleteCombo(shoppingCarID){
    this.loader.open('Eliminando combo ...');
    this.service.deleteCombos(shoppingCarID).subscribe(
      (data:any) => {
        this.loader.close();
        this.service.openDialog(`Combo eliminado correctamente.`);
        this.getOrders();
      },
      (http: HttpErrorResponse) => {
        this.loader.close();
        this.service.processHttpResponse(http);
      }
    );
  }

  public getShoppingCarID(){
    return this.shoppingCarID;
  }

  payOrder(){
    let shoppingCarID = this.getShoppingCarID();
    let formPago = this.getFormPay();
    if (!formPago.payUSD || !formPago.payMXN){
      this.service.openDialog(`No hay montos definidos en los productos, favor de verificar`);
      return;
    }
    if (shoppingCarID && shoppingCarID != undefined && shoppingCarID != null){
      this.loader.open();
      this.service.payOrder(shoppingCarID, this.discountCodeKey, formPago).subscribe(
        (data:any) => {
          this.loader.close();
          this.cart[0].discountCodeKey = this.discountCodeKey;
          data.currentCurrency = this.dollar;
          localStorage.setItem('cartToPay', JSON.stringify(this.cart));
          localStorage.setItem('infoOrderUser', JSON.stringify(data));
          this.router.navigate(['/shop/orders/pay']);
        },
        (http: HttpErrorResponse) => {
          this.loader.close();
          this.service.processHttpResponse(http);
        }
      );
    }
  }

  getFormPayCombo(combo: any){
    let totalMXN:number = Number((Number(this.dollar)*Number(combo?.total)));
    let formPago:payForm = new payForm(Number(combo?.total),totalMXN);
    return formPago;
  }

  payOrderByCombo(combo: any){
    let shoppingCarID = combo?.shoppingCarID;
    let formPago = this.getFormPayCombo(combo);
    if (!formPago.payUSD || !formPago.payMXN){
      this.service.openDialog(`No hay montos definidos en los productos, favor de verificar`);
      return;
    }
    if (shoppingCarID && shoppingCarID != undefined && shoppingCarID != null){
      this.loader.open();
      this.service.payOrder(shoppingCarID, '', formPago).subscribe(
        (data:any) => {
          this.loader.close();
          let c =  this.combos.filter(c =>{
            if(c.id === shoppingCarID) return true;
            return false;
          })
          data.currentCurrency = this.dollar;
          localStorage.setItem('cartToPay', JSON.stringify(c[0].orders));
          localStorage.setItem('infoOrderUser', JSON.stringify(data));
          this.router.navigate(['/shop/orders/pay']);
        },
        (http: HttpErrorResponse) => {
          this.loader.close();
          this.service.processHttpResponse(http);
        }
      );
    }
  }

  validateDiscount(){
    if(!this.discountCodeKey) return;
    this.loader.open("Validando código de descuento: "+this.discountCodeKey);
    this.service.getDiscountCodes(this.discountCodeKey,this.userInfo.idUser).subscribe(
      (data:any)=>{
        this.loader.close();
        if(data.active){
          this.discount = data;
          let maxDiscountInProduct = this.getMaxDiscountInOrder();
          if(!this.aplicateDiscount){
            this.discount = null;
            this.calculateTotalCart();
            this.service.openDialog("No hay productos válidos para aplicar descuento.");
            return;
          } 
          
          if(Number(this.discount.discount) > maxDiscountInProduct){
            this.calculateTotalCart();
            this.service.openDialog("Descuento aplicado.");
          }else{
            this.discount = null;
            this.discountCodeKey = '';
            this.aplicateDiscount = false;
            this.calculateTotalCart();
            this.service.openDialog(`El código de descuento es válido, pero los descuentos no son acumulables. ¡Utilízalo para otra compra!`);
          }
        }else{
          this.deleteDiscount();
          this.service.openDialog("Código no valido");
        }
      },
      (error)=>{
        this.loader.close();
        this.deleteDiscount();
        this.service.openDialog((error.error ? error.error : "Código no valido"));
      },
      ()=>{},
    )
  }

  deleteDiscount(){
    this.cart = JSON.parse(JSON.stringify(this.ordersBackup));
    this.aplicateDiscount = false;
    this.discount = null;
    this.discountCodeKey = '';
    this.calculateTotalCart();
  }

  getMaxDiscountInOrder(){
    var max_discount = 0;
    this.aplicateDiscount = false;
    try {
      for (let index = 0; index < this.ordersBackup.length; index++) {
        const order = this.ordersBackup[index];
        for (let rbp = 0; rbp < order?.skuSapNavigation?.relBannersProducts?.length; rbp++) {
          let banner = order?.skuSapNavigation?.relBannersProducts[rbp]?.banner || {};
          if(banner.active && !banner?.discountCodeId && Number(banner?.discountReference)){
            max_discount = Number(banner?.discountReference);
          }
          if(banner?.discountCodeId && this.discount?.id == banner?.discountCodeId && this.discount && Number(this.discount.discount)>0){
            this.aplicateDiscount = true;
          } 
        }
      } 
    } catch (error) {
      console.log(error.message);
      this.discountCodeKey  = "";
      this.aplicateDiscount = false;
    }
    return max_discount;
  }

}
