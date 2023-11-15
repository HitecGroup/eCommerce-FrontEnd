import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { egretAnimations } from 'app/shared/animations/egret-animations';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ServiceService } from 'app/shared/services/service.service';

@Component({
  selector: 'app-combo',
  templateUrl: './combo.component.html',
  styleUrls: ['./combo.component.scss'],
  animations: [egretAnimations]
})
export class ComboComponent implements OnInit {

  constructor(
    private service: ServiceService,
    private activatedRoute: ActivatedRoute,
    private loader: AppLoaderService,
    private router: Router
  ) { }
  dollar:number = 0;
  banner:any;
  userInfo:any;
  ngOnInit(): void {
    this.banner = JSON.parse(localStorage.getItem('banner'));
    this.userInfo = this.service.getSession();
    this.loader.close();
    this.activatedRoute.paramMap.subscribe(params => {
      let bannerUrl = params.get('bannerUrl');
      if (bannerUrl) {
        this.searchBannerProducts({ recordsPage: 100, currentPage: 0, search: bannerUrl });
      } else {
        this.service.openDialog('No se encontraron resultados. Intenta con otra búsqueda o modifica tus filtros');
      }
    });
  }

  products:any[] = [];
  rowsNumber:number = 0;
  public searchBannerProducts(bannerUrl: any) {
    this.loader.open("Espere por favor ...");
    this.service.searchBannerProducts(bannerUrl).subscribe(
      (data: any) => {
        this.loader.close();
        if (data) {
          this.products = data.products;
          this.rowsNumber = data.recordsTotal;
        } else {
          this.products = [];
          this.rowsNumber = 0;
        }
      },
      (http: HttpErrorResponse) => {
        this.loader.close();
        this.service.processHttpResponse(http);
      },
      ()=>{
        this.getCurrentCurrencySAPSimple();
      }
    );
  }

  addToCart() {
    if (!this.userInfo) {
      this.service.openDialog('Inicie sesión para agregar al carrito');
      return;
    }
    let setCombo = {
      userId: this.userInfo.idUser,
      bannerId: this.banner.id
    };
    this.service.addComboToCart(setCombo).subscribe(
      (data:any)=>{
        this.service.openDialog(data.body);
        this.router.navigate(['/shop/cart']);
      },
      (error:HttpErrorResponse)=>{
        if(error.status==200){
          this.service.openDialog('Se agregó el combo al carrito de compra exitosamente.');
          this.router.navigate(['/shop/cart']);
        }
        this.service.processHttpResponse(error);
      }
    );
  }

  getPropertiesByRecords(details:Array<any>,records:number=7){
    let itemsNotShow:Array<number> = [84, 118, 35, 30, 124];
    return details ? details.filter((p)=> !itemsNotShow.some(i=>i == p.propertyId)).slice(0,records) : '';
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
