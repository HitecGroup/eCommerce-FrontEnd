
import {throwError as observableThrowError,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ProductDB } from '../../shared/inmemory-db/products';
import { CountryDB } from '../../shared/inmemory-db/countries';
import { Product } from '../../shared/models/product.model';
import { FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ServiceService } from 'app/shared/services/service.service';
import { StorageService } from 'app/shared/services/storage.service';

import { of, combineLatest } from 'rxjs';
import { startWith, debounceTime, delay, map, switchMap } from 'rxjs/operators';
import { IResultCategory } from './categories/categories.component';
import { P } from '@angular/cdk/keycodes';
import { HeaderTopComponent } from 'app/shared/components/header-top/header-top.component';



export interface CartItem {
  product: Product;
  data: {
    quantity: number,
    options?: any
  };
}

@Injectable()
export class ShopService {
  public products: IProduct[] = [];
  public initialFilters = {
    minPrice: 10,
    maxPrice: 40,
    minRating: 1,
    maxRating: 5
  };

  public dollar: number = 20.4222;
  // public cart: CartItem[] = [];
  public cart: IProduct[] = [];
  public cartData = {
    itemCount: 0
  }
  constructor(
    private services: ServiceService,
    private storage: StorageService,
    ) { }
  // public getCart(): Observable<CartItem[]> {
  //   return of(this.cart)
  // }

  // public addToCart(cartItem: CartItem): Observable<CartItem[]> {
  //   let index = -1;
  //   this.cart.forEach((item, i) => {
  //     if(item.product._id === cartItem.product._id) {
  //       index = i;
  //     }
  //   })
  //   if(index !== -1) {
  //     this.cart[index].data.quantity += cartItem.data.quantity;
  //     this.updateCount();
  //     return of(this.cart)
  //   } else {
  //     this.cart.push(cartItem);
  //     this.updateCount();
  //     return of(this.cart)
  //   }
  // }

  // private updateCount() {
  //   this.cartData.itemCount = 0;
  //   this.cart.forEach(item => {
  //     this.cartData.itemCount += item.data.quantity;
  //   })
  // }

  // public removeFromCart(cartItem: CartItem): Observable<CartItem[]> {
  //   this.cart = this.cart.filter(item => {
  //     if(item.product._id == cartItem.product._id) {
  //       return false;
  //     }
  //     return true;
  //   });
  //   this.updateCount();
  //   return of(this.cart)
  // }

  // public getProducts(): Observable<Product[]> {
  //   let productDB = new ProductDB();
  //   return of(productDB.products)
  //     .pipe(
  //       delay(500),
  //       map((data: Product[]) => {
  //         this.products = data;
  //         return data;
  //       })
  //     )
  // }

  public getProductDetails(productID): Observable<IProduct> {
    // let productDB = new ProductDB();
    let products;
    this.getProductsTest(6)
    .subscribe(p => {
      products = p;
    })
    let product = products.filter(p => p.id === parseInt(productID))[0];
    if(!product) {
      return observableThrowError(new Error('Product not found!'));
    }
    return of(product)
  }


  public getCart(): Observable<IProduct[]>{
    return of(this.cart);
  }

  public emptyCart(): Observable<IProduct[]>{
    this.cart = [];    
    return of(this.cart);
  }

  public setCart(cart: IProduct[]){
    this.cart = cart;
  }

  public addToCart(cartItem: IProduct): Observable<IProduct[]> {
    let index = -1;
    this.cart.forEach((item, i) => {
      if(item.id === cartItem.id) {
        index = i;
      }
    })
    if(index !== -1) {
      this.cart[index].data.quantity += cartItem.data.quantity;
      this.updateCount();
      return of(this.cart)
    } else {
      this.cart.push(cartItem);
      this.updateCount();
      return of(this.cart)
    }
  }

  private updateCount() {
    this.cartData.itemCount = 0;
    this.cart.forEach(item => {
      this.cartData.itemCount += item.data.quantity;
    })
  }

  public removeFromCart(cartItem: IProduct): Observable<IProduct[]> {
    this.cart = this.cart.filter(item => {
      if(item.id == cartItem.id) {
        return false;
      }
      return true;
    });
    this.updateCount();
    return of(this.cart)
  }
  // public getProducts(): Observable<IProduct[]> {
  //   let productDB = new ProductDB();
  //   return of(productDB.products)
  //     .pipe(
  //       delay(500),
  //       map((data: IProduct[]) => {
  //         this.products = data;
  //         return data;
  //       })
  //     )
  // }
  // public getProductDetails(productID): Observable<Product> {
  //   let productDB = new ProductDB();
  //   let product = productDB.products.filter(p => p._id === productID)[0];
  //   if(!product) {
  //     return observableThrowError(new Error('Product not found!'));
  //   }
  //   return of(product)
  // }

  // public getFilteredProduct(filterForm: FormGroup): Observable<Product[]> {
  //   return combineLatest(
  //     this.getProducts(),
  //     filterForm.valueChanges
  //     .pipe(
  //       startWith(this.initialFilters),
  //       debounceTime(400)
  //     )
  //   )
  //   .pipe(
  //     switchMap(([products, filterData]) => {
  //       return this.filterProducts(products, filterData);
  //     })
  //   )
  // }

  public getCategories(): Observable<any> {
    let categories = ['speaker', 'headphone', 'watch', 'phone'];
    return of(categories);
  }

  public getTrademarks(): Observable<any> {
    let trademaks = ['Hi-Tech Tools', 'Sandvik', 'Dormer Planet', 'Seco', '5th Axis', 
    'Hass','Fukis', 'Siemens', 'TopSolid', 'OAK Signature', 'ROHM','Vektek'
    ,'Midaco', 'Air Turbine Tools'];
    return of(trademaks);
  }
  
  public getRealTrademarks(): Observable<any> {
    let realCategories = ['Accesorios y refacciones', 'Barrenado', 'Collets / Boquillas', 'Cortadores Verticales', 'Fresado', 
    'Machuelado','Mandrinado', 'Porta Herramienta', 'Rimado', 'Torneado', 'Sistemas de sujeccion','Soluble'
    ,'Cabezales y turbinas', 'EDM', 'Software', 'Consumibles Hass'  ];
    return of(realCategories);
  }

  

  /*
  * If your data set is too big this may raise performance issue.
  * You should implement server side filtering instead.
  */ 
  private filterProducts(products: Product[], filterData): Observable<Product[]> {
    let filteredProducts = products.filter(p => {
      let isMatch: Boolean;
      let match = {
        search: false,
        caterory: false,
        price: false,
        rating: false
      };
      // Search
      if (
        !filterData.search
        || p.name.toLowerCase().indexOf(filterData.search.toLowerCase()) > -1
        || p.description.indexOf(filterData.search) > -1
        || p.tags.indexOf(filterData.search) > -1
      ) {
        match.search = true;
      } else {
        match.search = false;
      }
      // Category filter
      if (
        filterData.category === p.category 
        || !filterData.category 
        || filterData.category === 'all'
      ) {
        match.caterory = true;
      } else {
        match.caterory = false;
      }
      // Price filter
      if (
        p.price.sale >= filterData.minPrice 
        && p.price.sale <= filterData.maxPrice
      ) {
        match.price = true;
      } else {
        match.price = false;
      }
      // Rating filter
      if(
        p.ratings.rating >= filterData.minRating 
        && p.ratings.rating <= filterData.maxRating
      ) {
        match.rating = true;
      } else {
        match.rating = false;
      }
      
      for(let m in match) {
        if(!match[m]) return false;
      }

      return true;
    })
    return of(filteredProducts)
  }

  /**/
  getTrademarksTest():ITrademark[] {
    let trademarks:ITrademark[] = [];
    for (let index = 0; index < 11; index++) {
      trademarks.push({
        id:index + 1,trademark:`Trademark ${index}`,imageUrl: this.getLogoTrademark((index + 1)),
        description:`Trademark ${index}`
      });
    }
    return trademarks;
  }

  getSubcategoriesTest():ICategory[] {
    let subcategories:ICategory[] = [];
    for (let index = 0; index < 11; index++) {
      subcategories.push({
        id:index + 1,category:`Subcategoría ${index + 1}`,imageUrl: 'assets/images/categories/example.png',
        description:`Subcategoría ${index}`
      });
    }
    return subcategories;
  }

  getProductsTest(n:number = 5):Observable<IProduct[]> {
    let products:IProduct[] = [];
    for (let index = 1; index <= n; index++) {
      products.push({
        id:index,skuSap:`Productos ${index}`,iso:'ISO - R840003070A0BH10F',imageUrl:'assets/images/products/example.png',trademark:"Sandvik",
        price:7.00,previous:10.00,discount:15,currency:'USD',
        salePriceDiscount:100,
        relProductProperties:[
          {id:1,property:`Property ${1}`,value:`Value ${1}`},
          {id:2,property:`Property ${2}`,value:`Value ${2}`},
          {id:3,property:`Property ${3}`,value:`Value ${3}`},
          {id:4,property:`Property ${4}`,value:`Value ${4}`},
          {id:5,property:`Property ${5}`,value:`Value ${5}`},
          {id:6,property:`Property ${6}`,value:`Value ${6}`},
        ],
        data:{
          quantity:1
        },
        ratings: {
          'rating': 4.86,
          'ratingCount': 26
        },
        gallery:['assets/images/products/example.png','assets/images/products/example2.png','assets/images/products/example3.png'],
        description:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo, ducimus voluptatibus totam blanditiis fugiat quasi eaque quo, atque rem sapiente quod. Quidem, explicabo beatae est sunt quae voluptatum nesciunt praesentium!",
        category:"Categoría 1",
        tags:["Tag 1","Tag 2"],
        stock:30
      });
    }
    return of(products);
  }

  getLogoTrademark(trademarkId):string{
    let urlImgTrademark = "";
    switch (trademarkId) {
      case 1:
        urlImgTrademark = "assets/images/trademarks/hitec.png";
        break;
      case 2:
        urlImgTrademark = "assets/images/trademarks/3-SANDVIK.jpg";
        break;
      case 3:
        urlImgTrademark = "assets/images/trademarks/4-DORMER.jpg";
        break;
      case 4:
        urlImgTrademark = "assets/images/trademarks/2-SECO.jpg";
        break;
      case 5:
        urlImgTrademark = "assets/images/trademarks/12-5thAxis.jpg";
        break;
      case 6:
        urlImgTrademark = "assets/images/trademarks/5-NX SIEMENS.jpg";
        break;
      case 7:
        urlImgTrademark = "assets/images/trademarks/7-TOP SOLID.jpg";
        break;
      case 8:
        urlImgTrademark = "assets/images/trademarks/10-OAK SIGNATURE.jpg";
        break;
      case 9:
        urlImgTrademark = "assets/images/trademarks/9-ROHM.jpg";
        break;
      case 10:
        urlImgTrademark = "assets/images/trademarks/14-MIDACO.jpg";
        break;
      case 11:
        urlImgTrademark = "assets/images/trademarks/15-AIRTURBINE.jpg";
        break;   
      default:
        break;
    }
    return urlImgTrademark;
  }

  getBadgeCount() {
    return this.services.getBadgeCount().toPromise().then(
      (data: any) => {
        HeaderTopComponent.itemCount = data.body;
      },
      (http: HttpErrorResponse) => {
        HeaderTopComponent.itemCount = 0;
        //this.loader.close();
      }
    );
  }
}

const FILTER_TYPES:any = {
  CATEGORY  : 1,
  TRADEMARK : 2
};
export { FILTER_TYPES };

export interface ITrademark {
  id:number;
  trademark:string;
  imageUrl:string;
  description?:string;
};
export interface ICategory {
  id:number;
  category:string;
  imageUrl:string;
  description:string;
  title?:string;
};
export interface IProductProperty {
  id:number;
  property:string;
  value:string;
};
export interface IProduct {
  id?:number;
  skuSap:string;
  skuSapId?:string;
  iso?:string;
  imageUrl?:string;
  trademark?:string;
  price?:number;
  previous?:number;
  discount?:number;
  currency?:string;
  relProductProperties:IProductProperty[];
  relProductsProperties?:IProductProperty[];
  salePriceDiscount:number;
  details?:IProductProperty[];
  data: {
    quantity: number,
    options?: any
  };
  ratings?: {
    rating: number,
    ratingCount: number
  };
  description?:string
  category?:string;
  tags?:string[];
  priceStr?:string;
  previousStr?:string;
  totalStr?:string;
  gallery?: string[];
  stock?:number;
};
export interface ICategoryFilters {
  category:IResultCategory | null;
  filterType?:number | null;
  categoryId?:number | null;
  trademarkId?:number | null;
  subcategoryId1?:number | null;
  subcategoryId2?:number | null;
};

export interface ParamsToSearch{
  productSubcategoryId:string;
  priceRange2:string;
  priceRange1:string;
  trademarkId:string;
  trademark:string;
  orderPrice:boolean;
  productCategoryId:string;
  productCategoryName:string;
  search:string;
  recordsPage:number;
  page:number;
  badgeContent:number;
}