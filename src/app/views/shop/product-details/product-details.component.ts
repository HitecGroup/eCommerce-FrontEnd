import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { egretAnimations } from "../../../shared/animations/egret-animations";
import { ShopService, CartItem, IProduct } from '../shop.service';
import { ServiceService } from 'app/shared/services/service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { LayoutService } from 'app/shared/services/layout.service';
import { Subscription } from 'rxjs';
import { StorageService } from 'app/shared/services/storage.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
  animations: egretAnimations
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  public productID;
  public product: any;
  public quantity: number = 1;
  public cart: IProduct[];
  public cartData: any;
  public dollar: number = 0;
  private productSub: Subscription;
  public tiempoEntrega: string;
  public stock: any;
  public productOnDemand:boolean = false;
  userInfo:any;
  layoutConf:any;

  public photoGallery: any[] = [{url: '', state: '0'}];
  constructor(
    private shopService: ShopService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private service:ServiceService,
    private loader:AppLoaderService,
    private storage: StorageService,
    private router: Router,
    private layout:LayoutService
  ) { }

  async ngOnInit() {
    this.layoutConf = this.layout.layoutConf;
    this.dollar = this.shopService.dollar;
    this.productID = this.route.snapshot.params['id'];
    this.getProduct(this.productID);
    this.getCart();
    this.cartData = this.shopService.cartData;
  }

  bestSellers:IProduct[] = [];
  async getProductDetails() {
    //this.loader.open("Productos");
    let data = {
      orderPrice: null,
      page: 0,
      productCategoryId: null,
      productCategoryName: "",
      recordsPage: 8,
      search: "",
      trademark: "",
      trademarkId: null
    }
    this.service.getProductDetails(data).subscribe(
      (response:any) => {
        //this.loader.close();
        let index = 0;
        this.bestSellers = response.products;
        this.bestSellers.forEach(e => {
            e.id=index;
            e.iso=`${e.skuSap}`;
            e.previous=10.00;
            e.gallery=['assets/images/products/example.png','assets/images/products/example2.png','assets/images/products/example3.png'];
            e.category="Categoría 1";
          index++;
        }); 
      },
      (http: HttpErrorResponse) => {
        this.loader.close();
        console.log(http);
      },
      () => {
        this.loader.close();
      }
    );

  }

  ngOnDestroy() {
    this.productSub.unsubscribe();
  }

  async getProduct(skuSap) {
    this.loader.open();
    let data = {orderPrice: null,
      page: 0,
      productCategoryId: null,
      productCategoryName: "",
      recordsPage: 8,
      search: "",
      trademark: "",
      trademarkId: null,
      skuSap:skuSap};

    this.productSub = this.service.getProductDetails(data)
    .subscribe(
      (res) => {
        this.loader.close();
        let index = 0;
        let response:any = res;
        if(response.products.length == 0){
          this.service.openDialog("El producto actual no cuenta con stock disponible").subscribe(
            () =>{ 
              this.service.goTo("/shop");
            }
          );
        } else {
          this.product = response.products[0];
          this.tiemposEntregaStock(this.product);
          this.product.id = 0;
          this.quantity = this.product.multiplier;
          this.product.data={
            quantity:1
          };
          this.product.ratings= {
            'rating': 4.86,
            'ratingCount': 26
          };
          this.product.category="Categoría 1";
          this.product.tags=["Tag 1","Tag 2"];
          let productsImages = [];
          try{
            productsImages = JSON.parse(this.product.productImages);
          }catch(e){
            productsImages = [];
          }
          let imagesUrl = productsImages.map((pi)=>pi.imageUrl);
          this.product.gallery=[this.product.imageUrl,...imagesUrl];
          this.initGallery(this.product);
        }
      }, 
      (err:HttpErrorResponse) => {
        this.loader.close();
        console.log(err);
        this.product = null;
        this.service.processHttpResponse(err);
      },
      ()=>{      
        this.loader.close();
        this.getCurrentCurrencySAPSimple();
        this.getProductDetails();
      }
    );
  }

  getCart() {
    this.shopService
    .getCart()
    .subscribe(cart => {
      this.cart = cart;
    })
  }

  async addToCart(cartItem:IProduct) {
    this.userInfo = await this.storage.getUserInfo();
    if(!this.userInfo){
      this.service.openDialog(`Inicia sesión para agregar este producto a tu carrito`);
      return;
    }
    if(this.userInfo.accountAddresses.length == 0){
      this.service.openDialog('Debe ingresar al menos una dirección para agregar productos a su carrito de compra.');
      this.service.goTo('/sessions/profile');
      return; 
    }
    this.loader.open('Agregando producto ...');
    this.service.getSimpleByNotEmpy(this.userInfo).subscribe(
      (data: any) => {
        this.loader.close();
        let shoppingCartID = data.body.id;
        this.addProductToCart(shoppingCartID,cartItem);
      },
      (http: HttpErrorResponse) => {
        this.loader.close();
        this.service.processHttpResponse(http);
        // this.service.openDialog('No se pudo agregar el producto');
      }
    );
  }

  addProductToCart(shoppingCartID: number,cartItem:IProduct) {    
    // Servicio de carrito

    if(this.quantity == 0){
      this.service.openDialog(`Añade una cantidad para agregar el producto al carrito`);
      return;
    }

    let data = {
      shoppingCarId: shoppingCartID,
      skuSap: cartItem.skuSap,
      quantity: this.quantity,
      statusId: 1
    };
    this.loader.open('Agregando producto ...');
    this.service.addToCart(data,this.userInfo).subscribe(
      (data: any) => {
        this.loader.close();
        this.service.openDialog(`Producto agregado al carrito, SKU: ${cartItem.skuSap}`);
        this.quantity = 1;
        this.shopService.getBadgeCount();
      },
      (http: HttpErrorResponse) => {
        this.loader.close();
        //this.service.processHttpResponse(http);
        this.service.openDialog('Este producto ya está agregado al carrito');
      }
    );
    //this.getBadgeCount();
  }

  initGallery(product: any) {
    
    if(!product.gallery) {
      return;
    }
    this.photoGallery = product.gallery.map(i => {
      return {
        url: i,
        state: '0'
      }
    });
    if (this.photoGallery[0])  {
      this.photoGallery[0].state = '1';
    }
  }

  async getCurrentCurrencySAPSimple(){
    this.loader.open();
    this.service.getCurrentCurrencySAPSimple().subscribe(
    (data:any)=>{
      this.dollar = data.body.decimal1 ? data.body.decimal1:this.dollar;
      this.loader.close();
    },
    (error:HttpErrorResponse)=>{
      this.loader.close();
      this.service.processHttpResponse(error);
    });
  }
  
  changeState(photo) {
    if (photo.state === '1') {
      return;
    }
    this.photoGallery = this.photoGallery.map(p => {
      if (photo.url === p.url) {
        setTimeout(() => {
          p.state = '1';
          return p;
        }, 290)
      }
      p.state = '0';
      return p;
    })
  }

  tiemposEntregaStock(data: any) {
    this.tiempoEntrega = "3 a 5 días";
    this.stock = data.stock;
    switch (Number(data.trademarkId)) {
      // ======== REGLA DE NEGOCIO HITEC ======== //
      case 1:
        //Su hay stock en SAP
        if (data.stock > 0) {
          // this.tiempoEntrega = "3 a 5 días";
          this.stock = data.stock;
        }
        //
        else {
          this.tiempoEntrega = "No disponible por el momento";
        }
        break;
      // ======== REGLA DE NEGOCIO SECO ======== //
      case 2:
        //Si hay stock en US
        if (data.stockUs > 0) {
          this.tiempoEntrega = "4 a 6 días";
          this.stock = data.stockUs;
        }
        //Si no hay stock en US, pero en EU
        else if (data.stockEr > 0) {
          this.tiempoEntrega = "7 a 9 días";
          this.stock = data.stockEr;
        }
        //Si no hay stock en ninguno
        else {
          this.tiempoEntrega = "No disponible por el momento";
        }
        break;
      // ======== REGLA DE NEGOCIO SANDVIK ======== //
      case 3:
        //Si hay stock en US
        if (data.stockUs > 0) {
          // this.tiempoEntrega = "3 a 5 días";
          this.stock = data.stockUs;
        }
        //Si no hay stock en US, pero hay stock en EU
        else if (data.stockEr > 0) {
          this.tiempoEntrega = "8 a 10 días";
          this.stock = data.stockEr;
        }
        //Si no hay en US, ni EU, pero hay stock en AS
        else if (data.stockAs > 0) {
          this.tiempoEntrega = "12 a 18 días";
        }
        //Si no hay stock en ninguno
        else {
          this.tiempoEntrega = "No disponible por el momento";
        }
        break;
      // ======== REGLA DE NEGOCIO DORMER ======== //
      case 4:
        //Si hay stock en US
        if (data.stockUs > 0) {
          this.tiempoEntrega = "5 a 7 días";
          this.stock = data.stockUs;
        }
        //Si no hay stock en US, pero hay stock en EU
        else if (data.stockEr > 0) {
          this.tiempoEntrega = "9 a 12 días";
          this.stock = data.stockEr;
        }
        //Si no hay stock en ninguno
        else {
          this.tiempoEntrega = "No disponible por el momento";
        }
        if (data.eCodeDormer) this.getStockProductDormer(data.eCodeDormer);
        break;
      // ======== REGLA DE NEGOCIO UNIVERSAL ROBOTS ======== //
      case 6:
        //Si hay stock en PIM
        this.productOnDemand = true;
        if (data.stock > 0) {
          this.tiempoEntrega = "8 a 10 días";
          this.stock = data.stock;
        }
        else {
          this.tiempoEntrega = "No disponible por el momento";
        }
        break;
      // ======== REGLA DE NEGOCIO 5th AXIS ======== //
      case 12:
        this.productOnDemand = true;
        //Si hay stock en PIM
        if (data.stock > 0) {
          this.tiempoEntrega = "10 a 12 días";
          this.stock = data.stock;
        }
        else {
          this.tiempoEntrega = "No disponible por el momento";
        }
        break;
      // ======== REGLA DE NEGOCIO MIDACO  ======== //
      case 14:
        this.productOnDemand = true;
        break;
      // ======== REGLA DE NEGOCIO AIRTURBINE ======== //
      case 15:
          this.productOnDemand = true;
        break;
      // ======== DEFAULT ======== //
      default:
        this.tiempoEntrega = "3 a 5 días";
        break;
    }
  }

  getStockProductDormer(eCodeDormer: string) {
    this.service.getProductStockDormer(eCodeDormer).subscribe(
      (data: any) => {
        if (data.error == 0) {
          this.stockDormer(data);
          this.updateStockDormer(eCodeDormer, data);
        }
      },
      (error:HttpErrorResponse) => { 
        this.service.processHttpResponse(error);
      }
    )
  }

  stockDormer(data: any) {
    //Si hay stock en US
    if (data.stockUSA > 0) {
      this.tiempoEntrega = "5 a 7 días";
      this.stock = data.stockUs;
    }
    //Si no hay stock en US, pero hay stock en EU
    else if (data.stockEUR > 0) {
      this.tiempoEntrega = "9 a 12 días";
      this.stock = data.stockEr;
    }
    //Si no hay stock en ninguno
    else {
      this.tiempoEntrega = "No disponible por el momento";
    }
  }

  updateStockDormer(eCodeDormer: string, data: any) {
    this.service.putProductStockDormer({ eCodeDormer: eCodeDormer, stockUs: data.stockUSA, stockEur: data.stockEUR }).subscribe(
      (data: any) => { },
      (error) => { }
    )
  }

  changeQuantity(plus){
    this.quantity = Number(this.quantity);
    if(this.productOnDemand){
      this.quantity = plus ? 
                      this.quantity + this.product.multiplier : 
                      this.quantity == 0 ? 0 : this.quantity - this.product.multiplier;
    }else{
      this.quantity = plus ?
      this.quantity == this.product.stock ? this.stock : this.quantity + this.product.multiplier : 
                       this.quantity == 0 ? 0 : this.quantity - this.product.multiplier;
    }    
  }

  redirectTo(uri,skusap){
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>
    this.router.navigate([uri,skusap]));
 }
}
