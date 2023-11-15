import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.scss']
})
export class FaqsComponent implements OnInit {

  faqs:IFaq[] = [
    {
      faq:'¿Cómo me registro?',
      content:`<a href="#/sessions/signup" class="color-red">Ingresa aquí</a> y regístrate con los siguientes datos:
    <ol>
    <li>Datos generales (Nombre, Teléfono, Correo electrónico, RFC).</li>
    <li>Llegará un correo electrónico verificando que tu correo se utilizó en Hi-Tec Tools</li>
    <li>Llegará un correo electrónico que informa que se completó el registro y se proporcionará el número de cliente.</li>
    </ol>
    *** Si decides realizar una compra te recomendamos verifiques que tu perfil se encuentre completamente lleno con todos los datos tanto de envió como de facturación.
    `},
    {
      faq:'¿No encuentro mi producto? ',
      content:`Hitec Tools trabaja para ti de manera que los filtros sean dinámicos y tu búsqueda sea más precisa, te recomendamos que busques por:
    <ol>
    <li>Categoría</li>
    <li>Marca</li>
    <li>Línea de producto</li>
    <li>Dimensiones, tipo de material, etc.</li>
    </ol>
    *** Recuerda que puedes escribirnos en cualquier momento si deseas asistencia o atención personalizada por un asesor de herramientas.
    `},
    {
      faq:'¿Cómo comprar? ',
      content:`<ol>
    <li><a href="#/sessions/signup" class="color-red">Ingresa aquí</a> y regístrate en nuestra página para contar con un perfil o accede a tu cuenta. </li>
    <li>Selecciona los artículos de tu preferencia. </li>
    <li>Revisa la disponibilidad de los artículos.</li>
    <li>Coloca tus datos de envío, es importante que coloques tu dirección completa y persona quien recibe.</li>
    <li>Selecciona el método de pago que más te convenga</li>
    </ol>
    ¡Listo! 
    `},
    {
      faq:'¿Cuáles son los métodos de pago?',
      content:` Tarjeta de débito, crédito VISA y MasterCard
      <ul>
      <li>BBVA Bancomer</li>
      <li>Banamex	</li>
      <li>HSBC</li>
      <li>Santander</li>
      <li>Scotiabank </li>
      </ul>
    `},
    {
      faq:'¿El pago es seguro? ',
      content:`Sí, en Hitec Tools nos interesa generar confianza en nuestros clientes, por ello todas nuestras transacciones son procesadas mediante la pasarela de BBVA Multipagos. `},
    {
      faq:'¿Cuál es el tipo de cambio que consideran para el pago?',
      content:`<ol>
      <li>El publicado en el Diario Oficial de la Federación </li>
      <li>Podrás visualizarlo a un costado del precio de cada artículo e incluso al final de realizar tu compra esta la conversión en pesos mexicanos.</li>
      <li>Los días que no esté publicado el tipo de cambio se aplicará el publicado con anterioridad al día en que se causen las contribuciones del producto.</li>
      </ol>
    `},
    {faq:'Si requiero factura ¿Cómo la solicito? ',content:`Al introducir tus datos de envío podrás elegir dirección fiscal o registrar una nueva. Posteriormente ésta se generará en cuanto el pago sea aprobado. `},
    {faq:'¿Cuál es el tiempo de entrega? ',content:`Esto dependerá de la existencia de stock, al momento de confirmar tu pedido, verifica las semanas indicadas por marca que están dentro de tu periodo de espera.`},
    {faq:'¿Cuál es el costo de envió? ',content:`En Hitec Tools buscamos que tu experiencia sea la mejor carta de recomendación. ¡Los gastos de envío en la Ciudad de México y Zona Metropolitana son totalmente GRATIS!
      <br/><br/>
    ***Aprovecha y compra ahora.
    `},
    {faq:'¿Cómo puedo rastrear mi pedido? ',content:`Una vez procesado tu pedido Hi-Tec Tools compartirá contigo número de guía. 
    <br/><br/>
    ***Recuerda una vez que paquetería lo ponga en ruta podrás realizar el rastreo para que conozcas el estatus de tu paquete y puedas consultarlo en cualquier momento. 
    `
    },
    {faq:'¿Hay devoluciones?',content:`Las devoluciones se efectuarán sólo por defectos de fabricación. Si esto lamentablemente ocurrió, ponte en <a href="https://www.hitecgifts.com/contacto/" target="_blank" class="color-red">contacto</a> con nosotros. 
    <br/><br/>
    *** Para mejores aclaraciones toma un video al momento de abrir tu pedido.
    `}
  ];

  constructor(
    public sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    this.faqs.forEach(
      (faq) => {
        faq.innerHTML = this.sanitizer.bypassSecurityTrustHtml(faq.content);
      }
    )
  }


}
export interface IFaq {
  faq:string;
  content:string;
  innerHTML?:SafeHtml;
}