import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShopSearchParams {

  _searchParams = new BehaviorSubject<any>({});
  searchParams$ = this._searchParams.asObservable();

  constructor() { }

  setSearchParams(searchParams:ISearchParams):void {
    this._searchParams.next(searchParams);
  }

}

export interface ISearchParams{
  searchValue:string;
}