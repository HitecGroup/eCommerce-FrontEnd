import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    private router:Router,
    private dialogRef:MatDialog
  ) { }

  private keyUserInfo:string = 'userInfo';
  private keyUserCredentials:string = 'rememberMe';

  public setUserInfo(data:any):boolean {
    let success:boolean = true;
    try {
      let userInfo = JSON.stringify(data);
      localStorage.setItem(this.keyUserInfo,userInfo);  
    } catch (error) {
      success = false;
    }
    return success;
  }

  public clearUserInfo(all:boolean = false):boolean{
    let success:boolean = false;
    try {
      if (all) {
        localStorage.clear();
      } else {
        localStorage.removeItem(this.keyUserInfo);
      }
      success = false;
    } catch (error) {
      console.log(error);
    }
    return success;
  }

  public clear(key:string) {
    let success:boolean = false;
    try {
      localStorage.removeItem(key);
      success = true;
    } catch (error) {
      console.log(error);
    }
    return success;
  }

  public getUserInfo():IUser {
    let userInfo:IUser = undefined;
    try {
      userInfo = JSON.parse(String(localStorage.getItem(this.keyUserInfo)));
    } catch (error) {
      console.log(error);
    }
    return userInfo;
  }

  public setUserCredentials(credentials:IUserCredentials):boolean {
    let success:boolean = false;
    try {
      localStorage.setItem(this.keyUserCredentials,JSON.stringify(credentials));
      success = true;
    } catch (error) {
      console.log(error);
    }
    return success;
  }

  public getUserCredentials():IUserCredentials {
    let credentials:IUserCredentials = undefined;
    try {
      credentials = JSON.parse(String(localStorage.getItem(this.keyUserCredentials))) as IUserCredentials;
    } catch (error) {
      console.log(error);
    }
    return credentials;
  }
  
}

export interface IUser {
  token:string;
  accountAddresses:any[];
  active:number;
  email:string;
  idUser:number;
  imageUrl:string;
  lastName:string;
  name:string;
  prefixTelephone:string;
  rfc:string;
  sapCode:number;
  shoppingCar:any[];
  shoppingCarNew:any;
  telephone:string;
};

export interface IUserCredentials {
  email:string;
  pswd:string;
  pswdConfirm:string;
};
