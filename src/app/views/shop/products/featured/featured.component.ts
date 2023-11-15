import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { egretAnimations } from 'app/shared/animations/egret-animations';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ServiceService } from 'app/shared/services/service.service';
import { ICategoryFilters } from '../../shop.service';

@Component({
  selector: 'app-discount',
  templateUrl: './featured.component.html',
  styleUrls: ['./featured.component.scss'],
  animations: [egretAnimations]
})
export class FeaturedComponent implements OnInit {

  constructor(
    private activatedRoute:ActivatedRoute,
    private loader: AppLoaderService,
    public service: ServiceService,
  ) { }

  rowsNumber:number = 0;
  itemsPerPage:number = 9;
  currentPage: number;
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
    this.activatedRoute.paramMap.subscribe(params => {
      try {
        let trademarkId:number = Number(params.get('trademarkId'));
        if (trademarkId) {
          this.getFeaturedProducts(trademarkId);
        }   
      } catch (error) {
        this.service.openDialog(`Ocurrió un error al obtener los productos destacados por marca, verifique con el área de soporte`).subscribe(
          () => {this.service.goTo(this.redirect)}
        )
      }
      
    });
  }

  products:any[] = [];
  public getFeaturedProducts(trademarkId:number) {
    let data = {
      trademarkId:trademarkId
    };
    this.loader.open();
    this.service.getFeaturedProducts(data).subscribe(
      (response:any) => {
        this.loader.close();
        if (response.success){ 
          let data:any[] = response.data;
          data.forEach(
            (t) => {
              if (t?.product) {
                this.products.push(t.product);
              }
            }
          );
        }
        this.getCategories(this.categoryFilters);        
      },
      (http: HttpErrorResponse) => {
        this.loader.close();
        this.service.processHttpResponse(http);
      }
    );
    // console.log(this); jbs
  }

  // Categories component funcitons
  public changePage(pagina:any){
    this.currentPage = Number(pagina);
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
      TrademarkId: 2,
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
     console.log("Request",data);
    this.service.getProductCategoriesFilters(data).subscribe(
      (response) => {
         console.log(response);
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
          this.service.openDialog(`Ocurrió un error al obtener las categorías, intente nuevamente o contacte con el área de soporte3`).subscribe(
            () => {}
          );
        }
      },
      (http: HttpErrorResponse) =>{
        this.loader.close();
        this.service.processHttpResponse(http);
      }
    );
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