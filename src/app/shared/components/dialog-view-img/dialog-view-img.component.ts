import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { API } from 'app/shared/services/api';

@Component({
  selector: 'app-dialog-view-img',
  templateUrl: './dialog-view-img.component.html',
  styleUrls: ['./dialog-view-img.component.scss']
})
export class DialogViewImgComponent implements OnInit {
  // img:string="";
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogImg) { }

  img:File;
  ngOnInit(): void {
    // this.img = API.URL_STORAGE+this.data.rutaImg;
    // this.img = API.URL_BASE+this.data.rutaImg;
    if(this.data.rutaImg){
      this.img = this.data.rutaImg;
      var src = this.img;
      var preview:any = document.getElementById("preview");
      preview.src = src;
      preview.style.display = "block";

    }

  }

}
export interface DialogImg {
  rutaImg:any;
}
