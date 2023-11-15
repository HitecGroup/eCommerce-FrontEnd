import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { egretAnimations } from 'app/shared/animations/egret-animations';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ServiceService } from 'app/shared/services/service.service';
import { ICategory, ICategoryFilters } from '../../shop.service';

@Component({
  selector: 'app-discount',
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.scss'],
  animations: [egretAnimations]
})
export class DiscountComponent implements OnInit {

  constructor(
    private activatedRoute:ActivatedRoute,
    private loader: AppLoaderService,
    private service: ServiceService,
  ) { }

  rowsNumber:number = 0;
  itemsPerPage:number = 9;
  currentPage: number;
  dollar:number = 0;
  ngOnInit(): void {
    let data:any = {
      productSubcategoryId: "",
      priceRange2: "",
      priceRange1: "",
      trademarkId: "",
      trademark: "",
      orderPrice: true,
      productCategoryId: "",
      productCategoryName: "",
      search: "",
      recordsPage: 0,
      page: 0,
      badgeContent: 0,
    }
    this.searchProductsByTypeUrl(data);
  }

  products:any[] = [];
  public searchProductsByTypeUrl(data:any){
    this.activatedRoute.paramMap.subscribe(params => {
      let bannerUrl = params.get('bannerUrl');
      if (bannerUrl) {
        this.buscarProductosBanner({recordsPage: 9, orderPrice: true, search:bannerUrl});
      } 
      // else {
      //   this.buscarProductos(data);
      // }
    });
  }

  public buscarProductosBanner(bannerUrl:any) {
    this.loader.open("Espere por favor ...");
    this.service.searchBannerProducts(bannerUrl).subscribe(
      (data:any) => {
        this.loader.close();
        // this.getUserInfo();
        if(data){
          this.products = data.products;
          this.rowsNumber = data.recordsTotal;
        }else{
          this.products = [];
          this.rowsNumber = 0;
        }
        this.getCategories(this.categoryFilters);
      },
      (http: HttpErrorResponse) => {
        this.loader.close();
        this.service.processHttpResponse(http);
      }
    );
  }

  public buscarProductos(dataparams:any) {
    this.loader.open("Espere por favor ...");
    dataparams.orderPrice = null;
    this.service.searchProducts(dataparams).subscribe(
      (data:any) => {
        this.loader.close();
        // this.getUserInfo();
        if(data && data.products.length>0){
          this.products = data.products;
          this.rowsNumber = data.recordsTotal;
          window.scroll(0,0);
        }else{
          this.products = [];
          this.rowsNumber = 0;
          //this.productosService.openDialog('','No se encontraron coincidencias');
          this.service.openDialog('No se encontraron resultados. Intenta con otra búsqueda o modifica tus filtros');
        }
      },
      (http: HttpErrorResponse) => {
        this.loader.close();
        this.service.processHttpResponse(http);
      }
    );
  }

  // Categories component funcitons
  public changePage(pagina:any){
    this.currentPage = Number(pagina);
    // this.filterProducts();
  }

  redirect:string = '/shop';
  categoryFilters:ICategoryFilters = {category:undefined};
  getCategories(cf:ICategoryFilters) {
    try {
      let data:IRequestPCFilters = this.getFilters(this.categoryFilters);
      this.getProductCategoriesFilters(data);
    } catch (error) {
      console.log(error);
      this.service.openDialog(`Ocurrió un error al obtener las categorías. ${error.message}. Intente nuevamente o contacte con el área de soporte`).subscribe(
        () => {this.service.goTo(this.redirect);}
      );
    }
  }

  isCategoryOrTrademark:string="category";
  filterType:number = 1;
  getFilters(cf:ICategoryFilters):IRequestPCFilters {
    let data:IRequestPCFilters = this.initIParamsPCFilters();
    data.Page = 0;
    data.RecordsPage = 501;

    switch(this.isCategoryOrTrademark){
      case "category":
        data.Type = 0;
      break;
      case "trademark":
        data.Type = 1;
      break;
      default:
        this.service.openDialog(`Tipo de categoría desconocida`);
        break;
    }

    if (
      cf?.categoryId > 0 &&
      cf?.trademarkId > 0 &&
      cf?.subcategoryId1 > 0 &&
      cf?.subcategoryId2 > 0
    ) {
      // console.log('Obtener: Último nivel');
      data.TrademarkId  = this.categoryFilters.trademarkId;
      data.Category     = this.categoryFilters.categoryId;
      data.Subcategory1 = this.categoryFilters.subcategoryId1;
      data.Subcategory2 = this.categoryFilters.subcategoryId2;
      return data;
    }
    
    if (
      cf?.categoryId > 0 &&
      cf?.trademarkId > 0 &&
      cf?.subcategoryId1 > 0
    ) {
      // console.log('Obtener: Subcategoria nivel 2');
      data.Category     = this.categoryFilters.categoryId;
      data.TrademarkId  = this.categoryFilters.trademarkId;
      data.Subcategory1 = this.categoryFilters.subcategoryId1;
      return data;
    }

    if (
      cf?.categoryId > 0 &&
      cf?.trademarkId > 0
    ) {
      // console.log('Obtener: Subcategoria nivel 1');
      data.Category    = this.categoryFilters.categoryId;
      data.TrademarkId = this.categoryFilters.trademarkId;
      return data;
    }

    switch(this.isCategoryOrTrademark){
      case "category":
        if (
          cf?.categoryId > 0 
        ) {
          // console.log('Obtener: Marcas');
          data.Category = this.categoryFilters.categoryId;
          return data;
        }
      break;
      case "trademark":
        if (
          cf?.trademarkId > 0 
        ) {
          // console.log('Obtener: Categorías');
          data.TrademarkId = this.categoryFilters.trademarkId;
          return data;
        }
      break;
      default:
        this.service.openDialog(`Tipo de categoría desconocida`);
        break;
    }

    switch(this.isCategoryOrTrademark){
      case "category":
        if (
          this.filterType == 1
        ) {
          // console.log('Obtener categorías');
          return data;
        }
      break;
      case "trademark":
        if (
          this.filterType == 1
        ) {
          // console.log('Obtener Marcas');
          return data;
        }
      break;
      default:
        this.service.openDialog(`Tipo de categoría desconocida`);
        break;
    }
    
  }

  initIParamsPCFilters():IRequestPCFilters{
    return {
      Type: null,
      Category: null,
      Subcategory1: null,
      Subcategory2: null,
      TrademarkId: null,
      RecordsPage: null,
      Page: null,
      Search: null
    };
  }


  resultMenu:any[] = [];
  menuSelected:any[] = [];
  menuProperties:any = [];
  getProductCategoriesFilters(data:IRequestPCFilters){
    this.loader.open();
    // console.log("Request",data);
    this.service.getProductCategoriesFilters(data).subscribe(
      (response) => {
        // console.log(response);
        this.loader.close();
        try {
          let responseBody:IResponsePCFilters = response.body;
          if(!responseBody.success){
            this.service.openDialog(`${responseBody.message}`);
            return;
          }
          this.resultMenu = responseBody.menuCategories;
        } catch (error) {
          console.log(error);
          this.service.openDialog(`Ocurrió un error al obtener las categorías, intente nuevamente o contacte con el área de soporte`).subscribe(
            () => {}
          );
        }
      },
      (http: HttpErrorResponse) =>{
        this.loader.close();
        this.service.processHttpResponse(http);
      },()=>{
        this.getCurrentCurrencySAPSimple();
      }
    );
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

  getPropertiesByRecords(details:Array<any>,records:number=7){
    let itemsNotShow:Array<number> = [84, 118, 35, 30, 124];
    return details ? details.filter((p)=> !itemsNotShow.some(i=>i == p.propertyId)).slice(0,records) : '';
  }

  getProperty(properties:Array<any>,search:number){
    if(properties){
      let found = properties.find(p=>p.propertyId==search);
      if(found?.property){
        return found.value;
      }
      return ''
    }    
    return '';
  }
}
export interface IRequestPCFilters{
  Type: number;
  Category: number;
  Subcategory1: number | null;
  Subcategory2: number | null;
  TrademarkId: number | null;
  RecordsPage: number | null;
  Page: number | null;
  Search: string | null;
  propertyFilters?: any[];
};
export interface IResponsePCFilters{
  success: boolean;
  message: string;
  isProduct: boolean;
  resultProduct: any[];
  resultCategories: IResultCategory[];
  menuSelected: any[];
  menuCategories: any[];
  menuProperties: any[];
  totalRows: number;
};
export interface IResultCategory{
  id: number,
  imageUrl: string,
  title: string;
  description: string;
  relatedWords?:string;
  isCategory?:number;
  sub1?:number;
  sub2?:number;
};