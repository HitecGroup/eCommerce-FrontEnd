import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { DialogComponent } from 'app/shared/components/dialog/dialog.component';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ServiceService } from 'app/shared/services/service.service';
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  userEmail;
  showHintEmail:boolean = false;
  // @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;
  constructor(    
    private router: Router,
    private loader:AppLoaderService,
    private service: ServiceService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
  }
  submitEmail() {
    this.showHintEmail = false;
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!re.test(String(this.userEmail).toLowerCase())){
      this.showHintEmail = true;
      this.openDialog('',"Ingrese un email valido");
      return;
    }
    
    this.userEmail
    this.submitButton.disabled = true;
    this.loader.open('Cambiando contraseña');
      this.service.restorePassword({Email: this.userEmail}).subscribe(
        (result:any) => {
          this.submitButton.disabled = false;
          this.loader.close();
          this.openDialog('',result+" Favor de iniciar sesion nuevamente");
          this.userEmail = '';
          this.router.navigateByUrl('sessions/email-confirmation');
        },
        (error:HttpErrorResponse)=>{
          this.submitButton.disabled = false;
          this.loader.close();
          this.openDialog('Alerta','No se pudo cambiar su contraseña');
        }
      )
  }

  public openDialog(title:string,content:string) {
    
    this.dialog.open(DialogComponent, {
      data: {
        title: title,
        content: content,
        at: ''
      }
    }); 
  }


  goToHome() {
    this.router.navigateByUrl('/sessions/signin');
  }
}
