import { Component, ElementRef, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, FormArray, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { ServiceService } from 'app/shared/services/service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { StorageService } from 'app/shared/services/storage.service';
import { LayoutService } from 'app/shared/services/layout.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogViewImgComponent } from 'app/shared/components/dialog-view-img/dialog-view-img.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public form:FormGroup;
  public errorMessages:any;
  public invoiceAddress:boolean;
  public dataIsManual:boolean;
  public dataIsManual2:boolean;
  public settlements:any[] = [];
  public _settlements:any[] = [];
  public userName:string = "";
  public userNick:string = "";
  private infoUser:any;
  private infoUserUpdated:any;
  layoutConf:any;

  constructor(
    private service:ServiceService,
    private loader:AppLoaderService,
    private router:Router,
    private storage:StorageService,
    private layout:LayoutService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.layoutConf = this.layout.layoutConf;
    this.initForm();
    this.invoiceAddress = false;
    this.dataIsManual = true;
    this.dataIsManual2 = true;
    this.getAvatar();
  }
  ngAfterViewInit(){
   this.getUserInfo();
   this.getAvatar();
   //this.loader.close();
  }

  ngOnDestroy(): void {
    this.loader.close();
  }

  async getAvatar(){
    if(this.infoUser){
      let src = this.infoUser.imageUrl;
      if(src){
        try {
          this.profileImageUrl = src; 
          this.imgForm.controls.mainImageUrl.setValue(src);
          let profile:any = document.getElementById("profile");
          profile.src = src;
          profile.style.display = "block";
        } catch (error) {
          console.log(error);
        }
      }
    }
  }

  openFileSelector(){
    document.getElementById("fileselector").click();
  }

  profileImageUrl:string;

  file:File = null;
  myInputVariable: ElementRef;
  onChange(event) {
    if(event.target.files.length > 0 ){
      this.file = event.target.files[0];
      switch(this.file.type.indexOf("image/")){
        case -1:
          this.service.openDialog("Extención no valido, solo admite archivo de tipo imagen.").subscribe(
            () => {
              this.file = null;
              this.myInputVariable.nativeElement.value = "";
            }
          );
          break;
        default:
          if((this.file.size/1024/1024)>5){
            this.service.openDialog("Archivo pasa de los 5MB").subscribe(
              () => {
                this.file = null;
                this.myInputVariable.nativeElement.value = "";
              }
            );
            
          } else {
            // let src = URL.createObjectURL(this.file);
            // let preview:any = document.getElementById("profile_preview");
            // preview.src = src;
            // preview.style.display = "block";
            this.confirmImageDialog();
          }
          break;
      }
      
    }else{
      this.file = null;
    }
  }

  confirmImageDialog(){
    this.service.openConfirm("¿Desea subir la imagen elegida?").then(
      result => {
        if (result != null && result == true) {
          this.uploadImage();
        }
      });
  }

  public uploadImage(){
    let formData:FormData = new FormData();
    formData.append('imagen',this.file);
    let data = {formdata:formData};
    this.loader.open();
    this.service.saveProfileImage(formData).then(
      async (response:any) => {
        this.loader.close();
        if(!response.body.success) {
          this.service.openDialog(response.body.message);
          return;
        }
        this.service.openDialog(response.body.message);
        this.imgForm.controls.mainImageUrl.setValue(`${response}`);
        // Borramos preview
        // let preview:any = document.getElementById("profile_preview");
        //     preview.src = "";
        //     preview.style.display = "none";

        // Colocamos imagen actualizada
        this.profileImageUrl = response.body.urlImage;
        // let src = URL.createObjectURL(this.file);
        let src = this.profileImageUrl;
        let profile:any = document.getElementById("profile");
        profile.src = src;
        profile.style.display = "block";
        // Actualizamos imagen en header
        this.service.updateHeaderImage(response.body.urlImage);
        // Actulizamos el storage
        this.infoUser.imageUrl = response.body.urlImage;
        this.storage.setUserInfo(this.infoUser);
      }, 
      (http: HttpErrorResponse) => {
        this.loader.close();
        this.service.processHttpResponse(http);
      }
    );
  }

  openDialogViewImg() {
    this.dialog.open(DialogViewImgComponent,{
      data:{
        rutaImg:this.imgForm.value.mainImageUrl
      },autoFocus:false,
      height: '600px',
      width: '600px',
    }).afterOpened().subscribe(
      (response) => {}
    )
  }

  async setUserInfo(){
    try{
      let infoUser = this.infoUser;    
      this.userName = infoUser?.name == null ? 'Sin Nombre' : `${infoUser.name} ${infoUser.lastName}`;
      this.userNick = infoUser?.name == null ? 'SN' : infoUser.lastName == null ? 
                      infoUser.name.charAt(0) : `${infoUser.name.charAt(0)}${infoUser.lastName.charAt(0)}`;
      let accountAddresses1:any = {};
      let accountAddresses2:any = {};
      if(infoUser.accountAddresses != null && infoUser.accountAddresses.hasOwnProperty("length")){
        accountAddresses1 = infoUser.accountAddresses[0];
        accountAddresses2 = infoUser.accountAddresses[1];
      }
      this.loader.close();
      if(infoUser.accountAddresses.length>1){
        this.invoiceAddress = true;
      }else{
        this.invoiceAddress = false;
      }
      this.setInvoiceAddressControls();
  
      this.form.get('name').setValue(infoUser.name);
      this.form.get('lastName').setValue(infoUser.lastName);
      this.form.get('telephone').setValue(infoUser.telephone);
      try{
        this.setCompany(infoUser);
      }catch(e){
        console.log(e);
      }
      
      //Se coloca la primer dirección
      this.form.get('address').setValue(accountAddresses1?.address);
      this.form.get('exteriorNumber').setValue(accountAddresses1?.exteriorNumber);
      //this.form.get('interiorNumber').setValue(accountAddresses1?.interiorNumber);
      this.form.get('deliveryNote').setValue(accountAddresses1?.deliveryNote);
      this.form.get('postalCode').setValue(accountAddresses1?.postalCode);
      
      this.form.get('settlementType').setValue(accountAddresses1?.settlementType);
      this.form.get('municipality').setValue(accountAddresses1?.municipality);
      //this.form.get('state').setValue(accountAddresses1?.state);
      this.form.get('country').setValue(accountAddresses1?.country);
      this.form.get('city').setValue(accountAddresses1?.city);
  
      this.loader.close();
      let resp = await this.searchPostalCode(1);
      if(this.settlements == undefined) this.settlements = [];
      this.settlements.push(accountAddresses1?.settlement);      
      this.form.get('settlement').setValue(accountAddresses1?.settlement);    
      //Habilitando o no los campos con base a la info encontrada
      this.enableOrDisableInput('municipality', accountAddresses1?.municipality);
      this.enableOrDisableInput('settlementType', accountAddresses1?.settlementType);
      this.enableOrDisableInput('country', accountAddresses1?.country);
      //this.enableOrDisableInput('city', accountAddresses1?.city);
      //this.enableOrDisableInput('state', accountAddresses1?.state);
      //Se coloca la segunda dirección
      if(!this.invoiceAddress){
        return;
      }
      this.form.get('_address').setValue(accountAddresses2?.address);
      this.form.get('_exteriorNumber').setValue(accountAddresses2?.exteriorNumber);
      //this.form.get('_interiorNumber').setValue(accountAddresses2?.interiorNumber);
      this.form.get('_deliveryNote').setValue(accountAddresses2?.deliveryNote);
      this.form.get('_postalCode').setValue(accountAddresses2?.postalCode);
      
      this.form.get('_settlementType').setValue(accountAddresses2?.settlementType);
      this.form.get('_municipality').setValue(accountAddresses2?.municipality);
      //this.form.get('_state').setValue(accountAddresses2?.state);
      this.form.get('_country').setValue(accountAddresses2?.country);
      this.form.get('_city').setValue(accountAddresses2?.city);
      
      await this.searchPostalCode(2);
      this.loader.close();
      if(this._settlements == undefined) this._settlements = [];
      this._settlements.push(accountAddresses2?.settlement);
      //Poniendo valores al ultimo para que no se reestablezcan en la vista
      this.form.get('_settlement').setValue(accountAddresses2?.settlement);
    }catch(e){
      console.log(e);
    }
  }

  getUserInfo(){
    this.infoUser = this.storage.getUserInfo();
    setTimeout(() => {
      this.setUserInfo();
    }, 0);
  }

  submit(){
    //Obtiene la info actualizada del usuario
    let infoUser = this.infoUser;
    //Construyendo el JSON a enviar:
    let user:any = {
      id: infoUser.idUser,
      name: String(this.form.get('name').value).toUpperCase(),
      rfc: String(infoUser.rfc).toUpperCase(),
      taxRegimeId: String(infoUser.taxRegimeId),
      email: infoUser.email,
      lastName: String(this.form.get('lastName').value).toUpperCase(),
      //company: (infoUser.company == null)?'company1':infoUser.company,
      company: String(this.form.get('company').value).toUpperCase(),
      prefixTelephone: infoUser.prefixTelephone,
      telephone: this.form.get('telephone').value,
      birthdate: (infoUser.birthdate == null)?'1988-08-24':infoUser.birthdate,
      genderId: (infoUser.genderId == null)?1:infoUser.genderId,
      accountAddresses: []
    };
    //Direccion del Form 1
    let dir1 = {
      id:0,
      bill:0,
      postalCode: String(this.form.get('postalCode').value).toUpperCase(),
      settlement: String(this.form.get('settlement').value).toUpperCase(),
      settlementType: String(this.form.get('settlementType').value).toUpperCase(),
      municipality: String(this.form.get('municipality').value).toUpperCase(),
      state: String(this.form.get('state').value).toUpperCase(),
      city: String(this.form.get('city').value).toUpperCase(),
      country: String(this.form.get('country').value).toUpperCase(),
      address: String(this.form.get('address').value).toUpperCase(),
      exteriorNumber: String(this.form.get('exteriorNumber').value).toUpperCase(),
      //interiorNumber: String(this.form.get('interiorNumber').value).toUpperCase(),
      deliveryNote: ''
    }
    //Direccion del Form 2
    let dir2:any;
    if (this.invoiceAddress == false) { //Si la dirección de envío es la misma que facturación
      dir2 = JSON.parse(JSON.stringify(dir1));
    } else { //Sino se obtienen los datos de la dirección de facturación del form2
      dir2 = {
        id:0,
        bill:1,
        postalCode: String(this.form.get('_postalCode').value).toUpperCase(),
        settlement: String(this.form.get('_settlement').value).toUpperCase(),
        settlementType: String(this.form.get('_settlementType').value).toUpperCase(),
        municipality: String(this.form.get('_municipality').value).toUpperCase(),
        state: String(this.form.get('_state').value).toUpperCase(),
        city: String(this.form.get('_city').value).toUpperCase(),
        country: String(this.form.get('_country').value).toUpperCase(),
        address: String(this.form.get('_address').value).toUpperCase(),
        exteriorNumber: String(this.form.get('_exteriorNumber').value).toUpperCase(),
        //interiorNumber: String(this.form.get('_interiorNumber').value).toUpperCase(),
        deliveryNote: ''
      }
    }

    //Verificamos el estatus/active del usuario
    let active = infoUser.active;
    switch(active){
      case 1:// Si el active es "1" tomar los datos del usuario y actualizar "api/Users/Update/:id"
        dir1.id = infoUser.accountAddresses[0]?.id || 0;
        user.accountAddresses.push(dir1);
        //
        if (infoUser.accountAddresses[1] != undefined) {
          dir2.id = infoUser.accountAddresses[1].id;
        } else {
          dir2.id = 0;
        }
        dir2.bill = 1;
        if(this.invoiceAddress) user.accountAddresses.push(dir2);
        this.userUpdate(user);
        break;
      case 2:// Si el active es "2" se crean nuevas direcciones "api/Users/RegisterAddress/:id"
        //Insertar Direcciones
        user.accountAddresses.push(dir1);
        dir2.bill = 1;
        if(this.invoiceAddress) user.accountAddresses.push(dir2);
        this.userRegisterAddress(user);
        break;
    }
  }

  userUpdate(user){
    this.infoUserUpdated = user;
    this.loader.open();
    this.service.userUpdate(user).subscribe(
      (data:any) => {
        this.loader.close();
        this.actualizarDireccionSession();
        this.service.openDialog('Información actualizada satisfactoriamente.').subscribe(
          () =>{ 
            this.form.reset('');
            this.service.goTo('/shop');
          }
        );        
      },
      (http: HttpErrorResponse) => {
        // console.log('Request failure');
        console.log(http);
        this.loader.close();

        let errorIndicator: string;
        errorIndicator = 'Error en el Servicio ';

        if(http.error != undefined)
          errorIndicator += JSON.stringify(http.error);

        if(http.error.responseSAP != undefined && http.error.responseSAP != null 
          && http.error.responseSAP.customerBundleMaintainConfirmation_sync_V1 != undefined 
          && http.error.responseSAP.customerBundleMaintainConfirmation_sync_V1 != null){

          let responseSAP = http.error.responseSAP.customerBundleMaintainConfirmation_sync_V1.log.item[0];

          this.service.openDialog("Error en el Servicio: " + http.error.message + ', typeID: ' + responseSAP.typeID + ', note: ' + responseSAP.note);
        }
        else
        {
          this.service.openDialog(errorIndicator);
        }
      }
    );
  }

  userRegisterAddress(user){
    this.infoUserUpdated = user;
    this.loader.open();
    this.service.userRegisterAddress(user).subscribe(
      (data:any) => {
        this.actualizarDireccionSession();
        this.loader.close();
        this.service.openDialog('Información actualizada satisfactoriamente.');
        this.form.reset('');
        this.service.goTo('/shop');
      },
      (http: HttpErrorResponse) => {
        console.log(http);
        this.loader.close();
        if(http.error.responseSAP.customerBundleMaintainConfirmation_sync_V1 != null){
          let responseSAP = http.error.responseSAP.customerBundleMaintainConfirmation_sync_V1.log.item[0];
          this.service.openDialog("Error en el Servicio: "+http.error.message+', typeID: '+responseSAP.typeID+', note: '+responseSAP.note);
        }else{
          this.service.openDialog("Error en el Servicio de SAP");
        }

      }
    );
  }

  actualizarDireccionSession(){
    try{
      let addressUpdated = [];
      let infoUserSession:any = this.storage.getUserInfo();
      infoUserSession.name = this.infoUserUpdated.name;
      infoUserSession.lastName = this.infoUserUpdated.lastName;
      infoUserSession.company = this.infoUserUpdated.company;
      infoUserSession.telephone = this.infoUserUpdated.telephone;
      if(infoUserSession.accountAddresses.length==2 && this.infoUserUpdated.accountAddresses.length>0){
        addressUpdated.push(Object.assign(infoUserSession.accountAddresses[0],this.infoUserUpdated.accountAddresses[0]));
        if(this.infoUserUpdated.accountAddresses.length==2){
          addressUpdated.push(Object.assign(infoUserSession.accountAddresses[1],this.infoUserUpdated.accountAddresses[1]));
        }
      }else if(infoUserSession.accountAddresses.length==1 && this.infoUserUpdated.accountAddresses.length>0){
        addressUpdated.push(Object.assign(infoUserSession.accountAddresses[0],this.infoUserUpdated.accountAddresses[0]));
        if(this.infoUserUpdated.accountAddresses.length==2){
          addressUpdated.push(this.infoUserUpdated.accountAddresses[1]);
        }
      }else{
        addressUpdated = this.infoUserUpdated.accountAddresses;
      }
      infoUserSession.accountAddresses = addressUpdated;
      infoUserSession.active = 1;

      this.storage.clearUserInfo(true);
      this.storage.setUserInfo(infoUserSession);
    } catch(e){
      console.log('err', e);
    }    
  }

  async searchPostalCode(type:number){
    let postalCode = (type == 1)?this.form.get("postalCode"):this.form.get("_postalCode");
    if (postalCode?.valid) {
      //Buscar código postal
      this.loader.open();
      await this.service.getAddressSPM(postalCode.value).toPromise().then
        ((data:any) => {
          if(data.success){
            this.loader.close();
            this.setPostalCodeInfo(data,type);
            if(type==1){
              this.dataIsManual = false;
              if(this.infoUser.accountAddresses.length && this.infoUser.accountAddresses[0] && this.infoUser.accountAddresses[0].postalCode == postalCode.value){
                this.form.get('city').setValue(this.infoUser.accountAddresses[0].city);
              }
            }else if(type==2){
              this.dataIsManual2 = false;
              if(type==2 && this.infoUser.accountAddresses.length && this.infoUser.accountAddresses[1] && this.infoUser.accountAddresses[1].postalCode == postalCode.value){
                this.form.get('_city').setValue(this.infoUser.accountAddresses[1].city);
              }
            }
          }else{
            this.resetPostalCodeInfo(type);
            if(type==1){
              this.dataIsManual = true;
              if(this.infoUser.accountAddresses.length && this.infoUser.accountAddresses[0] && this.infoUser.accountAddresses[0].postalCode == postalCode.value) this.setPostalCodeInfo(this.infoUser.accountAddresses[0],type);
              this.enableOrDisableInput('municipality','');
              this.enableOrDisableInput('settlement','');
              this.enableOrDisableInput('settlementType','');
              //this.enableOrDisableInput('state','');
              this.form.get('country').setValue(data.country);
              this.form.get('country').disable({ onlySelf: true, emitEvent: true });
              this.service.openDialog('No se encontro codigo postal, ingrese datos manualmente');
            }else if(type==2){
              this.dataIsManual2 = true;
              if(this.infoUser.accountAddresses.length && this.infoUser.accountAddresses[1] && this.infoUser.accountAddresses[1].postalCode == postalCode.value) this.setPostalCodeInfo(this.infoUser.accountAddresses[1],type);
              this.enableOrDisableInput('_municipality','');
              this.enableOrDisableInput('_settlement','');
              this.enableOrDisableInput('_settlementType','');
              //this.enableOrDisableInput('_state','');
              this.form.get('_country').setValue(data.country);
              this.form.get('_country').disable({ onlySelf: true, emitEvent: true });
            }
          }
        }).catch(
        (http: HttpErrorResponse) => {
          this.loader.close();
          this.resetPostalCodeInfo(type);
          this.service.openDialog('Error en al consultar datos');
        }
      );
    }
    this.loader.close();
    return true;
  }

  setPostalCodeInfo(data:any,type:number){    
    let settlementsUpper = data.settlements?.map((s:string)=>String(s).toUpperCase());
    switch (type){
      case 1:
        this.form.get('municipality').setValue(data.municipality);
        this.enableOrDisableInput('municipality', data.municipality);
        this.form.get('settlementType').setValue(data.settlementType);
        this.enableOrDisableInput('settlementType', data.settlementType);
        this.form.get('country').setValue(data.country);
        this.enableOrDisableInput('country',data.country);
        if(this.form.get('settlement').value ) this.form.get('settlement').setValue('');
        let city = data.city;
        this.form.get('city').setValue(city);
        if (city == ''){
          this.form.get('city').markAsTouched();
        }else{
          this.enableOrDisableInput('city', data.city);
        }
        //this.form.get('state').setValue(data.state);
        this.setValueState('state',data.state);
        //this.enableOrDisableInput('state', data.state);
        this.settlements = settlementsUpper;
        break;
      case 2:
        this.form.get('_municipality').setValue(data.municipality);
        this.enableOrDisableInput('_municipality', data.municipality);
        this.form.get('_settlementType').setValue(data.settlementType);
        this.enableOrDisableInput('_settlementType', data.settlementType);
        this.form.get('_country').setValue(data.country);
        this.enableOrDisableInput('_country',data.country);
        let _city = data.city;
        this.form.get('_city').setValue(_city);
        if (_city == '') this.form.get('_city').markAsTouched();
        //this.form.get('_state').setValue(data.state);
        this.setValueState('_state',data.state);
        //this.enableOrDisableInput('_state', data.state);
        this._settlements = settlementsUpper;
        break;
    }
  }

  enableOrDisableInput(nameInput:any, data: any){
    if(data) {
     this.form.get(nameInput).disable();
    } else {
      this.form.get(nameInput).enable();
     }

  }

  setValueState(nameInput: any, data: any ){
    for (let index = 0; index < this.arrayDataEstados.length; index++) {
      const element = this.arrayDataEstados[index];
      if (String(element.descripcion).toUpperCase() == String(data).toUpperCase() || String(element.clave).toUpperCase() == String(data).toUpperCase() ) {
        this.form.get(nameInput).setValue(element.clave);
      }      
    }
  }

  resetPostalCodeInfo(type:number){
    switch (type) {
      case 1:
        this.form.get('municipality').reset('');
        this.form.get('settlement').setValue('');
        this.form.get('settlement').setValidators([Validators.required]);
        this.form.get('settlement').updateValueAndValidity();
        this.form.get('settlementType').reset('');
        this.form.get('country').reset('');
        this.form.get('city').reset('');
        this.form.get('state').reset('');
        this.settlements = [];
        break;
      case 2:
        this.form.get('_municipality').reset('');
        this.form.get('_settlement').setValue('');
        this.form.get('_settlement').setValidators([Validators.required]);
        this.form.get('_settlement').updateValueAndValidity();
        this.form.get('_settlementType').reset('');
        this.form.get('_country').reset('');
        this.form.get('_city').reset('');
        this.form.get('_state').reset('');
        this._settlements = [];
        break;
    }
    
  }

  imgForm:FormGroup;
  private initForm(){
    this.imgForm = new FormGroup({
      mainImageUrl: new FormControl('', [
        Validators.required,
      ]),
    });
    this.form = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.maxLength(40)
      ]),
      lastName: new FormControl('', [
        Validators.required,
        Validators.maxLength(40)
      ]),
      telephone: new FormControl('', [
        Validators.required,
        Validators.maxLength(40),
        Validators.pattern('[0-9]*$'), 
      ]),
      company: new FormControl('', [
        Validators.required,
        Validators.maxLength(80)
      ]),
      settlement: new FormControl('', [
        Validators.required,
        Validators.maxLength(40)
      ]),
      settlementType: new FormControl('', [
        Validators.required,
      ]),
      address: new FormControl('', [
        Validators.required,
        Validators.maxLength(60)
      ]),
      exteriorNumber: new FormControl('', [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern('[0-9]*$'), 
      ]),
      /*
      interiorNumber: new FormControl('', [
        Validators.required,
        Validators.maxLength(4),
      ]), */
      postalCode: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(5),
        Validators.pattern('[0-9]*$'), 
      ]),
      municipality: new FormControl('', [
        Validators.required,
        Validators.maxLength(40),
      ]),
      city: new FormControl('', [
        Validators.required,
        Validators.maxLength(40)
      ]),
      state: new FormControl('', [
        Validators.required,
        Validators.maxLength(40),
      ]),
      country: new FormControl('', [
        Validators.required,
        Validators.maxLength(40),
      ]),
      deliveryNote: new FormControl('', []),

      direcciones: new FormArray([])
    });
    //
    this.errorMessages = {
      name: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* No más de 40 caracteres.' },
      ],
      lastName: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* No más de 40 caracteres.' },
      ],
      telephone: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* No más de 40 dígitos.' },
        { type: 'pattern',   message: '* Sólo números.' }
      ],
      company: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* No más de 80 caracteres.' },
      ],
      postalCode: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* No más de 5 Dígitos.' },
        { type: 'minlength', message: '* Deben ser 5 Dígitos.' },
        { type: 'pattern',   message: '* Sólo números.' }
      ],
      municipality: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* No más de 40 caracteres.' },
      ],
      city: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* No más de 40 caracteres.' },
      ],
      state: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* No más de 40 caracteres.' },
      ],
      country: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* No más de 40 caracteres.' },
      ],
      address: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* No más de 60 caracteres.' },
      ],
      exteriorNumber: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* No más de 10 caracteres.' },
        { type: 'pattern',   message: '* Sólo números sin espacios.' }
      ],
      /*
      interiorNumber: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* No más de 4 caracteres.' },
      ],*/
      settlement: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* No más de 40 caracteres.' },
      ],
      settlementType: [
        { type: 'required',  message: '* Requerido.' },
      ],
      deliveryNote: [
        //{ type: 'required',  message: '* Requerido.' },
      ],
      //Second Address
      _postalCode: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* No más de 5 Dígitos.' },
        { type: 'minlength', message: '* Deben ser 5 Dígitos.' },
        { type: 'pattern',   message: '* Sólo números.' }
      ],
      _municipality: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* No más de 40 caracteres.' },
      ],
      _city: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* No más de 40 caracteres.' },
      ],
      _state: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* No más de 40 caracteres.' },
      ],
      _country: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* No más de 40 caracteres.' },
      ],
      _address: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* No más de 60 caracteres.' },
      ],
      _exteriorNumber: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* No más de 10 caracteres.' },
        { type: 'pattern',   message: '* Sólo números sin espacios.' }
      ],
      /*
      _interiorNumber: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* No más de 4 caracteres.' },
      ], */
      _settlement: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* No más de 40 caracteres.' },
      ],
      _settlementType: [
        { type: 'required',  message: '* Requerido.' },
      ],
      _deliveryNote: [
        //{ type: 'required',  message: '* Requerido.' },
      ],
    }

    for (var i in this.form.controls) {
      this.form.controls[i].markAsTouched();
    } 
  }

  direcciones:FormArray;
  public addAddressForm(){

    const group = new FormGroup({
      settlement: new FormControl('', [
        Validators.required,
      ]),
      settlementType: new FormControl('', [
        Validators.required,
      ]),
      address: new FormControl('', [
        Validators.required,
        Validators.maxLength(60)
      ]),
      exteriorNumber: new FormControl('', [
        Validators.required,
        Validators.maxLength(10),
      ]),
      postalCode: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(5),
        Validators.pattern('[0-9]*$'), 
      ]),
      municipality: new FormControl('', [
        Validators.required,
      ]),
      city: new FormControl('', [
        Validators.required,
        Validators.maxLength(40)
      ]),
      state: new FormControl('', [
        Validators.required,
      ]),
      country: new FormControl('', [
        Validators.required,
      ])
    })

    //Se agregan N veces de validaciones para las direcciones
    this.direcciones =  this.form.get('direcciones') as FormArray;
    this.direcciones.push(group);
    this.form.controls['direcciones'] = this.direcciones;
  }

  public setCompanyByNameLastName(){
    if(this.infoUser && this.infoUser?.taxRegimeId==1){
      let nameCompany = `${this.form.get('name').value || ''} ${this.form.get('lastName').value || ''}`;
      this.form.get('company').setValue(nameCompany);
      this.enableOrDisableInput('company',nameCompany);
    }
  }

  private setCompany(infoUser:any){
    if (infoUser?.taxRegimeId == 1) {
      let company = `${this.form.get('name').value || ''} ${this.form.get('lastName').value || ''}`;
      this.form.get('company').setValue(company);
      if (company != '' && company != undefined)
        this.enableOrDisableInput('company',company);
    } else {
      let company = infoUser?.company;
      if (company != '' && company != undefined) {
        this.form.get('company').setValue(company);
      }
    }
  }

  public changeName(){
    this.setCompanyByNameLastName();
  }

  public get name(){
    // this.setCompanyByNameLastName();
    return this.form.get('name');
  }

  public get lastName(){
    // this.setCompanyByNameLastName();
    return this.form.get('lastName');
  }

  public get telephone(){
    return this.form.get('telephone');
  }

  public get company(){
    return this.form.get('company');
  }

  public get settlement(){
    return this.form.get('settlement');
  }

  public get settlementType(){
    return this.form.get('settlementType');
  }

  public get address(){
    return this.form.get('address');
  }

  public get exteriorNumber(){
    return this.form.get('exteriorNumber');
  }
  /*
  public get interiorNumber(){
    return this.form.get('interiorNumber');
  }
  */

  public get postalCode(){
    return this.form.get('postalCode');
  }

  public get municipality(){
    return this.form.get('municipality');
  }

  public get city(){
    return this.form.get('city');
  }

  public get state(){
    return this.form.get('state');
  }

  public get country(){
    return this.form.get('country');
  }

  public get deliveryNote(){
    return this.form.get('deliveryNote');
  }

  public setInvoiceAddressControls(){
    if (this.invoiceAddress == true) {
      this.form.setControl('_settlement', 
        new FormControl('', [
          Validators.required, 
        ])
      );
      this.form.setControl('_settlementType', 
        new FormControl('', [
          Validators.required, 
        ])
      );
      this.form.setControl('_address', 
        new FormControl('', [
          Validators.required, 
        ])
      );
      this.form.setControl('_exteriorNumber', 
        new FormControl('', [
          Validators.required,
          Validators.maxLength(10),
          Validators.pattern('[0-9]*$'), 
        ])
      );
      /*
      this.form.setControl('_interiorNumber', 
        new FormControl('', [
          Validators.required,
          Validators.maxLength(4),
        ])
      ); */
      this.form.setControl('_postalCode', 
        new FormControl('', [
          Validators.required, 
          Validators.minLength(5),
          Validators.maxLength(5),
          Validators.pattern('[0-9]*$'), 
        ])
      );
      this.form.setControl('_municipality', 
        new FormControl('', [
          Validators.required, 
        ])
      );
      this.form.setControl('_city', 
        new FormControl('', [
          Validators.required, 
        ])
      );
      this.form.setControl('_state', 
        new FormControl('', [
          Validators.required, 
        ])
      );
      this.form.setControl('_country', 
        new FormControl('', [
          Validators.required, 
        ])
      );
      this.form.setControl('_deliveryNote', 
        new FormControl('', [])
      );
    } else {
      this.deleteInvoiceAddressControls();
    }
  }

  private deleteInvoiceAddressControls(){
    this.form.removeControl("_postalCode");
    this.form.removeControl("_settlement");
    this.form.removeControl("_settlementType");
    this.form.removeControl("_address");
    this.form.removeControl("_exteriorNumber");
    //this.form.removeControl("_interiorNumber");
    this.form.removeControl("_municipality");
    this.form.removeControl("_city");
    this.form.removeControl("_state");
    this.form.removeControl("_country");
    this.form.removeControl("_deliveryNote");
  }

  public get _settlement(){
    return this.form.get('_settlement');
  }

  public get _settlementType(){
    return this.form.get('_settlementType');
  }

  public get _address(){
    return this.form.get('_address');
  }

  public get _exteriorNumber(){
    return this.form.get('_exteriorNumber');
  }

  /*
  public get _interiorNumber(){
    return this.form.get('interiorNumber');
  }
  */

  public get _postalCode(){
    return this.form.get('_postalCode');
  }

  public get _municipality(){
    return this.form.get('_municipality');
  }

  public get _city(){
    return this.form.get('_city');
  }

  public get _state(){
    return this.form.get('_state');
  }

  public get _country(){
    return this.form.get('_country');
  }

  public get _deliveryNote(){
    return this.form.get('_deliveryNote');
  }

  public arrayDataEstados:Array<any> = [
    {
      clave: "AGS" , descripcion: "Aguascalientes"
    },
    {
      clave: "BC", descripcion: "Baja California"
    },
    {
      clave: "BCS" , descripcion: "Baja California Sur"
    },
    {
      clave: "CMP" , descripcion: "Campeche"
    },
    {
      clave: "CHS" , descripcion: "Chiapas"
    },   
    {
      clave: "CHI" , descripcion: "Chihuahua"
    },     
    {
      clave: "CMX" , descripcion: "Ciudad de México"
    },
    {
      clave: "COA" , descripcion: "Coahuila de Zaragoza"
    },
    {
      clave: "COL" , descripcion: "Colima"
    },
    {
      clave: "DF" , descripcion: "DF"
    },
    {
      clave: "DGO" , descripcion: "Durango"
    },
    {
      clave: "GRO" , descripcion: "Guerrero"
    },
    {
      clave: "GTO" , descripcion: "Guanajuato"
    },
    {
      clave: "HGO" , descripcion: "Hidalgo"
    },
    {
      clave: "JAL" , descripcion: "Jalisco"
    },
    {
      clave: "MCH" , descripcion: "Michoacán de Ocampo"
    },
    {
      clave: "MEX" , descripcion: "México"
    },
    {
      clave: "MOR" , descripcion: "Morelos"
    },
    {
      clave: "NAY" , descripcion: "Nayarit"
    },
    {
      clave: "NL" , descripcion: "Nuevo León"
    },
    {
      clave: "OAX" , descripcion: "Oaxaca"
    },
    {
      clave: "PUE" , descripcion: "Puebla"
    },
    {
      clave: "QR" , descripcion: "Quintana Roo"
    },
    {
      clave: "QRO" , descripcion: "Querétaro"
    },
    {
      clave: "SIN" , descripcion: "Sinaloa"
    },
    {
      clave: "SLP" , descripcion: "San Luis Potosí"
    },
    {
      clave: "SON" , descripcion: "Sonora"
    },
    {
      clave: "TAB" , descripcion: "Tabasco"
    },
    {
      clave: "TLX" , descripcion: "Tlaxcala"
    },
    {
      clave: "TMS" , descripcion: "Tamaulipas"
    },
    {
      clave: "VER" , descripcion: "Veracruz de Ignacio de la Llave"
    },
    {
      clave: "YUC" , descripcion: "Yucatán"
    },
    {
      clave: "ZAC" , descripcion: "Zacatecas"
    },

  ];
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control?.invalid && control?.parent?.dirty);
    const invalidParent = !!(control?.parent?.invalid && control?.parent?.dirty);

    return invalidCtrl || invalidParent;
  }
}