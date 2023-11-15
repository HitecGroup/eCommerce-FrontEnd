import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ShopService, CartItem, IProduct } from '../shop.service';
import { Product } from '../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../shared/animations/egret-animations';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { ISearchParams, ShopSearchParams } from '../shop-search-params';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  animations: [egretAnimations]
})
export class ProductsComponent implements OnInit, OnDestroy {
  public isSideNavOpen: boolean;
  public viewMode: string = 'grid-view';
  public currentPage: any;
  @ViewChild(MatSidenav) private sideNav: MatSidenav;

  public products$: Observable<Product[]>;
  public categories$: Observable<any>;
  public activeCategory: string = 'all';
  public filterForm: FormGroup;
  public cart: IProduct[];
  public cartData: any;

  constructor(
    private shopService: ShopService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private loader: AppLoaderService,
    private shopSearchParams:ShopSearchParams
  ) { }

  searchParamsSubscription:Subscription;

  ngOnInit() {
    this.categories$ = this.shopService.getCategories();
    this.buildFilterForm(this.shopService.initialFilters);
    
    setTimeout(() => {
      this.loader.open();
    });
    // this.products$ = this.shopService
    //   .getFilteredProduct(this.filterForm)
    //   .pipe(
    //     map(products => {
    //       this.loader.close();
    //       return products;
    //     })
    //   );
    this.getCart();
    this.cartData = this.shopService.cartData;
    //
    this.searchParamsSubscription = this.shopSearchParams.searchParams$.subscribe(
      (next:ISearchParams) => {

      },
      (error) => {
        console.log(error);
      }
    );
  }
  ngOnDestroy() {
    this.searchParamsSubscription?.unsubscribe();
  }
  getCart() {
    this.shopService
    .getCart()
    .subscribe(cart => {
      this.cart = cart;
    })
  }
  addToCart(product) {
    // let cartItem: CartItem = {
    //   product: product,
    //   data: {
    //     quantity: 1
    //   }
    // };
    // this.shopService
    // .addToCart(cartItem)
    // .subscribe(cart => {
    //   this.cart = cart;
    //   this.snackBar.open('Product added to cart', 'OK', { duration: 4000 });
    // })
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
  setActiveCategory(category) {
    this.activeCategory = category;
    this.filterForm.controls['category'].setValue(category)
  }

  toggleSideNav() {
    this.sideNav.opened = !this.sideNav.opened;
  }
}
