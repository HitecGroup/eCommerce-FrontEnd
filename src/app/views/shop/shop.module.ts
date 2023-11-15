import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { StarRatingModule } from 'angular-star-rating';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { SharedModule } from '../../shared/shared.module'

import { ProductsComponent } from './products/products.component';
import { ShopService } from './shop.service';
import { ShopRoutes } from './shop.routing';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { SharedDirectivesModule } from 'app/shared/directives/shared-directives.module';
import { ShopComponent } from './shop.component';
import { TrademarksComponent } from './trademarks/trademarks.component';
import { CategoriesComponent } from './categories/categories.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { OrdersComponent } from './orders/orders.component';
import { OrderTrackingComponent } from './orders/order-tracking/order-tracking.component';
import { ComboComponent } from './products/combo/combo.component';
import { OrderPayComponent } from './orders/order-pay/order-pay.component';
import { DiscountComponent } from './products/discount/discount.component';
import { FaqsComponent } from './faqs/faqs.component';

import localeEs from '@angular/common/locales/es';
import localeEsMx from '@angular/common/locales/es-MX';
import { registerLocaleData } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FeaturedComponent } from './products/featured/featured.component';
// registerLocaleData(localeEs, 'es');
registerLocaleData(localeEsMx, 'es-Mx');

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatRippleModule,
    MatTabsModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatListModule,
    MatSidenavModule,
    StarRatingModule.forRoot(),
    NgxPaginationModule,
    NgxDatatableModule,
    NgxSliderModule,
    RouterModule.forChild(ShopRoutes),
    SharedDirectivesModule,
    MatStepperModule,
    MatTableModule,
    MatTooltipModule
  ],
  declarations: [
    ProductsComponent, 
    ProductDetailsComponent, 
    CartComponent, CheckoutComponent, ShopComponent, TrademarksComponent, CategoriesComponent, OrdersComponent, OrderTrackingComponent, ComboComponent, OrderPayComponent, DiscountComponent, FaqsComponent, FeaturedComponent,
  ],
  providers: [
    ShopService,
    {provide: LOCALE_ID,useValue:'es-MX'}]
})
export class ShopModule { }
