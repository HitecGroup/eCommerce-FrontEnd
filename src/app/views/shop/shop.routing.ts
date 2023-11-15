import { Routes } from '@angular/router';
import { ProductsComponent } from './products/products.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { ShopComponent } from './shop.component';
import { TrademarksComponent } from './trademarks/trademarks.component';
import { CategoriesComponent } from './categories/categories.component';
import { OrdersComponent } from './orders/orders.component';
import { OrderTrackingComponent } from './orders/order-tracking/order-tracking.component';
import { ComboComponent } from './products/combo/combo.component';
import { OrderPayComponent } from './orders/order-pay/order-pay.component';
import { DiscountComponent } from './products/discount/discount.component';
import { FaqsComponent } from './faqs/faqs.component';
import { FeaturedComponent } from './products/featured/featured.component';

export const ShopRoutes: Routes = [{
  path: '',
  children: [
    {
      path: '',
      component: ShopComponent
    }, 
    {
      path: 'products/:id',
      component: ProductDetailsComponent,
      data: { title: 'Detalles', breadcrumb: 'Detail' }
    }, 
    {
      path: 'cart',
      component: CartComponent,
      data: { title: 'Carrito', breadcrumb: 'CART' }
    }, 
    {
      path: 'checkout',
      component: CheckoutComponent,
      data: { title: 'Checkout', breadcrumb: 'CHECKOUT' }
    },
    {
      path: 'products',
      component: ProductsComponent,
      data: { title: 'Prouctos', breadcrumb: 'PRODUCTOS' }
    },
    {
      path: 'products/combo/:bannerUrl',
      component: ComboComponent,
      data: { title: 'Combo', breadcrumb: 'COMBO' }
    },
    {
      path: 'products/discount/:bannerUrl',
      component: DiscountComponent,
      data: { title: 'Descuentos', breadcrumb: 'DISCOUNT' }
    },
    {
      path: 'products/featured/:trademarkId',
      component: FeaturedComponent,
      data: { title: 'Destacados', breadcrumb: 'DESTACADOS' }
    },
    {
      path: 'trademarks',
      component: TrademarksComponent,
      data: { title: 'Marcas', breadcrumb: 'MARCAS' }
    },
    {
      path: 'categories',
      component: CategoriesComponent,
      data: { title: 'Categorias', breadcrumb: 'CATEGORIAS' }
    },
    {
      path: 'orders',
      component: OrdersComponent,
      data: { title: 'Pedidos', breadcrumb: 'PEDIDOS' }
    },
    {
      path: 'orders/tracking',
      component: OrderTrackingComponent,
      data: { title: 'Seguimiento', breadcrumb: 'SEGUIMIENTO' }
    },
    {
      path: 'orders/pay',
      component: OrderPayComponent,
      data: { title: 'Pago', breadcrumb: 'PAGO' }
    },
    {
      path: 'shop',
      component: ShopComponent,
      data: { title: 'Home', breadcrumb: 'Home' }
    },
    {
      path: 'faqs',
      component: FaqsComponent,
      data: { title:'Preguntas frecuentes', breadcrumb: 'FAQS' }
    }
  ]
}];