import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-confirm',
  templateUrl: './dialog-confirm.component.html',
  styleUrls: ['./dialog-confirm.component.scss']
})
export class DialogConfirmComponent implements OnInit {

  public title:string;
  public message:string;
  public confirm:boolean;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogConfirmData,
    public dialogRef: MatDialogRef<any>
  ) { }

  ngOnInit(): void {
    this.title = this.data.title;
    this.message = this.data.message;
    this.confirm = this.data.confirm;
  }

  dismiss(){
    this.dialogRef.close();
  }

}


export interface DialogConfirmData{
  title:string;
  message:string;
  confirm:boolean;
}