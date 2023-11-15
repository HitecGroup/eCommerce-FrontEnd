import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Validators, FormGroup, FormControl, ValidatorFn, AbstractControl, ValidationErrors, FormGroupDirective, NgForm } from '@angular/forms';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ServiceService } from 'app/shared/services/service.service';
import { IUserCredentials, StorageService } from 'app/shared/services/storage.service';
import { AuthGuard } from 'app/shared/guards/auth.guard';
import { ErrorStateMatcher } from '@angular/material/core';
import { ShopService } from 'app/views/shop/shop.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SigninComponent implements OnInit {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;
  matcher = new MyErrorStateMatcher();

  public loginForm:FormGroup;
  public errorMessages:any;
  durationInSeconds = 5;
  datos: any;
  error: HttpErrorResponse;
  showPass:boolean = false;
  showPassConfirm:boolean = false;

  constructor(
    private router: Router,
    private loader: AppLoaderService,
    private authGuard: AuthGuard,
    private service: ServiceService,
    private storage: StorageService,
    private shopService:ShopService
  ) {    
  }

  ngOnInit() {
    this.createForm();
    this.IsRememberAccount();
  }

  createForm():void {
    let regexPassword = /^\w*\S*$/;
    this.loginForm = new FormGroup({
      username: new FormControl('', [ Validators.required, Validators.email ]),
      password: new FormControl('', [ 
        Validators.required, 
        Validators.maxLength(30), 
        Validators.pattern(regexPassword)
      ]),
      confirmPassword: new FormControl('', [ 
        Validators.required, 
        Validators.maxLength(30), 
        Validators.pattern(regexPassword) 
      ]),
      rememberMe: new FormControl(false)
    }, { validators: this.checkPasswords });
    this.errorMessages = {
      username: [
        { type: 'required',  message: '* Ingrese un correo.' },
        { type: 'email',  message: '* Ingrese un correo valido.' }
      ],
      password: [
        { type: 'required',  message: '* Ingrese una contraseña.' },
        { type: 'maxlength',  message: '* Ingrese una contraseña menor a 30 caracteres.' },
        { type: 'pattern',  message: '* La contraseña no debe contener espacios en blanco.' }
      ],
      confirmPassword: [
        { type: 'required',  message: '* Ingrese una contraseña.' },
        { type: 'maxlength',  message: '* Ingrese una contraseña menor a 30 caracteres.' },
        { type: 'pattern',  message: '* La contraseña no debe contener espacios en blanco.' }
      ]
    };
  }

  checkPasswords: ValidatorFn = (group: AbstractControl):  ValidationErrors | null => { 
    let pass = group.get('password').value;
    let confirmPass = group.get('confirmPassword').value
    return pass === confirmPass ? null : { notSame: true }
  }

  signin() {
    this.loader.open();
    this.submitButton.disabled = true;
    const signinData = this.loginForm.value;
    const data = {
      email: signinData.username, 
      password: signinData.password,
    };
    this.service.login(data).subscribe(
      (response) => {
        this.loader.close();
        this.submitButton.disabled = false;
        let success:boolean = false;
        success = this.storage.clearUserInfo(true);
        success = this.storage.setUserInfo(response);
        if(signinData.rememberMe){
          success = this.storage.setUserCredentials({email:data.email,pswd:data.password,pswdConfirm:data.password});
        }
        if (!success) {
          this.service.openDialog(`No fue posible guardar la información del usuario, intente nuevamente o contacte con el área de soporte.`);
        }
        this.shopService.getBadgeCount();
        this.service.goTo('/shop');
      },
      (err: HttpErrorResponse) => {
        this.loader.close();
        this.submitButton.disabled = false;
        this.service.processHttpResponse(err);
      }
    );
  }

  IsRememberAccount(){
    let credentials:IUserCredentials = this.storage.getUserCredentials();
    if(credentials){
      this.loginForm.controls.rememberMe.setValue(true);
      this.loginForm.controls.username.setValue(credentials.email);
      this.loginForm.controls.password.setValue(credentials.pswd);
      this.loginForm.controls.confirmPassword.setValue(credentials.pswdConfirm);
    }
  }

}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control?.invalid && control?.parent?.dirty);
    const invalidParent = !!(control?.parent?.invalid && control?.parent?.dirty);

    return invalidCtrl || invalidParent;
  }
}
