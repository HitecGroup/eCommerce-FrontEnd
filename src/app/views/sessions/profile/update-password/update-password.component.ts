import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ServiceService } from 'app/shared/services/service.service';
import { StorageService } from 'app/shared/services/storage.service';
import { LayoutService } from 'app/shared/services/layout.service';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss']
})
export class UpdatePasswordComponent implements OnInit {

  infoUser:any;
  updateForm: FormGroup;
  errorMessages:any;
  showPass:boolean = false;
  showNewPass:boolean = false;
  showConfPass:boolean = false;
  userName:string = "";
  userNick:string = "";
  layoutConf:any;

  constructor(
    private service:ServiceService,
    private loader: AppLoaderService,
    private storage: StorageService,
    private layout:LayoutService
  ) { this.initForm();}

  ngOnInit(): void {
    this.layoutConf = this.layout.layoutConf;
    this.getAvatar();
  }

  ngAfterViewInit() {
    this.getAvatar();
  }

  profileImageUrl:string;
  async getAvatar(){
    if(this.infoUser){
      let src = this.infoUser.imageUrl;
      if(src){
        this.profileImageUrl = src; 
        let profile:any = document.getElementById("profile_2");
        profile.src = src;
        profile.style.display = "block";
      }
    }
  }

  private initForm(){
    this.infoUser = this.storage.getUserInfo();
    
    this.userName = this.infoUser.name == null ? 'Sin Nombre' : `${this.infoUser.name} ${this.infoUser.lastName}`;
    this.userNick = this.infoUser.name == null ? 'SN' : this.infoUser.lastName == null ? 
                    this.infoUser.name.charAt(0) : `${this.infoUser.name.charAt(0)}${this.infoUser.lastName.charAt(0)}`;

    this.updateForm = new FormGroup({
      password: new FormControl('', [
        Validators.required,
        Validators.maxLength(40)
      ]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(40),
        Validators.pattern('^[0-9a-zA-Z-#.]*$'),
      ]),
      confirmPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(39),
        Validators.pattern('^[0-9a-zA-Z-#.]*$'),
      ]),
      
    });
    //
    this.errorMessages = {
      password: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'maxlength', message: '* Máximo 40 caracteres.' },
      ],
      newPassword: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'minlength', message: '* Al menos 8 caracteres.' },
        { type: 'maxlength', message: '* Máximo 40 caracteres.' },
        { type: 'pattern',   message: '* Inicia con 1 Letra mayúscula, después cualquier letra/número y sin espacios.' },
      ],
      confirmPassword: [
        { type: 'required',  message: '* Requerido.' },
        { type: 'minlength', message: '* Al menos 8 caracteres.' },
        { type: 'maxlength', message: '* Máximo 40 caracteres.' },
        { type: 'pattern',   message: '* Inicia con 1 Letra mayúscula, después cualquier letra/número y sin espacios.' },
      ]
    }
  }

  passwordValid:boolean = true;
  passwordValidMessage:string = "";
  passwordFormat:boolean = true;
  passwordValidation(){
    let password:AbstractControl = this.updateForm.controls.newPassword;
    this.passwordFormat = ( (password.value.toString().indexOf('.') !== -1) && (password.value.toString().length > 0))? true:false;
    password.markAsTouched();
    let passwordConfirm:AbstractControl = this.updateForm.controls.confirmPassword;
    passwordConfirm.markAsTouched();
    if (password.value === passwordConfirm.value) {
      this.passwordValid = true;
      this.passwordValidMessage = "";
    } else {
      this.passwordValid = false;
      this.passwordValidMessage = "* La contraseña no coincide";
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }


  public updatePassword() {
    let dataForm = this.updateForm.value;
    if(!this.updateForm.valid){
      this.service.openDialog('Verifique la información');
      return;
    }
    if(String(dataForm.newPassword).trim()==String(dataForm.confirmPassword).trim()){
      this.loader.open();
      this.service.changePassword({Password: dataForm.password, PaswordTemp: dataForm.newPassword}).then(
        (response:any) => {
          this.loader.close();
          if(response.body.bool1){
            this.service.openDialog(response.body.string1).subscribe(
              () =>{ 
                this.updateForm.reset();
                this.service.goTo("/sessions/confirm-update-password");
              }
            );
          }else{
            this.service.openDialog(response.body.string1);
          }
        },
        (error:HttpErrorResponse)=>{
          this.loader.close();
          this.service.processHttpResponse(error);
        }
      )
    }else{
      this.service.openDialog('Las contraseñas no coinciden');
    }
  }
}
