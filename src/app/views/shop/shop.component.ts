import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ServiceService } from 'app/shared/services/service.service';
import { ShopCategories } from './shop-categories';
import { ICategory, IProduct, ITrademark, ParamsToSearch, ShopService, ICategoryFilters } from './shop.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { egretAnimations } from "../../shared/animations/egret-animations";
import { StorageService } from 'app/shared/services/storage.service';
import { LayoutService } from 'app/shared/services/layout.service';
import { Router } from '@angular/router';  

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss'],
  animations: egretAnimations
})
export class ShopComponent implements OnInit {

  public _ParamsToSearch = new BehaviorSubject<any>({});
  trademarks:ITrademark[] = [];
  catalogue:any[] = [];
  categories:ICategory[] = [];
  bestSellers:IProduct[] = [];  
  layoutConf:any;
  public dollar: number = 0;
  constructor(
    public service:ServiceService,
    private storage: StorageService,
    private loader:AppLoaderService,
    private shopCategories:ShopCategories,
    private shopService:ShopService,
    private snackBar: MatSnackBar,
    private layout:LayoutService,
    private router:Router,
    
  ) { }

  ngOnInit(): void {
    this.layoutConf = this.layout.layoutConf;
    this.dollar = this.shopService.dollar;
    this.getCurrentCurrencySAPSimple();
    this.getFeaturedProducts();
    this.getShop();
  }

  async getCurrentCurrencySAPSimple(){
    this.service.getCurrentCurrencySAPSimple().subscribe(
    (data:any)=>{
      this.dollar = data.body.decimal1 ? data.body.decimal1:this.dollar;
    },
    (error:HttpErrorResponse)=>{
      this.service.processHttpResponse(error);
    });
  }

  getShop(){
    this.getHeaderBanners();
  }
  setCategoriesNull(){
    try {
      this.shopCategories.setCategoryNull();
      this.service.goTo('/shop/categories');
    } catch (error) {
      console.log(error);
      this.service.openDialog(`Ocurrió un error al redirigir a categorías: ${error.message}. Intente nuevamente o contacte con el área de soporte`).subscribe(
        () => {window.location.reload();}
      )
    }
  }

  // HEADER BANNERS
  banners:any[] = [];
  getHeaderBanners(){
    this.loader.open();
    this.service.getHeaderBanners().subscribe(
      (response:any)=>{
        this.loader.close();
        this.banners = response.body;
        let i = 0;
        this.banners.forEach(b => {
          if(i === 0){
            b.state = "1";
          } else {
            b.state = "0"
          }
          i++;
        });
      },
      (http: HttpErrorResponse)=>{
        this.loader.close();
        this.service.processHttpResponse(http);
      },
      ()=>{
        this.getHomeCategories();
      }
    );
  }

  nextBanner(){
    for(let i = 0; i < this.banners.length; i++){
      if(this.banners[i].state=="1"){
        this.banners[i].state = "0";
        if((i+1) == this.banners.length){
          this.banners[0].state = "1";
        } else {
          this.banners[i+1].state = "1";
        }
        return;
      }
    }
  }

  previousBanner(){
    for(let i = (this.banners.length - 1); i >= 0; i--){
      if(this.banners[i].state=="1"){
        this.banners[i].state = "0";
        if((i-1) < 0){
          this.banners[(this.banners.length - 1)].state = "1";
        } else {
          this.banners[i-1].state = "1";
        }
        return;
      }
    }
  }

  goTo(banner:any){
    // let ob:any = {};
    // this.paramsSearch.setParamsToSearch(ob);
    if(banner.bannerTypeId==1){
      this.router.navigate(['/shop/products/discount',banner.bannerUrl]);
      // this.router.navigate(['/shop/categories']);
    }else if(banner.bannerTypeId==2){
      localStorage.setItem('banner',JSON.stringify(banner));
      this.router.navigate(['/shop/products/combo',banner.bannerUrl]);
    }
  }
  

  // HOME CATEGORIES
  getHomeCategories() {
    this.loader.open();
    this.service.getHomeCategories().subscribe(
      (response) => {
        this.loader.close();
        try {
          if(!response.body.success){
            this.service.openDialog(`${response.body.success}`);
          }
          this.trademarks = response.body.allTradeMark;
          this.categories = response.body.allCategories;
          this.catalogue = response.body.allTrademarkCatalogs;
          // console.log(this.catalogue); jbs
          this.categories.forEach(
            (c) => {if (!c.imageUrl) c.imageUrl = 'assets/images/categories/example.png';}
            );
          this.trademarks = this.service.sortByName(this.trademarks,'trademark');
        } catch (error) {
          console.log(error);
          this.service.openDialog(`Ocurrió un error al obtener las categorías, intente nuevamente o contacte con el área de soporte1`).subscribe(
            () => {}
          );
        }
      },
      (http: HttpErrorResponse) =>{
        this.loader.close();
        this.service.processHttpResponse(http);
      },
      () => {
        this.getBestSellers();
      }
    );
  }

  // TRADEMARKS
  // getTrademarks() {
  //   for (let index = 0; index < 30; index++) {
  //     this.trademarks.push({
  //       id:index,trademark:`Trademark ${index}`,imageUrl:'assets/images/trademarks/sandvik.png'
  //     });
  //   }
  // }
  
  // TRADEMARK SLIDER FUNCTIONS
  scroll(el: HTMLElement) {
    el.scrollIntoView({behavior: 'smooth'});
  }

  scrollLeft(el: HTMLElement){
    el.scrollLeft -= 200;
  }

  scrollRight(el: HTMLElement){
    el.scrollLeft += 200;
  }

  totalRows:number = 0;
  pageSize:number = 6;
  page:number = 0;
  public changePage(page:any){
    this.page = Number(page);
    this.getBestSellers();
  }
  //
  async getBestSellers() {
    let data = {
      page: this.page,
      pageSize: this.pageSize
    };
    this.service.getBestSellers(data).subscribe(
      (response:any) => {
        this.totalRows = response.data.totalRows;
        let products:any[] = JSON.parse(response.data.products || "[]");
        this.bestSellers = products;
      },
      (http: HttpErrorResponse) => {
        this.service.processHttpResponse(http);
      },
      () => {
        this.getPromotion();
      }
    );
  }

  getPropertiesByRecords(details:Array<any>,records:number=7){
    if (details) {
      return details.filter((p)=>p.property.trim() != 'materia id' && p.property.trim() != 'id material' && p.property.trim() != 'codigo iso').slice(0,records)
    }
    return [];
  }

  showProperty(property:any){
    if(property.property.trim()!='materia id' && property.property.trim()!='id material' && property.property.trim()!='codigo iso'){
      return true;
    }
    return false;
  }

  // FEATURED PRODUCTS
  featuredProducts:any[] = [];
  getFeaturedProducts(){
    this.featuredProducts = [
      {id:2,trademark:'SECO',imageUrl:"assets/images/products/featured_left.png",brandUrl:"assets/images/products/featured_left_brand.png",label:"Herramientas de fresado"},
      {id:4,trademark:'DORMER',imageUrl:"assets/images/products/featured_center.png",brandUrl:"assets/images/products/featured_center_brand.png",label:"Herramientas de roscado"},
      {id:3,trademark:'SANDVIK',imageUrl:"assets/images/products/featured_right.png",brandUrl:"assets/images/products/featured_right_brand.png",label:"Herramientas de barrenado"},
    ];
  }

  // PROMOTION
  promo:string;
  getPromotion(){
    this.promo = "assets/images/products/promo.jpg";
  }

  // CART SERVICES
  cart:IProduct[];
  public quantity: number = 1;
  userInfo:any;
  async addToCart(cartItem:IProduct) {
    this.userInfo = await this.storage.getUserInfo();
    if(!this.userInfo){
      this.service.openDialog(`Inicia sesión para agregar este producto a tu carrito`);
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


  goToCategories(categoryId:number) {
    try {
      this.service.goTo('/shop/categories');
      this.shopCategories.setCategories(this.categories);
    } catch (error) {
      console.log(error);
      this.service.openDialog(`Ocurrió un error al redirigir a categorías: ${error.message}. Intente nuevamente o contacte con el área de soporte`).subscribe(
        () => {window.location.reload();}
      )
    }
  }

  goToTrademarks(trademarkId:number) {
    try {
      //[routerLink]="['/shop/categories',1]"
      this.service.goTo('/shop/trademarks');
      this.shopCategories.setTrademarks(this.categories);
    } catch (error) {
      console.log(error);
      this.service.openDialog(`Ocurrió un error al redirigir a categorías: ${error.message}. Intente nuevamente o contacte con el área de soporte`).subscribe(
        () => {window.location.reload();}
      )
    }
  }

  goToLinkCatalogue(url: string){
    if (url) {
      window.open(url, "_blank");
    } else {
      this.service.openDialog(`No hay catálogo disponible por el momento, intente con otro por favor o verifique con el área de soporte.`);
    }
  }
  
  //Modificación igasca Oct 12, 2023  Se agrega funcionalidad
  filteredList:any[] = [];
  async searchByProduct(){
    if(!this.filteredList.length){
    let data:any = {
        Type:1,
        TrademarkId:null,
        Category:null,
        Subcategory1: null,
        Subcategory2: null,
        RecordsPage: null,
        Page:null,
        Search: 'HT_TMX_3-220-0068',
    }
    this.router.navigate(['/shop/categories'],{queryParams: data});
    }
  }

  //Modificación igasca Oct 30, 2023 Se agrega funcionalidad
  getCategoryElements(category:any){
    try {
      this.router.navigate(['/shop/categories']);
      this.shopCategories.setCategory(category,"category");
    } catch (error) {
      console.log(error);
    }
  }

  getTrademarkElements(category:any){
    try {
      this.router.navigate(['/shop/categories']);
      this.shopCategories.setCategory(category,"trademark"); 
    } catch (error) {
      console.log(error);
    }

  }

}

