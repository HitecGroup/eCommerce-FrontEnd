import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CountryDB } from '../../../shared/inmemory-db/countries';
import { ShopService, CartItem, IProduct } from '../shop.service';
import { egretAnimations } from "../../../shared/animations/egret-animations";
import { ServiceService } from 'app/shared/services/service.service';
import {MatTableModule} from '@angular/material/table';
import { CdkTableModule} from '@angular/cdk/table';
import {DataSource} from '@angular/cdk/table';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  animations: egretAnimations
})
export class CheckoutComponent implements OnInit {
  public cart: IProduct[];
  public checkoutForm: FormGroup;
  public checkoutFormAlt: FormGroup;
  public hasAltAddress: boolean;
  public countries: any[];

  public total: number;
  public subTotal: number;
  public minIVA: number = 8;
  public maxIVA: number = 16;
  public IVA: number = 16;
  public discount: number = 100;
  // public shipping: any = 'Free';
  public shipping: number=10;
  public paymentMethod: string;
  public dollar:number = 0;

  displayedColumns: string[] = ['article', 'quantity', 'price', 'total'];
  dataSource: IProduct[];
  constructor(
    private fb: FormBuilder,
    private shopService: ShopService,
    private service:ServiceService
  ) {
    let countryDB = new CountryDB();
    this.countries = countryDB.countries;
  }

  ngOnInit() {
    this.dollar = this.shopService.dollar;
    this.getCart();
    this.buildCheckoutForm();
  }
  calculateCost() {
    this.subTotal = 0;
    this.cart.forEach(item => {
      this.subTotal += (item.salePriceDiscount * item.data.quantity)
    })
    this.total = this.subTotal + (this.subTotal * (this.IVA/100));
    this.total += this.shipping;
    // if(this.shipping !== 'Free') {}
  }

  getCart() {
    // Consumo de carrito de compras real
    this.shopService
    .getCart()
    .subscribe(cart => {
      this.cart = cart;
      this.cart.forEach(e => {
        e.priceStr = parseFloat((String(e.salePriceDiscount))).toFixed(2);
        e.totalStr = parseFloat((String(e.salePriceDiscount * e.data.quantity))).toFixed(2);
      });
      this.dataSource = this.cart;
      this.calculateCost();
    });
  }

  buildCheckoutForm() {
    this.checkoutForm = this.fb.group({
      country: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      company: [],
      address1: ['', Validators.required],
      address2: [],
      city: ['', Validators.required],
      zip: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', Validators.required]
    })

    this.checkoutFormAlt = this.fb.group({
      country: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      company: [],
      address1: ['', Validators.required],
      address2: [],
      city: ['', Validators.required],
      zip: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', Validators.required]
    })
  }


  placeOrder() {
    let billingAddress = this.checkoutForm.value;
    let shippingAddress;
    
    if(this.hasAltAddress) {
      shippingAddress = this.checkoutFormAlt.value;
    }
  }

}
