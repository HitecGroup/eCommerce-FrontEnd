import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { egretAnimations } from 'app/shared/animations/egret-animations';
import { Product } from 'app/shared/models/product.model';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { Observable, Subscription } from 'rxjs';
import { ShopSearchParams } from '../shop-search-params';
import { ICategory, ICategoryFilters } from '../shop.service';
import { CartItem, ShopService } from '../shop.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from 'app/shared/services/service.service';
import { ShopCategories } from '../shop-categories';
import { HttpErrorResponse } from '@angular/common/http';
import { Options } from '@angular-slider/ngx-slider';
import { LayoutService } from 'app/shared/services/layout.service';
// import { Options } from '@angular-slider/ngx-slider';
// import { Options } from "ng5-slider";

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  animations: [egretAnimations]
})
export class CategoriesComponent implements OnInit {
  public categories:any[] = [];
  public isSideNavOpen: boolean;
  public viewMode: string = 'grid-view';
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  public products$: Observable<Product[]>;
  public activeCategory:string = 'all';
  public filterForm: FormGroup;
  public cart: CartItem[];
  public cartData: any;
  public dollar: number = 0;
  public layoutConf:any;

  constructor(
    private shopService: ShopService,
    public service: ServiceService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private loader: AppLoaderService,
    private shopSearchParams:ShopSearchParams,
    private route: ActivatedRoute,
    private router: Router,
    private shopCategories:ShopCategories,
    private layout:LayoutService
  ) { }
  
  redirect:string = '/shop';
  filterType:number = 1;
  searchParamsSubscription:Subscription;
  shopCategoriesSubscription:Subscription;
  updateMenu:boolean = true;
  isCategoryOrTrademark:string="category";
  ngOnInit(): void {
    this.layoutConf = this.layout.layoutConf;
    if(this.route.snapshot.queryParamMap.has("IsCategoryOrTrademark")){
      this.isCategoryOrTrademark = this.route.snapshot.queryParamMap.get("IsCategoryOrTrademark");
    }
    if(this.route.snapshot.queryParamMap.has("FilterType")){
      this.filterType = Number(this.route.snapshot.queryParamMap.get("FilterType"));
    }
    if(this.route.snapshot.queryParamMap.has("UpdateMenu")){
      this.updateMenu = Boolean(this.route.snapshot.queryParamMap.get("UpdateMenu"));
    }
    this.route.queryParams.subscribe(
      (params:IRequestPCFilters) => {
        if(params?.RecordsPage > 0){
          this.filterType = Number(params.FilterType);
          this.isCategoryOrTrademark = params.IsCategoryOrTrademark;
          this.updateMenu = params.UpdateMenu;
          this.categoryFilters.categoryId = params?.Category || null;
          this.categoryFilters.subcategoryId1 = params?.Subcategory1;
          this.categoryFilters.subcategoryId2 = params?.Subcategory2;
          this.categoryFilters.trademarkId = params?.TrademarkId;
          this.getProductCategoriesFilters(params);
        }else if(params?.Search){
          this.filterType = 4;
          this.updateMenu = true;
          let data:IRequestPCFilters = this.initIParamsPCFilters();
          data.FilterType = this.filterType;
          data.IsCategoryOrTrademark = this.isCategoryOrTrademark;
          data.UpdateMenu = this.updateMenu;
          data.Page = 0;
          data.RecordsPage = 501;
          data.Search = params.Search;
          this.getProductsByText(data);
        }
      }
    );
    try {
      this.dollar = this.shopService.dollar;
      this.getCurrentCurrencySAPSimple();
      this.buildFilterForm(this.shopService.initialFilters);
      /**/
      this.shopCategoriesSubscription = this.shopCategories.categories$.subscribe(
        (next:ICategoryEvent) => {
          if (next) {
            switch (next.type) {
              case 1:
                if (next.categories instanceof Array) {
                  this.categories = next.categories;
                }
                break;
              case 2:
                const category:IResultCategory = next.category;
                this.updateMenu = false;
                this.filterType = 1;
                this.isCategoryOrTrademark = next.categoryTrademark;
                switch(this.isCategoryOrTrademark){
                  case "category":
                    this.categoryFilters = {
                      category:undefined,
                      subcategoryId1 : null,
                      subcategoryId2: null,
                      trademarkId   : null,
                    };
                  break;
                  case "trademark":
                    this.categoryFilters = {
                      category:undefined,
                      subcategoryId1 : null,
                      subcategoryId2: null,
                      categoryId   : null,
                    };
                  break;
                  case "searchByText":
                    this.filterType = 4;
                    this.setResultLists(next.category);
                  return;
                  default:
                    this.service.openDialog(`Tipo de categoría desconocida`);
                  break;
                }
                this.setCurrentFiltersCategory(category);
                break;
            }
          }
        },
        (error) => {
          this.service.openDialog(`Ocurrió un error al obtener las categorías: ${error.message}. Intente nuevamente o contacte con el área de soporte`).subscribe(
            () => {this.service.goTo(this.redirect)}
          );
        }
      );
    } catch(error) {
      this.service.openDialog(`Ocurrió un error al inicializar categorías: ${error.message}. Intente nuevamente o contacte con el área de soporte`).subscribe(
        () => {this.service.goTo(this.redirect)}
      );
    }
    if(this.isCategoryOrTrademark !== "searchByText"){
      if (this.resultMenu.length <= 0 && this.updateMenu) {
        this.getCategories(this.categoryFilters);
      }
    }
  }

  ngOnDestroy() {
    this.searchParamsSubscription?.unsubscribe();
    this.shopCategoriesSubscription?.unsubscribe();
    this.loader.close();
  }

  async getCurrentCurrencySAPSimple(){
    this.service.getCurrentCurrencySAPSimple().subscribe(
    (data:any)=>{
      this.dollar = data.body.decimal1 ? data.body.decimal1:this.dollar;
    },
    (error:HttpErrorResponse)=>{
      this.service.processHttpResponse(error);
    });
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

  //Limpia los niveles subsecuentes de la Categoría/Marca/Subcategoría seleccionada
  setLevel(category:any){
    let level:number = this.menuSelected.indexOf(category);
    if (level >= 0) {
      switch (level) {
        case 0:
          this.filterType = 1;
          this.categoryFilters = {
            category:undefined,
            subcategoryId1 : null,
            subcategoryId2: null,
            trademarkId   : null,
          };
          break;
        case 1:
          this.filterType = 2;
          this.categoryFilters.subcategoryId1 = null;
          this.categoryFilters.subcategoryId2 = null;
          // this.categoryFilters.trademarkId    = null;
          break;
        case 2:
          this.filterType = 3;
          this.categoryFilters.subcategoryId1 = null;
          this.categoryFilters.subcategoryId2 = null;
          break;
        case 3:
          this.filterType = 4;
          this.categoryFilters.subcategoryId2 = null;
          break;
      }
      this.setCurrentFiltersCategory(category);
    }
  }

  currentCategory:ICategory;
  setActiveCategory(category:ICategory) {
    // this.activeCategory = category.description;
    this.filterForm.controls['category'].setValue(category.title);
    this.currentCategory = category;
    this.setCurrentFiltersCategory(category);
  }

  categoryFilters:ICategoryFilters = {category:undefined};
  setCurrentFiltersCategory(categoryTrademark:any) {
    this.categoryFilters.filterType = this.filterType;
    this.categoryFilters.category = categoryTrademark;
    this.filterType++;
    if (this.filterType == 2) {
      if(this.isCategoryOrTrademark==="category"){
        this.categoryFilters.categoryId = categoryTrademark.id;
      } else if(this.isCategoryOrTrademark==="trademark"){
        this.categoryFilters.trademarkId = categoryTrademark.id;
      }
    }
    if (this.filterType == 3) {
      if(this.isCategoryOrTrademark==="category"){
        this.categoryFilters.trademarkId = categoryTrademark.id;
      } else if(this.isCategoryOrTrademark==="trademark"){
        this.categoryFilters.categoryId = categoryTrademark.id;
      }
    }
    if (this.filterType == 4) {
      this.categoryFilters.subcategoryId1 = categoryTrademark.id;
    }
    if (this.filterType == 5) {
      this.categoryFilters.subcategoryId2 = categoryTrademark.id;
    }
    this.getCategories(this.categoryFilters);
  }

  initIParamsPCFilters():IRequestPCFilters{
    return {
      Type: null,
      Category: null,
      Subcategory1: null,
      Subcategory2: null,
      TrademarkId: null,
      RecordsPage: null,
      Page: null,
      Search: null
    };
  }

  rowsNumber:number = 0;
  itemsPerPage:number = 9;
  currentPage: number;
  getCategories(cf:ICategoryFilters) {
    try {
      let data:IRequestPCFilters = this.getFilters(this.categoryFilters);
      if(!data) return;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: data
      });
    } catch (error) {
      this.service.openDialog(`Ocurrió un error al obtener las categorías. ${error.message}. Intente nuevamente o contacte con el área de soporte`).subscribe(
        () => {this.service.goTo(this.redirect);}
      );
    }
  }

/*
  getFiltersEvent(cf:IResultCategory) {
    let data:IRequestPCFilters = this.initIParamsPCFilters();
    data.Page = 0;
    data.RecordsPage = 501;
    if (
      cf.isCategory == 1 &&
      cf.id > 0 &&
      cf.sub1 > 0 &&
      cf.sub2 > 0
    ) {
      console.log('SubCategoria nivel 2');
      this.filterType = 3;
      data.Type = 0;
      data.Category = cf.id;
      data.Subcategory1 = cf.sub1;
      data.Subcategory2 = cf.sub2;
      return data;
    }

    if (
      cf.isCategory == 1 &&
      cf.id > 0 &&
      cf.sub1 > 0
    ) {
      console.log('SubCategoria nivel 1');
      this.filterType = 2;
      data.Type = 0;
      data.Category = cf.id;
      data.Subcategory1 = cf.sub1;
      return data;
    }

    if (
      cf.isCategory == 1 &&
      cf.id > 0 
    ) {
      console.log('Categoria padre');
      this.filterType = 1;
      data.Type = 0;
      data.Category = cf.id;
      return data;
    }
  }
*/

  getFilters(cf:ICategoryFilters):IRequestPCFilters {
    let data:IRequestPCFilters = this.initIParamsPCFilters();
    data.FilterType = this.filterType;
    data.IsCategoryOrTrademark = this.isCategoryOrTrademark;
    data.UpdateMenu = this.updateMenu;
    data.Page = 0;
    data.RecordsPage = 501;
    switch(this.isCategoryOrTrademark){
      case "category":
        data.Type = 0;
      break;
      case "trademark":
        data.Type = 1;
      break;
      default:
        this.service.openDialog(`Tipo de categoría desconocida`);
        break;
    }

    if (
      cf?.categoryId > 0 &&
      cf?.trademarkId > 0 &&
      cf?.subcategoryId1 > 0 &&
      cf?.subcategoryId2 > 0
    ) {
      data.TrademarkId  = this.categoryFilters.trademarkId;
      data.Category     = this.categoryFilters.categoryId;
      data.Subcategory1 = this.categoryFilters.subcategoryId1;
      data.Subcategory2 = this.categoryFilters.subcategoryId2;
      return data;
    }
    
    if (
      cf?.categoryId > 0 &&
      cf?.trademarkId > 0 &&
      cf?.subcategoryId1 > 0
    ) {
      data.Category     = this.categoryFilters.categoryId;
      data.TrademarkId  = this.categoryFilters.trademarkId;
      data.Subcategory1 = this.categoryFilters.subcategoryId1;
      return data;
    }

    if (
      cf?.categoryId > 0 &&
      cf?.trademarkId > 0
    ) {
      data.Category    = this.categoryFilters.categoryId;
      data.TrademarkId = this.categoryFilters.trademarkId;
      return data;
    }

    if (
      cf?.categoryId > 0
    ) {
      data.Category    = this.categoryFilters.categoryId;
      return data;
    }

    switch(this.isCategoryOrTrademark){
      case "category":
        if (
          cf?.categoryId > 0 
        ) {
          data.Category = this.categoryFilters.categoryId;
          return data;
        }
      break;
      case "trademark":
        if (
          cf?.trademarkId > 0 
        ) {
          data.TrademarkId = this.categoryFilters.trademarkId;
          return data;
        }
      break;
      default:
        this.service.openDialog(`Tipo de categoría desconocida`);
        break;
    }

    switch(this.isCategoryOrTrademark){
      case "category":
        if (
          this.filterType == 1
        ) {
          return data;
        }
      break;
      case "trademark":
        if (
          this.filterType == 1
        ) {
          return data;
        }
      break;
      default:
        this.service.openDialog(`Tipo de categoría desconocida`);
        break;
    }
    
  }

  toggleSideNav() {
    this.sideNav.opened = !this.sideNav.opened;
  }

  public changePage(pagina:any){
    this.currentPage = Number(pagina);
    // this.filterProducts();
  }


  resetCheckFilters(propertyId:number=null){
    if(propertyId !== null){
      this.menuProperties.forEach(p =>{
        if(p.propertyId === propertyId){
          p.checkFilters.forEach(f => {
            f.checked = false;
          });
        }
      });
    } else {
      this.menuProperties.forEach(p =>{
        p.checkFilters.forEach(f => {
          f.checked = false;
        });
      });
    }
  }

  // Este codigo funciona enlazado a los filtros slider, cuando p.lowValue o p.highValue son modificados, los eventos setMinFilterValue y setMaxFilterValue son lanzados debido al doble binding en el component.html
  // setCheckFilters(eventChecked:any,property:string,propertyId:number,first:any,last:any = null){
  //   if(eventChecked){
  //     if(!last){
  //       last = first;
  //     } 
  //     this.menuProperties.forEach(p =>{
  //       if(p.propertyId === propertyId){
  //         p.filters.forEach(f => {
  //           // Set slider values
  //           if(f.v == first){
  //             p.lowValue = f.value;
  //           }
  //           if(f.v == last){
  //             p.highValue = f.value;
  //           }
  //         });
  //         // Set all other checks in false
  //         p.checkFilters.forEach(f => {
  //           f.checked = false;
  //           if(f.id === first){
  //             f.checked = true;
  //           }
  //         });
  //       }
  //     });
  //   }
  //   console.log(this.menuProperties);
  //   // Los siguientes se mandan a llamar en automático debido al doble binding que tiene el slider
  //   // this.setMinFilterValue(f.value,propertyId); 
  //   // this.setMaxFilterValue(f.value,propertyId);
  // }

  setCheckFilters(eventChecked:any,property:string,propertyId:number,first:any,last:any = null){
    if(!last){
      last = first;
    } 
    if(eventChecked){
      this.menuProperties.forEach(p =>{
        if(p.propertyId === propertyId){
          p.filters.forEach(f => {
            // Set filters
            if(f.v == first){
              f.checked = true;
            }
            if(f.v == last){
              f.checked = true;
            }
          });
          //  Set check filters
          p.checkFilters.forEach(f => {
            if(f.id === first){
              f.checked = true;
            }
          });
        }
      });
    } else {
      this.menuProperties.forEach(p =>{
        if(p.propertyId === propertyId){
          p.filters.forEach(f => {
            // Set slider values
            if(f.v == first){
              f.checked = false;
            }
            if(f.v == last){
              f.checked = false;
            }
          });
          //  Set check filters
          p.checkFilters.forEach(f => {
            if(f.id === first){
              f.checked = false;
            }
          });
        }
      });
    }
    this.filterProducts();
  }

  // ------------------------------------------------
  // Esta seccion es de los sliders (no están en uso ahora pero evitar borrar por si se requiere a futuro)
  minValue:number = 1;
  maxValue:number = 1;
  setMinFilterValue(value:any,propertyId:number){
    this.minValue = value;
    this.selectFilters(propertyId,'min');
  }
  setMaxFilterValue(value:any,propertyId:number){
    this.maxValue = value;
    this.selectFilters(propertyId,'max');
  }

  selectFilters(propertyId:number,type:string=""){
    this.menuProperties.forEach(p => {
      if (p.propertyId === propertyId){
       
        // Ponemos a false los que quedan fuera del rango min max
        p.filters.forEach(f => {
          if(type=="min"){
            // Range
            if (f.value < this.minValue){
              f.checked = false;
            } else {
              f.checked = true;
            }
          }
          if(type=="max"){
            // Range
            if (f.value > this.maxValue){
              f.checked = false;
            } else if (f.value <= this.maxValue && f.value > this.minValue){
              f.checked = true;
            }
          }
        });
      }
    });
  }

  // Esta seccion es de los sliders (no están en uso ahora pero evitar borrar por si se requiere a futuro)
  // ------------------------------------------------

  filteredProducts:any[] = [];
  filterProducts(){
    // this.loader.open();
    this.filteredProducts = [];
    let preFiltered:any[] = [];
    //Buscamos los filtros con valores de checked en true
    let checkedFilters:any[] = [];
    this.menuProperties.forEach(f => {
      let checked = f.filters.filter(value =>{
        if(value.value > 0 && value.checked) return true;
        return false;
      })
      if(checked.length){
        let property:any = {...f};
        property.filters = checked;
        checkedFilters.push(property);
      }
    });
    // Iteramos sobre los productos. Por cada producto, iteramos sobre la lista de propiedades filtradas
    this.categories.forEach(p => {
      // Verificamos si el producto tiene propiedades (si no, details = null)
      if(p.details){
        checkedFilters.forEach(f => {
          // Revisamos si el producto p tiene en sus details la propiedad
          let match = p.details.filter(property => {
            if(property.propertyId == f.propertyId) { 
              //Iteramos sobre los valores seleccionados en los filtros para buscar coincidencia con el valor de la propiedad del producto
              let match = f.filters.filter(value => {
                if (value.checked && (String(property.value) === value.v) ){
                  return true;
                } else {
                  return false
                }
              });
              // Si el valor de propiedad coincide con alguno de los seleccionados en los filtros, devolvemos true
              if(match.length) return true;
            }
            return false;
          });
          // Si el producto tiene la propiedad y el valor de la propiedad coincide con uno de los valores seleccionados en los filtros, guardamos el producto.
          if(match.length) {
            // revisamos si el producto ya habia sido registrado previamente
            let inList:any = preFiltered.filter(fp => {
              if(fp.skuSap === p.skuSap){
                return true;
              }
              return false;
            });
            // Si no ha sido registrado aún, lo registramos
            if(!inList.length){
              preFiltered.push(p);
            }
          }
        });
      }
    });
    // Se obtiene la lista de productos que coinciden con los filtros de forma particular (uno u otro), ahora, obtenemos aquellos que coincidan entre todos ellos al mismo tiempo (uno y otro)
    this.filteredProducts = preFiltered.filter(p => {
      let fullMatch:boolean = true;
      checkedFilters.forEach(checkedP => {
        // Buscamos la propiedad en el producto
        let matchP = p.details.filter(productP => {
          if(productP.propertyId === checkedP.propertyId){
            return true;
          }
          return false;
        });
        // Comprobamos si el valor para esa propeidad es igua al a alguno de de los seleccionados en el filtrado
        let match = false;
        if(matchP.length){
          checkedP.filters.forEach(value => {
            matchP.forEach(productP => {
              if(productP.value == value.v){
                match = true;
              } 
            });
          });
        }
        fullMatch = fullMatch && match;
      });
      // Hacemos producto booleano AND, si todos son true coincide con todos los filtros y el producto es argegado, si solo 1 es false, no es agregado.
      if(fullMatch) return true;
      return false;
    });
    // Si no hay resultados mostramos de nuevo todos los productos
    if(!this.filteredProducts.length){
      this.service.openDialog('No se encontraron productos según el patrón de filtrado');
      this.resetFilters();
    }
    
    this.loader.close();
  }

  initFilters(){
    // Se quedan solo los filtros necesarios
    /* this.menuProperties = this.menuProperties.filter(item => {
      if(item.propertyId === 63) return true;
      if(item.propertyId === 48) return true;
      if(item.propertyId === 111) return true;
      if(item.propertyId === 95) return true;
      return false;
    }) */

    let maxLegendLength:number = 0;
    // Slider Filters
    this.menuProperties.forEach(p => {
      // Set slider positions
      p.lowValue = 0;
      p.highValue = 0;
      // New "filters" array for slider
      p.filters = [];
      let i:number = 0;
      if(p.isNumeric){
        p.values.sort((a,b)=>a-b);
      } else {
        if(isNaN(p.values[0])){
          p.values.sort();
        } else {
          p.values.sort((a,b)=>a-b);
        }
      }
      p.filters.push({value:0,legend:"-",checked:true}); // Null selector 
      p.values.forEach(v => {
        let legend = v; // El valor de la propiedad pasa a ser la etiqueta
        i++; // Valor genérico de 1 a n
        if(p.values.length > 3){
          legend = "";
          // Esta logica se usa para evitar sobrecarga de etiquetas
          if (i == 2) legend=v;
          if (i == Math.floor(p.values.length / 2)) legend=v;
          if (i == (p.values.length - 1)) legend=v;
        }
        p.filters.push({value:i,legend:legend,v:v,checked:false});
        if(legend.length > maxLegendLength) maxLegendLength = legend.length;
      });
      p.maxLegendLength = maxLegendLength; // To avoid overflow (apply word ellipsis)
    });
    // Check Filters
    this.menuProperties.forEach(p => {
      p.checkFilters = [];
      for(let i = 1; i < p.filters.length; i++){
        let check:any = {};
        check.id = p.filters[i].v;
        check.checked = false;

        //  First label
        check.first = p.filters[i].v;
        i = i + 1;
        // Last label
        if(i < p.filters.length){
          check.last = p.filters[i].v;
        }
        p.checkFilters.push(check);
      }
    });
  }

  resetFilters(){
    this.loader.open();
    this.filteredProducts = this.categories;
    this.resetCheckFilters();
    this.initFilters();
    this.loader.close();
  }
  /**/
  resultMenu:any[] = [];
  menuSelected:any[] = [];
  menuProperties:any = [];
  getProductCategoriesFilters(data:IRequestPCFilters){
    this.loader.open();
    this.service.getProductCategoriesFilters(data).subscribe(
      (response) => {
        try {
          let responseBody:IResponsePCFilters = response.body;
          if(!responseBody.success){
            this.service.openDialog(`${responseBody.message}`);
            return;
          }
          this.setResultLists(responseBody);
        } catch (error) {
          console.log(error);
          this.service.openDialog(`Ocurrió un error al obtener las categorías, intente nuevamente o contacte con el área de soporte2`).subscribe(
            () => {}
          );
        }
        this.loader.close();
      },
      (http: HttpErrorResponse) =>{
        this.loader.close();
        this.service.processHttpResponse(http);
      }
    );
  }

  async getProductsByText(data:any){
    this.loader.open();
      await this.service.searchByText(data).subscribe(
      (response:any) => { 
        this.loader.close();
        this.setResultLists(response.body);
      },
      (http: HttpErrorResponse) => {
        this.loader.close();
        this.service.processHttpResponse(http);
      });
  }

  setResultLists(responseBody: any){
    this.resultMenu = [];
    this.menuProperties = [];
    this.rowsNumber = 0;
    this.menuSelected = [];
    this.categories = [];
    this.filteredProducts = [];
    this.resultMenu = responseBody.menuCategories;
    this.menuProperties = responseBody.menuProperties;
    this.rowsNumber = this.categories.length;
    this.menuSelected = responseBody.menuSelected;
    
    // Define product properties filters
    if(this.menuProperties.length)this.initFilters();

    switch (this.filterType) {
      case 1:
      case 2:
      case 3: 
      case 4:
        if(responseBody.resultCategories.length){
          this.categories = responseBody.resultCategories;
        } else {
          
          this.categories = responseBody.resultProduct;  
          this.categories.forEach(p => {
            if(p.details){
              p.details.sort(function (a, b) {
                if (a.value.length > b.value.length) return 1;
                if (a.value.length < b.value.length) return -1;
                return 0;
              });
            }
          });
          this.filteredProducts = this.categories;
        }
        break;
      case 5:
        this.categories = responseBody.resultProduct;
        this.categories.forEach(p => {
          p.details.sort(function (a, b) {
            if (a.value.length > b.value.length) return 1;
            if (a.value.length < b.value.length) return -1;
            return 0;
          });
        });  
        this.filteredProducts = this.categories;  
        break;
    }
    if (!this.categories.length) {
      this.service.openDialog(`No hay resultados`).subscribe(
        () => {}
      );
    }
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

  getPropertiesByRecords(details:Array<any>,records:number=7){
    let itemsNotShow:Array<number> = [84, 118, 35, 30, 124];
    return details ? details.filter((p)=> !itemsNotShow.some(i=>i == p.propertyId)).slice(0,records) : '';
  }
}

export interface IRequestPCFilters{
  Type: number;
  Category: number;
  Subcategory1: number | null;
  Subcategory2: number | null;
  TrademarkId: number | null;
  RecordsPage: number | null;
  Page: number | null;
  Search: string | null;
  propertyFilters?: any[];
  FilterType?: number;
  IsCategoryOrTrademark?: string;
  UpdateMenu?: boolean;
};
export interface IResponsePCFilters{
  success: boolean;
  message: string;
  isProduct: boolean;
  resultProduct: any[];
  resultCategories: IResultCategory[];
  menuSelected: any[];
  menuCategories: any[];
  menuProperties: any[];
  totalRows: number;
};
export interface IResultCategory{
  id: number,
  imageUrl: string,
  title: string;
  description: string;
  relatedWords?:string;
  isCategory?:number;
  sub1?:number;
  sub2?:number;
};
export interface ICategoryEvent{
  type:number;
  category?:IResultCategory;
  categories?:IResultCategory[];
  categoryTrademark?:string;
}
