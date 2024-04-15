import { Component, OnInit } from '@angular/core';
import { euler } from 'src/app/interfaces/euler';
import { eulerMejorado } from 'src/app/interfaces/eulerMejorado';
import { MathJaxService } from 'src/app/services/math-jax-service.service';

@Component({
  selector: 'app-euler',
  templateUrl: './euler.component.html',
  styleUrls: ['./euler.component.css']
})
export class EulerComponent implements OnInit {
  edo: string = '';
  numPasos!: number;
  valoresInicialesRaw: string = '';
  rangoRaw: string = '';
  funcion:string = '';
  metodo: string="euler";
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


  resultados!: euler[] |  eulerMejorado[];

  first = 0;

  rows = 10;

  displayModal: boolean = false;
  position: string = 'center';

  constructor(private mathJaxService: MathJaxService){
  }

  ngOnInit() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'Euler',
                data: [65, 59, 80, 81, 56, 55, 40],
                fill: false,
                borderColor: documentStyle.getPropertyValue('--blue-500'),
                tension: 0.4
            },
            {
                label: 'Valor Real',
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
  return this.resultados ? this.first === this.resultados.length - this.rows : true;
}

isFirstPage(): boolean {
  return this.resultados ? this.first === 0 : true;
}

showDialog(position: string) {
  this.position = position;
  this.displayModal = true;
  this.mathJaxService.renderEquation('', 'edo-output');
  this.mathJaxService.renderEquation('', 'funcion-output');
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


updateEdo(newEdo: string) {
  this.edo = newEdo;
  this.mathJaxService.renderEquation(this.edo, 'edo-output');
  console.log(this.edo);
}
updateFuncion(newFuncion: string) {
  this.funcion = newFuncion;
  this.mathJaxService.renderEquation(this.funcion, 'funcion-output');
  console.log(this.funcion);
}


crearRegistro() {}

}
