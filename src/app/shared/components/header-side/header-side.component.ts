import { Component, OnInit, EventEmitter, Input, ViewChildren  , Output, Renderer2 } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { LayoutService } from '../../services/layout.service';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from '../../services/auth/jwt-auth.service';
import { EgretNotifications2Component } from '../egret-notifications2/egret-notifications2.component';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-header-side',
  templateUrl: './header-side.template.html',
  styleUrls: ['./header-side.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderSideComponent implements OnInit {
  @Input() notificPanel;
  @ViewChildren(EgretNotifications2Component) noti;
  public availableLangs = [{
    name: 'EN',
    code: 'en',
    flag: 'flag-icon-us'
  }, {
    name: 'ES',
    code: 'es',
    flag: 'flag-icon-es'
  }];
  currentLang = this.availableLangs[0];

  categorieSelect = new FormControl('');
  public infoUser:any;
  public categorie:string;
  public categorieId:string;
  public categories:any = [{value: 1, description: "Categoria 1"}];
  public address:string;
  public IsLogged:boolean;
  public badgeContent:number;
  public searchText:string="";
  public trademarks:any = [{value: 1, description: "Marca 1"}];

  public egretThemes;
  public layoutConf: any;
  constructor(
    private themeService: ThemeService,
    private layout: LayoutService,
    public translate: TranslateService,
    private renderer: Renderer2,
    public jwtAuth: JwtAuthService,
    public router: Router,
    //private authenticationService: AuthenticationService,
  ) {}
  ngOnInit() {
    //this.egretThemes = this.themeService.egretThemes;
    //this.layoutConf = this.layout.layoutConf;
    //this.translate.use(this.currentLang.code);
  }


  public logout(){
    //this.authenticationService.logout();
  }

  async search(event: any){    
    let search:any = event.target.value;
    this.searchText = search;
    this.categorie = '';
  }


}
