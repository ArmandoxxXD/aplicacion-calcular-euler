import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-euler',
  templateUrl: './euler.component.html',
  styleUrls: ['./euler.component.css']
})
export class EulerComponent implements OnInit {
  edo: string = '';
  numPasos: any;
  valoresInicialesRaw: string = '';
  rangoRaw: string = '';
  funcion!:string;
  metodo: any;
  valoresIniciales: { 
    x: number | null; 
    y: number | null; 
  } = {
    x: null,
    y: null
  };
  rango: {
    inicio: number | null;
    final: number | null;
  } = {
    inicio: null,
    final: null
  };

  data: any;

  options: any;


  customers!: any[];

  first = 0;

  rows = 10;

  displayModal: boolean = false;
  position: string = 'center';


  ngOnInit() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'First Dataset',
                data: [65, 59, 80, 81, 56, 55, 40],
                fill: false,
                borderColor: documentStyle.getPropertyValue('--blue-500'),
                tension: 0.4
            },
            {
                label: 'Second Dataset',
                data: [28, 48, 40, 19, 86, 27, 90],
                fill: false,
                borderColor: documentStyle.getPropertyValue('--pink-500'),
                tension: 0.4
            }
        ]
    };

    this.options = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }
        }
    };

    // this.customerService.getCustomersLarge().then((customers) => (this.customers = customers));
}

next() {
  this.first = this.first + this.rows;
}

prev() {
  this.first = this.first - this.rows;
}

reset() {
  this.first = 0;
}

pageChange(event: any) {
  this.first = event.first;
  this.rows = event.rows;
}

isLastPage(): boolean {
  return this.customers ? this.first === this.customers.length - this.rows : true;
}

isFirstPage(): boolean {
  return this.customers ? this.first === 0 : true;
}

showDialog(position: string) {
  this.position = position;
  this.displayModal = true;
}

actualizarValoresIniciales() {
  const match = this.valoresInicialesRaw.match(/Y\((\d+)\)=(\d+)/);
  if (match) {
    this.valoresIniciales.x = parseInt(match[1]);
    this.valoresIniciales.y = parseInt(match[2]);
  }
}

actualizarRango() {
  const match = this.rangoRaw.match(/(\d+) ≤ x ≤ (\d+)/);
  if (match) {
    this.rango.inicio = parseInt(match[1]);
    this.rango.final = parseInt(match[2]);
  }
}

crearRegistro(){
  this.actualizarValoresIniciales();
  this.actualizarRango();

  console.log('Valores Iniciales:', this.valoresIniciales);
  console.log('Rango:', this.rango);
}

}
