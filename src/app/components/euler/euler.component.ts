import { Component, OnInit } from '@angular/core';
import { euler } from 'src/app/interfaces/euler';
import { MathJaxService } from 'src/app/services/math-jax-service.service';
import { EulerServiceService } from 'src/app/services/euler-service.service';
import { ToastrService } from 'ngx-toastr';
import { Chart } from 'chart.js';
import 'chartjs-plugin-zoom';

@Component({
  selector: 'app-euler',
  templateUrl: './euler.component.html',
  styleUrls: ['./euler.component.css']
})
export class EulerComponent implements OnInit {
  resultadoFuncion: string = '';
  numPasos!: number;
  valoresInicialesRaw: string = '';
  rangoRaw: string = '';
  funcion:string = '';
  parsedFunction: any;
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


  resultados: euler[] = [];

  first = 0;
  rows = 0;

  displayModal: boolean = false;
  position: string = 'center';

  constructor(
    private mathJaxService: MathJaxService,
    private toastr: ToastrService,
    private eulerService: EulerServiceService
  ){}

  ngOnInit() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.data = {
        labels: ['', '', '', '', '', '', ''],
        datasets: [
            {
                label: 'Euler',
                data: [0, 0, 0, 0, 0, 0, 0],
                fill: false,
                borderColor: documentStyle.getPropertyValue('--blue-500'),
                tension: 0.4
            },
            {
                label: 'Valor Real',
                data: [0, 0, 0, 0, 0, 0, 0],
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
            color: textColor,
          }
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: true, // Habilitar zoom con rueda del mouse
            },
            pinch: {
              enabled: true // Habilitar zoom con gestos de pellizco
            },
            mode: 'xy' // Zoom en los ejes x e y
          },
          pan: {
            enabled: true,
            mode: 'xy' // Desplazamiento en los ejes x e y
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

  }


validarCampos(): boolean {
  return !!this.resultadoFuncion && !!this.numPasos && !!this.valoresInicialesRaw && !!this.rangoRaw && !!this.funcion && !!this.metodo;
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
  const match = this.rangoRaw.match(/(\d+\.?\d*)\s*≤\s*x\s*≤\s*(\d+\.?\d*)/);
  if (match) {
    this.rango.inicio = parseFloat(match[1]);
    this.rango.final = parseFloat(match[2]);
    console.log(`Rango actualizado: Inicio = ${this.rango.inicio}, Final = ${this.rango.final}`);
  } 
}

updateEdo(newEdo: string) {
  this.resultadoFuncion = newEdo;
  this.mathJaxService.renderEquation(this.resultadoFuncion, 'edo-output');
  console.log(this.resultadoFuncion);
}
updateFuncion(newFuncion: string) {
  this.funcion = newFuncion;
  this.mathJaxService.renderEquation(this.funcion, 'funcion-output');
  console.log(this.funcion);
}

actualizarDatosGrafica(resultados: euler[]) {
  this.data = {
    ...this.data,
    labels: resultados.map(r => r.xn.toString()),
    datasets: [
      {
        ...this.data.datasets[0],
        data: resultados.map(r => r.yn)
      },
      {
        ...this.data.datasets[1],
        data: resultados.map(r => r.valorReal)
      }
    ]
  };
}

crearRegistro() {
  this.actualizarRango();
  this.actualizarValoresIniciales();
  if (this.metodo === 'euler') {

    const datos = {
      funcion: this.funcion,
      solucion_real_func: this.resultadoFuncion,
      numPasos: this.numPasos,
      x_inicial: this.valoresIniciales.x,
      y_inicial: this.valoresIniciales.y,
      rango_inicial: this.rango.inicio,
      rango_final: this.rango.final
    };

    this.eulerService.calcularEuler(datos).subscribe({
      next: (resultados) => {
        this.resultados = resultados;
        this.actualizarDatosGrafica(resultados); 
        this.displayModal = false;
      },
      error: (error) => {
        console.error('Hubo un error al calcular Euler', error);
        this.toastr.error('Hubo un error al procesar la expresión: ' , 'Error en el cálculo');
      }
    });

  } else if (this.metodo === 'eulerMejorado') {
    // Implementa aquí el método de Euler Mejorado
  }
}

}