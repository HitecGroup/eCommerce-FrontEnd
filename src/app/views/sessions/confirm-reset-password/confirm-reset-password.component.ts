import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {Location} from '@angular/common';

@Component({
  selector: 'app-confirm-reset-password',
  templateUrl: './confirm-reset-password.component.html',
  styleUrls: ['./confirm-reset-password.component.scss']
})
export class ConfirmResetPasswordComponent implements OnInit {
  messageToUser = "Revisa tu correo electrónico. Hemos enviado un enlace para restablecer tu contraseña.";
  
  constructor(private _snackBar: MatSnackBar, public _location: Location) { }

  ngOnInit(): void {
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, { horizontalPosition: 'start', verticalPosition: 'bottom', duration: 5000 });
  }

  backClicked() {
    this._location.back();
  }

}
