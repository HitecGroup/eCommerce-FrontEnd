import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(
    private storage:StorageService
  ) { }

  public getSession():any{
    //let userInfo:string = String(localStorage.getItem('userInfo'));
    //let user = JSON.parse(userInfo);
    let user = this.storage.getUserInfo();
    return (user)?user:undefined;
  }

  public getRoleBySession():number{
    let session:any = this.getSession();
    const role:number = (session)?session.roleId:0;
    return role;
  }

  public isDriver():boolean{
    let roleId = this.getRoleBySession();
    return (roleId == ROLES.DRIVER)?true:false;
  }

  public isWeighing():boolean{
    let roleId = this.getRoleBySession();
    return (roleId == ROLES.WEIGHING_MACHINE)?true:false;
  }

  public isPoliceman():boolean{
    let roleId = this.getRoleBySession();
    return (roleId == ROLES.POLICEMAN)?true:false;
  }

  public isShipment():boolean{
    let roleId = this.getRoleBySession();
    return (roleId == ROLES.SHIPMENT_MANAGER)?true:false;
  }

  public isTraffic():boolean{
    let roleId = this.getRoleBySession();
    return (roleId == ROLES.TRAFFIC_MANAGER)?true:false;
  }

  public isLogistics():boolean{
    let roleId = this.getRoleBySession();
    return (roleId == ROLES.LOGISTICS_MANAGER)?true:false;
  }

  public isAdmin():boolean{
    let roleId = this.getRoleBySession();
    return (roleId == ROLES.ADMININSTRATOR)?true:false;
  }

  public getRoleName():string {
    let role:number = this.getRoleBySession();
    let roleName:string = "Usuario(a)";
    switch (role) {
      case ROLES.ADMININSTRATOR:
        roleName = "Administrador(a)";
        break;
      case ROLES.LOGISTICS_MANAGER:
        roleName = "Gerente de logística";
        break;
      case ROLES.TRAFFIC_MANAGER:
        roleName = "Jefe(a) de tráfico";
        break;
      case ROLES.SHIPMENT_MANAGER:
        roleName = "Jefe(a) de embarque";
        break;
      case ROLES.POLICEMAN:
        roleName = "Policía";
        break;
      case ROLES.WEIGHING_MACHINE:
        roleName = "Encargado(a) de báscula";
        break;
      case ROLES.DRIVER:
        roleName = "Conductor(a)";
        break;
    }
    return roleName;
  }

}

export const ROLES:RoleI = {
  ADMININSTRATOR    : 1,//Administrador
  LOGISTICS_MANAGER : 2,//Supervisor 1 - Gerente de logística
  TRAFFIC_MANAGER   : 3,//Supervisor 2 - Jefe de tráfico
  SHIPMENT_MANAGER  : 4,//Supervisor 3 - Jefe de embarque
  POLICEMAN         : 5,//Policia
  WEIGHING_MACHINE  : 6,//Báscula
  DRIVER            : 7,//Conductor/Transportista
}

interface RoleI{
  ADMININSTRATOR    : number;//Administrador
  LOGISTICS_MANAGER : number;//Supervisor 1 - Gerente de logística
  TRAFFIC_MANAGER   : number;//Supervisor 2 - Jefe de tráfico
  SHIPMENT_MANAGER  : number;//Supervisor 3 - Jefe de embarque
  POLICEMAN         : number;//Policia
  WEIGHING_MACHINE  : number;//Báscula
  DRIVER            : number;//Conductor/Transportista
}
