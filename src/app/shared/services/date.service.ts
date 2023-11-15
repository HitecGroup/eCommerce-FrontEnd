import { formatDate  } from '@angular/common';
import { Injectable } from '@angular/core';
import localeEsMx from '@angular/common/locales/es-MX';
import { registerLocaleData } from '@angular/common';
import Moment from 'moment';
import 'moment/locale/es';  // without this line it didn't work
Moment.locale('es');
registerLocaleData(localeEsMx, 'es-Mx');

@Injectable({
  providedIn: 'root'
})
export class DateService {

  constructor() { }

  public getElapsedTime(date:string) {
    const fechaFin = new Date(date.trim().replace(/ /g,"T"));
    // tslint:disable-next-line: indent
    const fechaActual = new Date();
    // Tomar todos los segundos que diferencian con respecto a la fecha final
    // let dif = Math.abs(fechaFin - fechaActual) / 1000;
    const millisBetween = fechaFin.getTime() - fechaActual.getTime();

    let dif = Math.abs(millisBetween) / 1000;

    // calcula y resta los dias
    const days = Math.floor(dif / 86400);
    dif -= days * 86400;

    // calcula y resta las horas
    const hours = Math.floor(dif / 3600) % 24;
    dif -= hours * 3600;

    // calcula y resta los minutos
    const minutes = Math.floor(dif / 60) % 60;
    dif -= minutes * 60;

    // lo que queda son segundos
    const seconds = Math.floor(dif % 60);

    let mensaje = '';
    if (days > 0) { mensaje = 'Hace ' + days + (Object.is(days, 1) ? ' día.' : ' días.'); }
    else if (hours > 0) { mensaje = 'Hace ' + hours + (Object.is(hours, 1) ? ' hora.' : ' horas.'); }
    else if (minutes > 0) { mensaje = 'Hace ' + minutes + (Object.is(minutes, 1) ? ' minuto.' : ' minutos.'); }
    else if (seconds > 0) { mensaje = 'Hace un momento.'; }

    return mensaje;
  }

  public parseToDiagonalFormat(date:string):string {
    let dateObject = new Date(date.trim().replace(/ /g,"T"));
    let monthName = '';
    switch(dateObject.getMonth()){
      case 0 :monthName = 'Ene';break;
      case 1 :monthName = 'Feb';break;
      case 2 :monthName = 'Mar';break;
      case 3 :monthName = 'Abr';break;
      case 4 :monthName = 'May';break;
      case 5 :monthName = 'Jun';break;
      case 6 :monthName = 'Jul';break;
      case 7 :monthName = 'Ago';break;
      case 8 :monthName = 'Sep';break;
      case 9 :monthName = 'Oct';break;
      case 10:monthName = 'Nov';break;
      case 11:monthName = 'Dic';break;
    }
    let dayNumber:number = dateObject.getDate();
    let day:string = (dayNumber < 10)?`0${dayNumber}`:`${dayNumber}`;
    return `${day}/${monthName}/${dateObject.getFullYear()}`;
  }

  public getCurrentDate(format:string):string{
    let dateObject = new Date();
    // let date:string = String(this.datePipe.transform(dateObject, format,'UTC-6','ES-MX'));
    // return date;
    return formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-MX');
  }

  public getCurrentShift(shifts:any):number{
    let timeNow = Moment(this.getCurrentDateTime()).format("HH:mm:ss");
    // let timeNow =  Moment(this.getToday()+" "+"18:01:00").format("HH:mm:ss");
    let dayShiftsMStartsAt = Moment(this.getToday()+" "+shifts[0].startsAt).format("HH:mm:ss");
    let dayShiftsMEndsAt = Moment(this.getToday()+" "+shifts[0].endsAt).format("HH:mm:ss");
    if (timeNow >= dayShiftsMStartsAt && timeNow <= dayShiftsMEndsAt) {return shifts[0].id;}
    else {return shifts[1].id;}
  }

  public getToday():string{
    let date = new Date();
    return formatDate(date, 'yyyy-MM-dd', 'en-MX');
  }

  public getCurrentDateTime():string{
    let date = new Date();
    return formatDate(date, 'yyyy-MM-dd HH:mm:ss', 'en-MX');
  }

}

