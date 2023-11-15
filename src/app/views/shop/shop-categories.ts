import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IResultCategory } from './categories/categories.component';
import { ICategory } from './shop.service';

@Injectable({
  providedIn: 'root'
})
export class ShopCategories {

  _categories = new BehaviorSubject<any>({});
  categories$ = this._categories.asObservable();

  constructor() { }

  setCategories(categories:ICategory[]):void {
    this._categories.next({
      type:1,
      categories:categories,
    });
  }

  setTrademarks(categories:ICategory[]):void {
    this._categories.next({
      type:3,
      categories:categories,
    });
  }

  setCategory(category:IResultCategory,categoryTrademark:string):void {
    this._categories.next({
      type:2,
      category:category,
      categoryTrademark:categoryTrademark
    });
  }

  setCategoryNull(){
    this._categories = new BehaviorSubject<any>({});
    this.categories$ = this._categories.asObservable();
  }
}