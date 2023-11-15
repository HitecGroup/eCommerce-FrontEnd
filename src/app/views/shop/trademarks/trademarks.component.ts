import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { egretAnimations } from 'app/shared/animations/egret-animations';
import { Product } from 'app/shared/models/product.model';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { Observable, Subscription } from 'rxjs';
import { ISearchParams, ShopSearchParams } from '../shop-search-params';
import { ICategory, ICategoryFilters, IProduct, ITrademark } from '../shop.service';
import { CartItem, ShopService } from '../shop.service';
import { map } from 'rxjs/operators';
import { ServiceService } from 'app/shared/services/service.service';
import { ActivatedRoute } from '@angular/router';
import { ShopCategories } from '../shop-categories';
import { ICategoryEvent, IRequestPCFilters, IResponsePCFilters, IResultCategory } from '../categories/categories.component';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-trademarks',
  templateUrl: './trademarks.component.html',
  styleUrls: ['./trademarks.component.scss'],
  animations: [egretAnimations]
})
export class TrademarksComponent implements OnInit, OnDestroy {
  public categories:any[] = [];
  public isSideNavOpen: boolean;
  public viewMode: string = 'grid-view';
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  public products$: Observable<Product[]>;
  public activeCategory:string = 'all';
  public filterForm: FormGroup;
  public cart: CartItem[];
  public cartData: any;

  constructor(
    private shopService: ShopService,
    private service: ServiceService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private loader: AppLoaderService,
    private shopSearchParams:ShopSearchParams,
    private route: ActivatedRoute,
    private shopCategories:ShopCategories
  ) { }

  redirect:string = '/shop';
  filterType:number = 1;
  searchParamsSubscription:Subscription;
  shopCategoriesSubscription:Subscription;
  updateMenu:boolean = true;
  ngOnInit(): void {
    try {
      this.buildFilterForm(this.shopService.initialFilters);
      /**/
      this.shopCategoriesSubscription = this.shopCategories.categories$.subscribe(
        (next:ICategoryEvent) => {
          if (next) {
            if(!next.category?.isCategory){
              switch (next.type) {
                case 1:
                  if (next.categories instanceof Array) {
                    this.categories = next.categories;
                  }
                  break;
                case 2:
                  const category:IResultCategory = next.category;
                  this.updateMenu = false;
                  this.filterType = 1;
                  this.categoryFilters = {
                    category:undefined,
                    subcategoryId1 : null,
                    subcategoryId2: null,
                    categoryId   : null,
                  };
                  this.setCurrentFiltersCategory(category);
                  break;
              }
            }
          }
        },
        (error) => {
          console.log(error);
          this.service.openDialog(`Ocurrió un error al obtener las marcas: ${error.message}. Intente nuevamente o contacte con el área de soporte`).subscribe(
            () => {this.service.goTo(this.redirect)}
          );
        }
      );
    } catch(error) {
      console.log(error);
      this.service.openDialog(`Ocurrió un error al inicializar marcas: ${error.message}. Intente nuevamente o contacte con el área de soporte`).subscribe(
        () => {this.service.goTo(this.redirect)}
      );
    }
    if (this.resultMenu.length <= 0 && this.updateMenu) {
      this.getCategories(this.categoryFilters);
    }
  }

  ngOnDestroy() {
    this.searchParamsSubscription?.unsubscribe();
    this.shopCategoriesSubscription?.unsubscribe();
    this.loader.close();
  }

  buildFilterForm(filterData:any = {}) {
    this.filterForm = this.fb.group({
      search: [''],
      category: ['all'],
      minPrice: [filterData.minPrice],
      maxPrice: [filterData.maxPrice],
      minRating: [filterData.minRating],
      maxRating: [filterData.maxRating]
    })
  }

  setLevel(category:any){
    let level:number = this.menuSelected.indexOf(category);
    if (level >= 0) {
      switch (level) {
        case 0:
          this.filterType = 0;
          this.categoryFilters = {
            category:undefined,
            subcategoryId1 : null,
            subcategoryId2: null,
            categoryId   : null,
          };
          break;
        case 1:
          this.filterType = 1;
          this.categoryFilters.subcategoryId1 = null;
          this.categoryFilters.subcategoryId2 = null;
          this.categoryFilters.categoryId    = null;
          break;
        case 2:
          this.filterType = 2;
          this.categoryFilters.subcategoryId1 = null;
          this.categoryFilters.subcategoryId2 = null;
          break;
        case 3:
          this.filterType = 3;
          this.categoryFilters.subcategoryId2 = null;
          break;
      }
      this.setCurrentFiltersCategory(category);
    }
  }

  currentCategory:ICategory;
  setActiveCategory(category:ICategory) {
    this.activeCategory = (category.description == "") ? category.title : category.description;
    this.filterForm.controls['category'].setValue(category.title);
    this.currentCategory = category;
    this.setCurrentFiltersCategory(category);
  }

  categoryFilters:ICategoryFilters = {category:undefined};
  setCurrentFiltersCategory(categoryTrademark:any) {
    this.categoryFilters.filterType = this.filterType;
    this.categoryFilters.category = categoryTrademark;
    this.filterType++;
    if (this.filterType == 2) {
      this.categoryFilters.trademarkId = categoryTrademark.id;
    }
    if (this.filterType == 3) {
      this.categoryFilters.categoryId = categoryTrademark.id;
    }
    if (this.filterType == 4) {
      this.categoryFilters.subcategoryId1 = categoryTrademark.id;
    }
    if (this.filterType == 5) {
      this.categoryFilters.subcategoryId2 = categoryTrademark.id;
    }
    this.getCategories(this.categoryFilters);
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

  rowsNumber:number = 0;
  itemsPerPage:number = 9;
  currentPage: number;
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

  getFilters(cf:ICategoryFilters):IRequestPCFilters {
    let data:IRequestPCFilters = this.initIParamsPCFilters();
    data.Page = 0;
    data.RecordsPage = 501;
    if (
      cf?.categoryId > 0 &&
      cf?.trademarkId > 0 &&
      cf?.subcategoryId1 > 0 &&
      cf?.subcategoryId2 > 0
    ) {
      data.Type = 1;
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
      data.Type = 1;
      data.TrademarkId  = this.categoryFilters.trademarkId;
      data.Category     = this.categoryFilters.categoryId;
      data.Subcategory1 = this.categoryFilters.subcategoryId1;
      return data;
    }

    if (
      cf?.categoryId > 0 &&
      cf?.trademarkId > 0
    ) {
      data.Type = 1;
      data.TrademarkId = this.categoryFilters.trademarkId;
      data.Category    = this.categoryFilters.categoryId;
      return data;
    }

    if (
      cf?.trademarkId > 0 
    ) {
      data.Type = 1;
      data.TrademarkId = this.categoryFilters.trademarkId;
      return data;
    }

    if (
      this.filterType == 1
    ) {
      data.Type = 1;
      return data;
    }

  }

  toggleSideNav() {
    this.sideNav.opened = !this.sideNav.opened;
  }

  public changePage(pagina:any){
    this.currentPage = Number(pagina);
  }

  /**/
  resultMenu:any[] = [];
  menuSelected:any[] = [];
  getProductCategoriesFilters(data:IRequestPCFilters){
    this.loader.open();
    this.service.getProductCategoriesFilters(data).subscribe(
      (response) => {
        this.loader.close();
        try {
          let responseBody:IResponsePCFilters = response.body;
          if(!responseBody.success){
            this.service.openDialog(`${responseBody.message}`);
            return;
          }
          this.categories = [];
          this.resultMenu = responseBody.menuCategories;
          this.rowsNumber = this.categories.length;
          this.menuSelected = responseBody.menuSelected;
          switch (this.filterType) {
            case 1:
            case 2:
            case 3: 
            case 4:
              this.categories = responseBody.resultCategories;
              break;
            case 5:
              this.categories = responseBody.resultProduct;    
              break;
          }
          if (!this.categories.length) {
            this.service.openDialog(`No hay resultados`).subscribe(
              () => {}
            );
          }
        } catch (error) {
          console.log(error);
          this.service.openDialog(`Ocurrió un error al obtener las categorías, intente nuevamente o contacte con el área de soporte4`).subscribe(
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
