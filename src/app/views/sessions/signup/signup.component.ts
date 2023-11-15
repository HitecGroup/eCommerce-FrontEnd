import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Validators, FormBuilder, FormGroup, FormControl, ValidatorFn, AbstractControl, ValidationErrors, FormGroupDirective, NgForm } from '@angular/forms';
import { CustomValidators } from 'ngx-custom-validators';
import { ErrorStateMatcher } from '@angular/material/core';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { ServiceService } from 'app/shared/services/service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LayoutService } from 'app/shared/services/layout.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;

  error: HttpErrorResponse;
  signupForm: FormGroup;
  public errorMessages:any;
  showPass:boolean = false;
  showPassConfirm:boolean = false;
  matcher = new MyErrorStateMatcher();
  regimenFiscal: any[];
  layoutConf:any;

  constructor(
    private loader: AppLoaderService,
    private service: ServiceService,
    private formBuilder : FormBuilder,
    private layout:LayoutService
    ) {}

  ngOnInit() {
    this.layoutConf = this.layout.layoutConf;
    this.createForm();
    this.getRegimenFiscal();
  }

  createForm():void{
    const password = new FormControl('', Validators.required);
    const confirmPassword = new FormControl('', CustomValidators.equalTo(password));

    this.signupForm = new FormGroup({
      rfc: new FormControl('', [ Validators.required, Validators.maxLength(13) ]),
      taxRegimeId: new FormControl('', [ Validators.required ]),
      email: new FormControl('', [ Validators.required, Validators.email ]),
      password: new FormControl('', [ Validators.required, Validators.minLength(6), Validators.maxLength(50) ]), //, Validators.pattern(/^[A-Za-z\d]+$/)
      confirmPassword: new FormControl('', [ Validators.required, Validators.minLength(6), Validators.maxLength(50) ]), //, Validators.pattern(/^[A-Za-z\d]+$/)
      rememberMe: new FormControl(false)
    }, { validators: this.checkPasswords });

    this.errorMessages = {
      rfc: [
        { type: 'required',  message: '* Ingrese su RFC.' },
        { type: 'maxLength',  message: '* Ingrese una RFC no mayor a 13 caracteres.' },
      ],
      taxRegimeId: [
        { type: 'required',  message: '* Seleccione su Régimen Fiscal.' }
      ],
      email: [
        { type: 'required',  message: '* Ingrese un correo.' },
        { type: 'email',  message: '* Ingrese un correo valido.' }
      ],
      password: [
        { type: 'required',  message: '* Ingrese una contraseña.' },
        { type: 'minLength',  message: '* Ingrese una contraseña mayor a 6 caracteres.' },
        { type: 'maxLength',  message: '* Ingrese una contraseña no mayor a 50 caracteres.' },
        {type: 'pattern',  message: '* La contraseña no debe contener espacios en blanco ni caracteres especiales.' }
      ],
      confirmPassword: [
        { type: 'required',  message: '* Ingrese una contraseña.' },
        { type: 'minLength',  message: '* Ingrese una contraseña mayor a 6 caracteres.' },
        { type: 'maxLength',  message: '* Ingrese una contraseña no mayor a 50 caracteres.' },
        {type: 'pattern',  message: '* La contraseña no debe contener espacios en blanco ni caracteres especiales.' }
      ]
    };
  }

  checkPasswords: ValidatorFn = (group: AbstractControl):  ValidationErrors | null => { 
    let pass = group.get('password').value;
    let confirmPass = group.get('confirmPassword').value
    return pass === confirmPass ? null : { notSame: true }
  }

  signup() {
    const signupData = this.signupForm.value;
    let dataSignup = {...signupData};
    this.submitButton.disabled = true;
    this.loader.open();

    this.service.registre(dataSignup).subscribe(
      (data:any) => {
        this.loader.close();
          this.service.openDialog('Usuario registrado satisfactoriamente. se envio enlace de activacion al email');
          this.resetForm();
          this.signupForm.reset('');
          this.service.goTo('sessions/signin');
      },
      (err: HttpErrorResponse) => {
        this.loader.close();
        console.log(err);
        if (err.status == 400) {
          this.service.openDialog(err.error.string1);
        } else {
          this.service.processHttpResponse(err);
        }
      }
    );
  }

  getRegimenFiscal() {
    this.loader.open();
    this.service.regimenFiscal().subscribe(
      (data:any) => {
        this.loader.close();
        this.regimenFiscal = [...data];
      },
      (err: HttpErrorResponse) => {
        this.loader.close();
        console.log(err);
        let errorMessage = "ocurrió un problema de comunicación.";
        this.service.openDialog("Error en el Servicio: "+errorMessage);
      }
    );
  }

  resetForm(){
    this.signupForm = new FormGroup({
      rfc: new FormControl('', [ Validators.required, Validators.maxLength(12) ]),
      taxRegimeId: new FormControl('', [ Validators.required ]),
      email: new FormControl('', [ Validators.required, Validators.email ]),
      password: new FormControl('', [ Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-z\d]+$/) ]),
      confirmPassword: new FormControl('', [ Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-z\d]+$/) ]),
      rememberMe: new FormControl(false)
    }, { validators: this.checkPasswords });
  }
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control?.invalid && control?.parent?.dirty);
    const invalidParent = !!(control?.parent?.invalid && control?.parent?.dirty);

    return invalidCtrl || invalidParent;
  }
}
