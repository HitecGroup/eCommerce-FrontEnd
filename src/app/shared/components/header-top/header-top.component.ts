import { Component, OnInit, Input, OnDestroy, Renderer2, ViewEncapsulation } from '@angular/core';
import { NavigationService } from "../../../shared/services/navigation.service";
import { Observable, Subscription } from 'rxjs';
import { ThemeService } from '../../../shared/services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { LayoutService } from '../../services/layout.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ShopSearchParams } from 'app/views/shop/shop-search-params';
import { IUser, IUserCredentials, StorageService } from 'app/shared/services/storage.service';
import { ServiceService } from 'app/shared/services/service.service';
import { map, startWith } from 'rxjs/operators';
import { ShopCategories } from 'app/views/shop/shop-categories';
import { ShopService } from 'app/views/shop/shop.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';

@Component({
  selector: 'app-header-top',
  templateUrl: './header-top.component.html',
  styleUrls: ['./header-top.css'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderTopComponent implements OnInit, OnDestroy {

  categorieSelect = new FormControl('');
  public userInfo:IUser;
  public categorie:string;
  public categorieId:string;
  public categories:any[] = [{value: 1, description: "Categoria 1"}];
  public address:string;
  public IsLogged:boolean;
  public badgeContent:number;
  public trademarks:any[] = [{value: 1, description: "Marca 1"}];
  layoutConf: any;
  menuItems:any;
  menuItemSub: Subscription;
  egretThemes: any[] = [];
  currentLang = 'en';
  availableLangs = [{
    name: 'English',
    code: 'en',
  }, {
    name: 'Spanish',
    code: 'es',
  }];
  public userName:string = '';
  public userNick:string = "SN";
  @Input() notificPanel;

  constructor(
    private layout: LayoutService,
    private navService: NavigationService,
    public themeService: ThemeService,
    public translate: TranslateService,
    private renderer: Renderer2,
    public jwtAuth: JwtAuthService,
    private router:Router,
    private shopSearchParams:ShopSearchParams,
    private storage: StorageService,
    private service: ServiceService,
    private shopCategories:ShopCategories,
    private shopService:ShopService,
    private loader: AppLoaderService,
    private route: ActivatedRoute,
  ) { }

  public static itemCount:number = 0;
  public static profileImageUrl:string="";
  desktop:boolean = false;
  displayMobileSearch:boolean = false;
  ngOnInit() {
    if(this.route.snapshot.queryParamMap.has("Search")){
      this.autocompleteInput.setValue(this.route.snapshot.queryParamMap.get("Search"));
    }
    this.getAvatar();
    if(window.screen.width >= 960) this.desktop = true;
    this.userInfo = this.storage.getUserInfo();
    this.layoutConf = this.layout.layoutConf;
    this.egretThemes = this.themeService.egretThemes;
    this.menuItemSub = this.navService.menuItems$
    .subscribe(res => {
      res = res.filter(item => item.type !== 'icon' && item.type !== 'separator');
      let limit = 4
      let mainItems:any[] = res.slice(0, limit)
      if(res.length <= limit) {
        return this.menuItems = mainItems
      }
      let subItems:any[] = res.slice(limit, res.length - 1)
      mainItems.push({
        name: 'More',
        type: 'dropDown',
        tooltip: 'More',
        icon: 'more_horiz',
        sub: subItems
      })
      this.menuItems = mainItems
    });
    if (this.userInfo){
      this.IsLogged = true;
      this.userName = this.userInfo.name == null ? 'Sin Nombre' : `${this.userInfo.name} ${this.userInfo.lastName}`;
      this.userNick = this.userInfo.name == null ? 'SN' : this.userInfo.lastName == null ? 
                      this.userInfo.name.charAt(0) : `${this.userInfo.name.charAt(0)}${this.userInfo.lastName.charAt(0)}`;
      if(this.userInfo.hasOwnProperty('accountAddresses')){
        this.address  = this.userInfo.accountAddresses.length > 0 ? 
                        this.truncate(this.userInfo.accountAddresses[0].address + ' ' + this.userInfo.accountAddresses[0].postalCode, 25) : 'Haz click para añadir una dirección';
      }else{
        this.address = 'Haz click para añadir una dirección';
      }      
      this.shopService.getBadgeCount();
    } 
    this.selectedTrademark = undefined;
    this.selectedCategory  = undefined;
    this.getAutocomplete();
  }
  ngOnDestroy() {
    this.menuItemSub.unsubscribe();
  }
  setLang() {
    this.translate.use(this.currentLang)
  }
  changeTheme(theme) {
    this.layout.publishLayoutChange({matTheme: theme.name})
  }
  toggleNotific() {
    this.notificPanel.toggle();
  }
  toggleSidenav() {
    if(this.layoutConf.sidebarStyle === 'closed') {
      return this.layout.publishLayoutChange({
        sidebarStyle: 'full'
      })
    }
    this.layout.publishLayoutChange({
      sidebarStyle: 'closed'
    })
  }

  goToProfile(){
    this.service.goTo('/sessions/profile');
  }

  logout(){
    this.service.logout();
    this.IsLogged = false;
  }

  async search(event: any){
    let searchValue:string = event.target.value;
    this.shopSearchParams.setSearchParams({ searchValue: searchValue.split(' ').join('%') });
    this.router.navigate(['/shop/products']);
  }

  public filteredAutocomplete: Observable<any[]>;
  autocomplete:IAutocomplete[] = [];
  public autocompleteInput = new FormControl();
  selectedTrademark:IAutocomplete = undefined;
  selectedCategory:IAutocomplete = undefined;
  getAutocomplete():void {
    this.service.getAutocomplete().subscribe(
      (response:any) => {
        try {
          if (response.success) {
            this.autocomplete = [];
            this.categories = [];
            this.trademarks = [];
            this.autocomplete = response.data;
            this.filteredAutocomplete = this.getFilteredInput('relatedWords',this.autocompleteInput,this.autocomplete);
            this.autocomplete.forEach(
              (a:any) => {
                if (a.isCategory == 1) {
                  this.categories.push(a);
                } else {
                  this.trademarks.push(a);
                }
              }
            );
            this.categories = this.service.sortByName(this.categories.filter((c)=>c.sub1 == 0 && c.sub2 == 0));
            this.trademarks = this.service.sortByName(this.trademarks);
          } 
        } catch (error) {
          this.service.openDialog(`Ocurrió un error al definir autocompletados: ${error.message}, verifique con el área de soporte`);
        }
      },
      (http: HttpErrorResponse) => {
        this.service.processHttpResponse(http);
      }
    );
  }
  
  /*Autocomplete */
  public verifyAutocomplete(input:any,type:string){
    switch (type){
      case 'partner':
        if (input.value == '' || input.value == undefined) {
          this.resetInputAutocomplete();
        }
        if (this.verifyInput(this.autocompleteInput,this.autocomplete)){
          this.service.openDialog('* No hay opciones disponibles.')
        }
        break;
    }
  }

  private resetAutocompleteOptions(){
    this.autocompleteInput.setValue('');
  }

  resetInputAutocomplete(){
    this.autocompleteInput.setValue('');
    this.resetAutocompleteOptions();
  }  

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '').trim();
  }

  public verifyInput(input:FormControl,entity:any){
    let error = false;
    if (entity == undefined || entity.length <= 0){
      input.reset('');
      error = true;
    }
    return error;
  }

  public getFilteredInput(type:string,input:FormControl,entity:any){
    return input.valueChanges.pipe(
      startWith(''),
      map((e:any) => typeof e === 'string' ? e : this.getFilterString(type,e)),
      map((e:any) => e ? this._filter(type,entity,e) : entity.slice())
    ); 
  }

  private getFilterString(type:string,e:any){
    switch (type) {
      case 'relatedWords':
        return e.relatedWords;
    }
  }

  public _filter(type:string,entity:any, value: string): any[] {
    const filterValue = this._normalizeValue(value);
    let filtered = entity.filter(
      (e:any) => this._normalizeValue(this.getFilterString(type,e)).includes(filterValue)
    );
    this.filteredList = filtered;
    return filtered;
  }

  filteredList:any[] = [];
  async searchByText(text:any){
    if(!this.filteredList.length){
      let data:any = {
        Type:1,
        TrademarkId:null,
        Category:null,
        Subcategory1: null,
        Subcategory2: null,
        RecordsPage: null,
        Page:null,
        Search: text.value,
        // Search: 'ceco',
      }
      this.router.navigate(['/shop/categories'],{queryParams: data});
    }
  }


  onAutocomplete(category:any){
    try {
      if (category.isCategory == 1) {
        this.router.navigate(['/shop/categories']);
        this.selectedTrademark = undefined;
        this.shopCategories.setCategory(category,"category");
      } else {
        // this.router.navigate(['/shop/trademarks']);
        this.router.navigate(['/shop/categories']);
        this.selectedCategory = undefined;
        // this.selectedTrademark = undefined;
        this.shopCategories.setCategory(category,"trademark");
      } 
    } catch (error) {
      console.log(error);
    }
  }

  resetMenuBar(){
    this.selectedTrademark = undefined;
    this.selectedCategory  = undefined;
    this.shopCategories.setCategoryNull();
    this.resetInputAutocomplete();
  }

  truncate(input, max) {
    if (input.length > max) {
       return input.substring(0, max) + '...';
    }
    return input;
 }

  get getItemCount(){
    return HeaderTopComponent.itemCount;
  }

  showNick:boolean = true;
  get getProfileImageUrl(){
    let src = HeaderTopComponent.profileImageUrl;
    if(src!==""){
      this.showNick = false;
      let profile:any = document.getElementById("header_profile");
      profile.src = src;
      profile.style.display = "block";
    }
    return HeaderTopComponent.profileImageUrl;
  }

  async getAvatar(){
    let userInfo:any = await this.storage.getUserInfo();
    if(userInfo){
      let src = userInfo.imageUrl;
      if(src){
        this.showNick = false;
        let profile:any = document.getElementById("header_profile");
        profile.src = src;
        profile.style.display = "block";
      }
    }
  }
}
export interface IAutocomplete {
  id:number;
  title:string | null;
  relatedWords:string | null;
  sub1:number | null;
  sub2:number | null;
  isCategory:number | null;
}