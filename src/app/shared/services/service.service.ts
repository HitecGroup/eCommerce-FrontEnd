import { formatDate } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Form } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { IProduct } from 'app/views/shop/shop.service';
import { Observable, of } from 'rxjs';
import { DialogConfirmComponent } from '../components/dialog-confirm/dialog-confirm.component';
import { DialogComponent } from '../components/dialog/dialog.component';
import { HeaderTopComponent } from '../components/header-top/header-top.component';
import { API } from './api';
import { StorageService } from './storage.service';


@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  
  private URL_LOGIN:string = API.URL_BASE+'api/login';
  private URL_GET_USER_INFO = API.URL_BASE+'api/Users';
  private URL_REGISTRER =  API.URL_BASE+'api/Users';
  private URL_REGIMEN_FISCAL = API.URL_BASE+'api/CatTaxRegimes';
  private URL_RESET_PASSWORD:string = API.URL_BASE+'api/ActiveAccount';
  private URL_CHANGE_PASSWORD = API.URL_BASE+'api/changePasswordAccount';
  private URL_CAT_CATEGORIES:string = API.URL_BASE+'api/CatCategory'
  private URL_SAVE_AVATAR:string = API.URL_BASE+'api/Users/UpdateAvatar'
  private URL_USER_UPDATE = API.URL_BASE+'api/Users/Update';
  private URL_USER_REGISTER_ADDRESS = API.URL_BASE+'api/Users/RegisterAddress';
  private URL_GET_ADDRESS_SPM = API.URL_BASE+'api/GetAddressSPM';
  private URL_PRODUCT_CATEGORIES_FILTERS:string = API.URL_BASE+'api/ProductCategories/Filters';
  private URL_PRODUCT_CATEGORIES_ID:string = API.URL_BASE+'api/ProductCategories/5';
  private URL_SEARCH_PRODUCTS_SIMPLE = API.URL_BASE+'api/Products/Simple';
  private URL_SEARCH_PRODUCTS_DETAILS = API.URL_BASE+'api/Products/Details';
  private URL_SEARCH_PRODUCTS = API.URL_BASE+'api/Products';
  private URL_GET_SIMPLE_BY_NOT_EMPTY = API.URL_BASE+'api/ShoppingCars/GetEmpty/';
  private URL_ORDERS = API.URL_BASE+'api/Orders';
  private URL_GET_DISCOUNT = API.URL_BASE+'api/DiscountCodes/byKey/'
  private URL_PRODUCTCATEGORIES_AUTOCOMPLETE:string =  API.URL_BASE+'api/ProductCategories/Autocomplete';
  private URL_SEARCH_BY_TEXT:string = API.URL_BASE+'api/Products/SearchByText';
  private URL_GET_SHOPPING_CAR_BY_ID:string =  API.URL_BASE+'api/ShoppingCars/';
  private URL_GET_SHOPPINGCARS_SIMPLEBYNOTEMPTY:string = API.URL_BASE+'api/ShoppingCars/SimpleByNotEmpy/';
  private URL_GET_SHOPPINGCARS_UPDATEORDERS:string = API.URL_BASE+'api/ShoppingCars/UpdateOrders/'
  private URL_GET_CAR_DETAILS:string = API.URL_BASE+'api/Orders';
  private URL_GET_CURRENT_CURRENCY_SAP_SIMPLE = API.URL_BASE+'api/getCurrentCurrencySAPSimple/'
  private URL_DELETE_ORDER = API.URL_BASE+'api/Orders/';
  private URL_DELETE_ORDERS = API.URL_BASE+'api/Orders/OList/';
  private URL_GET_HEADER_BANNER = API.URL_BASE+'api/Banners/Header';
  private URL_SEARCH_PRODUCTS_BANNER = API.URL_BASE+'api/Banners/BannerUrl';
  private URL_SET_COMBO = API.URL_BASE+'api/ShoppingCars/SetCombo';
  private URL_DELETE_COMBOS = API.URL_BASE+'api/ShoppingCars/DeleteCombo/'
  private URL_COUNT_ORDER = API.URL_BASE+'api/ShoppingCars/OrdersCount';
  private URL_GET_CREATE_ORDER = API.URL_BASE+'api/CreateOrder/';
  private URL_GET_PAY_ORDER = API.URL_BASE+'api/ShoppingCars/ByIdOrder/';
  private URL_GET_STOCK_DORMER = API.URL_BASE+'api/GetProductStockDormer/';
  private URL_PUT_STOCK_DORMER = API.URL_BASE+'api/PutProductStockDormer';
  private URL_BEST_SELLERS:string = API.URL_BASE+'api/Products/bestsellers';
  private URL_FEATURED_PRODUCTS:string = API.URL_BASE+'api/Products/featured/products';
  // Pay bbva
  public URL_BBVA_SUCCESS = API.URL_BASE+'api/ShoppingCars/paymentSuccess';
  public URL_BBVA_FAILED = API.URL_BASE+'api/ShoppingCars/paymentFailed';

  constructor(
    private dialog:MatDialog,
    private http: HttpClient,
    private router:Router,
    private storage:StorageService,
  ) { }

  private headers:any = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods' : 'HEAD, GET, POST, PUT, PATCH, DELETE', 
    'Access-Control-Allow-Headers' : 'Origin, Content-Type, X-Auth-Token',
    'responseType': 'json', 
  }
  
  onImgError(event, id: any){
    let imgURoute = "assets/images/trademarks/default.jpg";
    switch (Number(id)) {
      case 1:
        imgURoute = "assets/images/trademarks/marca_hitec.png"; //HITEC
        break;
      case 2:
        imgURoute = "assets/images/trademarks/marca_seco.png"; //SECO
        break;
      case 3:
        imgURoute = "assets/images/trademarks/marca_sandvik.png"; //SANDVIK
        break;
      case 4:
        imgURoute = "assets/images/trademarks/marca_dormer.png"; //DORMER
        break;
      case 5:
        imgURoute = "assets/images/trademarks/marca_siemens.png"; //NXSIEMS 
        break;
      case 6:
        imgURoute = "assets/images/trademarks/marca_universalrobots.png"; // UNIVERSAL ROBOTS         
        break;
      case 7:
        imgURoute = "assets/images/trademarks/marca_solid.png"; // TOP SOLID
        break;
      case 8:
        imgURoute = "assets/images/trademarks/marca_accudyne.png";  // EZ PULLER / ACCUDYNE 
        break;
      case 9:
        imgURoute = "assets/images/trademarks/marca_rohm.png"; //ROHM
        break;
      case 10:
        imgURoute = "assets/images/trademarks/marca_oak.png";  //OAK SIGNATURE
        break;
      case 11:
        imgURoute = "assets/images/trademarks/default.png"; // CNC EDM TOOL SYSTEMS LTD      
        break;
      case 12:
        imgURoute = "assets/images/trademarks/marca_axis.png"; // 5TH AXIS
        break;
      case 13:
        imgURoute = "assets/images/trademarks/marca_vertek.png"; // VEKTEK
        break;
      case 14:
        imgURoute = "assets/images/trademarks/marca_midaco.png"; // MIDACO
        break;
      case 15:
        imgURoute = "assets/images/trademarks/marca_airTurbine.png"; // AIRTURBINE 
        break;
      case 16:
        imgURoute = "assets/images/trademarks/marca_gerardi.png"; // GERARDI
        break;
      case 17:
        imgURoute = "assets/images/trademarks/marca_haas.png"; // HAAS
        break;
      case 18:
        imgURoute = "assets/images/trademarks/marca_haimer.png"; // HAIMER
        break;
      case 19:
        imgURoute = "assets/images/trademarks/marca_hpedm.png"; // HPEDM
        break;
      case 20:
        imgURoute = "assets/images/trademarks/marca_tmx.png"; // TMX
        break;
    }
    
    event.target.src = imgURoute;
   //Do other stuff with the event.target
  }

  public getFeaturedProducts(data:any){
    let options = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'responseType': 'json',
      }
    };
    return this.http.get(`${this.URL_FEATURED_PRODUCTS}/${data.trademarkId}`,options);
  }

  public getProductDetails(data:any){
    let options = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'responseType': 'json',
      }
    };
    return this.http.post(this.URL_SEARCH_PRODUCTS_DETAILS,{...data},options);
  }

  public getBestSellers(data:any){
    let options = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'responseType': 'json',
      }
    };
    return this.http.get(`${this.URL_BEST_SELLERS}/${data.page}/${data.pageSize}`,options);
  }

  public sortByName(array:any[],key:string = undefined) {
    let sort:any[] = []
    if (array.length > 0) {
      array.sort(
        function(a, b) {
          var textA = String(a.title).toUpperCase();
          var textB = String(b.title).toUpperCase();
          if (key) {
            textA = String(a[key]).toUpperCase();
            textB = String(b[key]).toUpperCase();
          }
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        }
      );
      sort = array;
    }
    return sort;
  }

  public processHttpResponse(http:HttpErrorResponse) {
    console.log(http);
    if(http.status){
      if(http.error?.message){
        this.openDialog(String(http.error.message));
      } else {
        if (http.error) {
          this.openDialog(String(http.error));
        } else {
          this.openDialog(`Error al conectar con los servicios, no se proporcionó una respuesta válida, estatus: ${http.status}`);
        }
      }
    }else{
      this.openDialog('Error al conectar con los servicios, verifique su conexión o contacte al area de soporte');
    }
  }

  public openDialog(content:string) {
    return this.dialog.open(DialogComponent, {
      data: {
        title: "Mensaje de la Plataforma: ",
        content: content
      },
      autoFocus: false,
      disableClose:true
    }).afterClosed();
  }

  openConfirm(message: string) {
    return this.dialog.open(DialogConfirmComponent, {
      data: { message: message, confirm: true },
      autoFocus: false,
      disableClose: true
    }).afterClosed().toPromise();
  }
  
  public toISODate(date:Date){
    if(!date) return "";
    return formatDate(date, 'yyyy-MM-dd', 'en-MX');
  }

  public toExtendedDate(date:Date){
    if(!date) return "";
    return formatDate(date, 'dd \'de\' MMMM \'del\' yyyy', 'en-MX');
  }

  public toISODatetime(date:Date){
    if(!date) return "";
    return formatDate(date, 'yyyy-MM-dd HH:mm:ss', 'en-MX');
  }

  public toOrderDatetime(date:Date){
    if(!date) return "";
    return formatDate(date, 'hh:mm a dd/MM/yyyy', 'en-MX');
  }

  public async saveProfileImage(data:FormData){
    let userInfo:any = await this.storage.getUserInfo();
    let headers:any = {
      'responseType': 'json',
      'Authorization': `Bearer ${userInfo.token}`
    };
    // return this.http.post<any>(`${this.URL_SAVE_AVATAR}/${userInfo.idUser}`,{...data, Id: userInfo.idUser},options).toPromise();
    return this.http.post<any>(`${this.URL_SAVE_AVATAR}/${userInfo.idUser}`,data,{observe:'response',headers:headers}).toPromise();
  }

  public updateHeaderImage(urlImage:string){
    // Set image on header
    // let url:string = URL.createObjectURL(file);
    HeaderTopComponent.profileImageUrl = urlImage;
  }

  //POST
  public payOrder(shopingCarID:number, discountCodeKey:string, data:payForm){
    let options = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getSessionToken()}`,
        'Accept': 'application/json',
        'responseType': 'json',
      },
    };

    let url = this.URL_GET_PAY_ORDER + shopingCarID;
    
    if(discountCodeKey){
      return this.http.post(this.URL_GET_PAY_ORDER + `${shopingCarID}/${discountCodeKey}`, data, options);
    }
    
    return this.http.post(url, data, options);
  }

  //GET: api/ProductCategories/Autocomplete 
  public getAutocomplete():Observable<HttpResponse<any>>{
    let options = {
      headers: new HttpHeaders(this.headers)
    }
    return this.http.get<HttpResponse<any>>(this.URL_PRODUCTCATEGORIES_AUTOCOMPLETE, options);
  }

  //igasca - Noviembre 1, 2023 - Se agrega para obtener el detalle de Marca, Categoría, Subcategoría1 y Subcategoría2 para la variable menuSelected
  //GET: api/ProductCategories/5 
  public getProductCategories(id:any){
    return this.http.get<HttpResponse<any>>(this.URL_PRODUCT_CATEGORIES_ID, id);
  }

  //POST
  public searchByText(data:any):Observable<HttpResponse<any>> {
    let headers = {
      ...this.headers,
    };
    return this.http.post(this.URL_SEARCH_BY_TEXT,{...data},{observe:'response',headers:headers});
  }

  //POST
  public login(data: object){
    let options = {
      headers: new HttpHeaders(this.headers)
    }
    return this.http.post<any>(this.URL_LOGIN, data, options);
  }

  public logout(url:string='/sessions/signin') {
    this.storage.clearUserInfo();
    this.goTo(url);
  }

  public registre(data){
    let options = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'responseType': 'json',
      }
    }
    return this.http.post(this.URL_REGISTRER, JSON.stringify(data), options);
  }

  public getUserInfo(){
    let options = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getSessionToken()}`,
        'Accept': 'application/json',
        'responseType': 'json',
      },
      //params: {...params}
    };
    return this.http.get(this.URL_GET_USER_INFO+`/${this.getUserID()}`, options);
  }

  public regimenFiscal(){
    let options = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'responseType': 'json',
      }
    };
    return this.http.get(this.URL_REGIMEN_FISCAL, options);
  }
  
  public goTo(url:string){
    this.router.navigateByUrl(url);
  }

  public goToId(url:string,id:any){
    this.router.navigate([url,id]);
  }
  
  //POST
  public restorePassword(data:any){
    let options = {
      ...this.headers,
    };
    return this.http.post(this.URL_RESET_PASSWORD,{...data},options);
  }

  //POST
  public async changePassword(data:any){
    let userInfo:any = await this.storage.getUserInfo();
    let headers = {
      ...this.headers,
      'Authorization': `Bearer ${userInfo.token}`,
    };
    //console.log(options);
    return this.http.post<any>(this.URL_CHANGE_PASSWORD,{...data, Id: userInfo.idUser},{observe:'response',headers:headers}).toPromise();
    // return this.http.post(this.URL_PRODUCT_CATEGORIES_FILTERS,{...data},{observe:'response',headers:headers});
  }

  public searchProducts(data:any){
    let options = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'responseType': 'json',
      }
    };
    return this.http.post(this.URL_SEARCH_PRODUCTS,{...data},options);
  }

    //GET
    public getHeaderBanners():Observable<HttpResponse<any>> {
      let headers = {
        ...this.headers,
      };
      return this.http.get<any>(this.URL_GET_HEADER_BANNER,{observe:'response',headers:headers});
    }
  
    //POST
    public searchBannerProducts(params:any){
      let options = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'responseType': 'json',
        }
      };
      
      return this.http.post(this.URL_SEARCH_PRODUCTS_BANNER, params, options);
    }

  //PUT
  public userUpdate(data):Observable<HttpResponse<any>>{
    let headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getSessionToken()}`,
      'Accept': 'application/json',
      'responseType': 'json',
    };
    return this.http.put(this.URL_USER_UPDATE+`/${this.getUserID()}`, JSON.stringify(data), {observe:'response',headers:headers});
  }

  public userRegisterAddress(data){
    let options = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getSessionToken()}`,
        'Accept': 'application/json',
        'responseType': 'json',
      }
    };
    return this.http.put(this.URL_USER_REGISTER_ADDRESS+`/${this.getUserID()}`, JSON.stringify(data), options);
  }

  public getAddressSPM(postalCode:string){
    let options = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getSessionToken()}`,
        'Accept': 'application/json',
        'responseType': 'json',
      },
      //params: {...params}
    };
    return this.http.get(this.URL_GET_ADDRESS_SPM+`/${postalCode}`, options);
  }

  public getSession(){
    return this.storage.getUserInfo();
  }

  public getUserID(){
    let userInfo:any = this.storage.getUserInfo();
    return userInfo.idUser;
  }

  private getSessionToken(){
    let userInfo:any = this.storage.getUserInfo();
    return userInfo.token;
  }

  //GET
  public getProductCategoriesFilters(data:any):Observable<HttpResponse<any>> {
    let headers = {
      ...this.headers,
    };
    return this.http.post(this.URL_PRODUCT_CATEGORIES_FILTERS,{...data},{observe:'response',headers:headers});
  }

  //GET
  public getHomeCategories():Observable<HttpResponse<any>> {
    let headers = {
      ...this.headers,
    };
    return this.http.get<any>(`${this.URL_CAT_CATEGORIES}/homeCategories`,{observe:'response',headers:headers});
  }

  public  getSimpleByNotEmpy(userInfo:any):Observable<HttpResponse<any>>{
    
      let headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userInfo.token}`,
        'Accept': 'application/json',
        'responseType': 'json',
      };
    return this.http.get<any>(this.URL_GET_SIMPLE_BY_NOT_EMPTY+`${userInfo.idUser}`, {observe:'response',headers:headers});
  }

  public addToCart(data,userInfo):Observable<HttpResponse<any>>{
    let headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userInfo.token}`,
      'Accept': 'application/json',
      'responseType': 'json',
    };
    return this.http.post(this.URL_ORDERS, JSON.stringify(data), {observe:'response',headers:headers});
  }

  public getShoppingCar():Observable<HttpResponse<any>>{
    let userInfo:any = this.storage.getUserInfo();
    let headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userInfo.token}`,
      'Accept': 'application/json',
      'responseType': 'json',
    };
    return this.http.get<any>(this.URL_GET_SHOPPING_CAR_BY_ID + `${userInfo.shoppingCar[0].id}`, {observe:'response',headers:headers});
  }

  public getShoppingCarsSimpleByNoEmpty(){
    let userInfo:any = this.storage.getUserInfo();
    let headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userInfo.token}`,
      'Accept': 'application/json',
      'responseType': 'json',
    };
    return this.http.get<any>(this.URL_GET_SHOPPINGCARS_SIMPLEBYNOTEMPTY + `${userInfo.idUser}`, {observe:'response',headers:headers});
  }

  //GET
  public getOrders(shopingCarID:number){
    let userInfo:any = this.storage.getUserInfo();
    let headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userInfo.token}`,
      'Accept': 'application/json',
      'responseType': 'json',
    };
    return this.http.get(this.URL_GET_SHOPPINGCARS_UPDATEORDERS+`${shopingCarID}`,  {observe:'response',headers:headers});
  }

  public getOrderDetails(shoppingCartId: number,skuId: number):Observable<any>{
    let userInfo:any = this.storage.getUserInfo();
    let headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userInfo.token}`,
      'Accept': 'application/json',
      'responseType': 'json',
    };
  	return this.http.get(this.URL_GET_CAR_DETAILS+`/${shoppingCartId}`+`/${skuId}`, {observe:'response',headers:headers});
  }

  // GET: api/DiscountCodes/byKey/{key}/{idUser}
  public getDiscountCodes(key:string,idUser:number){
    let options = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'responseType': 'json',
      }
    };
    return this.http.get(`${this.URL_GET_DISCOUNT}${key}/${idUser}`, options);
  }

  //GET
  public getCurrentCurrencySAPSimple(){
    let headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'responseType': 'json',
    };
    return this.http.get(this.URL_GET_CURRENT_CURRENCY_SAP_SIMPLE, {observe:'response',headers:headers});
  }

  // POST
  public addComboToCart(data:any){
    let userInfo:any = this.storage.getUserInfo();
   
    let headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userInfo.token}`,
      'Accept': 'application/json',
      'responseType': 'json',
    };
    return this.http.post(this.URL_SET_COMBO, data, {observe:'response',headers:headers});
  }

  //POST
  public deleteCombos(shopingCarID:number){
    let data = {
      "idShoppingCar": shopingCarID
    }
    let userInfo:any = this.storage.getUserInfo();
    
    let headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userInfo.token}`,
      'Accept': 'application/json',
      'responseType': 'json',
    };
    return this.http.post(this.URL_DELETE_COMBOS,data,{observe:'response',headers:headers});
  }

  public deleteOrder(params:any):Observable<HttpResponse<any>>{
    let userInfo:any = this.storage.getUserInfo();
    let headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userInfo.token}`,
      'Accept': 'application/json',
      'responseType': 'json',
    };
    return this.http.delete<any>(this.URL_DELETE_ORDER+`${params.shopingCarID}`+`/${params.skuSap}`, {observe:'response',headers:headers});
  }

  public deleteOrders(shopingCarID:number):Observable<HttpResponse<any>>{
    let userInfo:any = this.storage.getUserInfo();
    let headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userInfo.token}`,
      'Accept': 'application/json',
      'responseType': 'json',
    };
    return this.http.delete<any>(this.URL_DELETE_ORDERS+`${shopingCarID}`, {observe:'response',headers:headers});
  }

  public getBadgeCount():Observable<HttpResponse<any>> {
    let userInfo:any = this.storage.getUserInfo();
    let data ={
      "email": userInfo.email
    };
    let headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userInfo.token}`,
      'Accept': 'application/json',
      'responseType': 'json',
    };
    return this.http.post(this.URL_COUNT_ORDER,{...data},{observe:'response',headers:headers});
  }


  businessRules(stock, stockUs, stockEr, stockAs, trademarkId){
    
    switch(Number(trademarkId)){
      // ======== REGLA DE NEGOCIO HITEC ======== //
      case 1:
        //Su hay stock en SAP
        if(stock > 0){
          return("3 a 5 días");
        }
        //
        else{
          return("No disponible por el momento");
        }
        break;
      // ======== REGLA DE NEGOCIO SECO ======== //
      case 2:
        //Si hay stock en US
        if(stockUs > 0){
          return("4 a 6 días");
        }
        //Si no hay stock en US, pero en EU
        else if(stockEr > 0){
          return("7 a 9 días");
        }
        //Si no hay stock en ninguno
        else{
          return("No disponible por el momento");
        }
        break;
      // ======== REGLA DE NEGOCIO DORMER ======== //
      case 4:
        //Si hay stock en US
        if(stockUs > 0){
          return("5 a 7 días");
        }
        //Si no hay stock en US, pero hay stock en EU
        else if(stockEr > 0){
          return("9 a 12 días");
        }
        //Si no hay stock en ninguno
        else{
          return("No disponible por el momento");
        }
        break;

      // ======== REGLA DE NEGOCIO SANDVIK ======== //
      case 3:
        //Si hay stock en US
        if(stockUs > 0){
          return("3 a 5 días");
        }
        //Si no hay stock en US, pero hay stock en EU
        else if(stockEr > 0){
          return("8 a 10 días");
        }
        //Si no hay en US, ni EU, pero hay stock en AS
        else if(stockAs > 0){
          return("12 a 18 días");
        }
        //Si no hay stock en ninguno
        else{
          return("No disponible por el momento");
        }
        break;

      // ======== REGLA DE NEGOCIO UNIVERSAL ROBOTS ======== //
      case 6:
        //Si hay stock en PIM
        if (stock > 0) {
          return("8 a 10 días");
        }
        else {
          return("No disponible por el momento");
        }
        break;
      // ======== REGLA DE NEGOCIO 5th AXIS ======== //
      case 12:
        //Si hay stock en PIM
        if (stock > 0) {
          return("10 a 12 días");
        }
        else {
          return("No disponible por el momento");
        }
        break;

      // ======== DEFAULT ======== //
      default:
        return("3 a 5 días");
        break;
    }
  }

  public createOrder(shopingCarID:number, billRequired:any, discountCodeKey:string, data:payForm){
    let options = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getSessionToken()}`,
        'Accept': 'application/json',
        'responseType': 'json',
      },
    };

    if(discountCodeKey){
      return this.http.post(this.URL_GET_CREATE_ORDER + `${shopingCarID}` + `/` + `${billRequired}` + `/` + `${discountCodeKey}`, data, options);
    }

    return this.http.post(this.URL_GET_CREATE_ORDER + `${shopingCarID}` + `/` + `${billRequired}`, data, options);
  }

  public getProductStockDormer(eCodeDormer:string){
    let options = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getSessionToken()}`,
        'Accept': 'application/json',
        'responseType': 'json',
      },
    };
    return this.http.get(this.URL_GET_STOCK_DORMER+eCodeDormer, options);
  }

  public putProductStockDormer(data:any){
    let options = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getSessionToken()}`,
        'Accept': 'application/json',
        'responseType': 'json',
      },
    };
    return this.http.put(this.URL_PUT_STOCK_DORMER,data,options);
  }

}

export class payForm
{
  payUSD:number;
  payMXN:number;
  constructor(payUSD:number,payMXN:number){
    this.payUSD = payUSD;
    this.payMXN = payMXN;
  }
}