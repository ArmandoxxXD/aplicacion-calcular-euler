import { Component, OnInit, ViewChild } from '@angular/core';
import { euler } from 'src/app/interfaces/euler';
import { MathJaxService } from 'src/app/services/math-jax-service.service';
import { EulerServiceService } from 'src/app/services/euler-service.service';
import { ToastrService } from 'ngx-toastr';
import { Chart, registerables  } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { eulerMejorado } from 'src/app/interfaces/eulerMejorado';
import { UIChart } from 'primeng/chart';

@Component({
  selector: 'app-euler',
  templateUrl: './euler.component.html',
  styleUrls: ['./euler.component.css']
})
export class EulerComponent implements OnInit {
  @ViewChild('chart') chart!: UIChart;

  resultadoFuncion: string = '';
  numPasos!: number;
  valoresInicialesRaw: string = '';
  rangoRaw: string = '';
  funcion: string = '';
  parsedFunction: any;
  metodo: string = "euler";
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

  resultados: euler[] | eulerMejorado[] = [];

  first = 0;
  rows = 0;

  displayModal: boolean = false;
  position: string = 'center';

  constructor(
    private mathJaxService: MathJaxService,
    private toastr: ToastrService,
    private eulerService: EulerServiceService
  ) { 

  }

  ngOnInit() {
    Chart.register(...registerables, zoomPlugin);
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
          tension: 0.1
        },
        {
          label: 'Valor Real',
          data: [0, 0, 0, 0, 0, 0, 0],
          fill: false,
          borderColor: documentStyle.getPropertyValue('--pink-500'),
          tension: 0.1
        }
      ]
    };

    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      animation: {
        duration: 900,
        easing: 'linear'
      },
      plugins: {
        legend: {
          labels: {
            color: textColor,
          }
        },
        zoom: {
          limits: {
            x: {min: 'original', max: 'original', minRange: 1},
            y: {min: 'original', max: 'original', minRange: 1}
          },
          zoom: {
            wheel: {
              enabled: false,
              speed: 0.2,
            },
            pinch: {
              enabled: true ,
              mode: 'xy'
            },
            mode: 'xy',
          },
          pan: {
            enabled: true,
            mode: 'xy'
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
            drawBorder: false,
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
    if (localStorage.getItem('euler')) {
      const datos = localStorage.getItem('euler') as string;
      const prom = JSON.parse(localStorage.getItem('euler-prom') as string);
      this.resultados = JSON.parse(datos);

      this.funcion = prom.funcion;
      this.resultadoFuncion = prom.solucion_real_func;
      this.numPasos = prom.numPasos;
      this.valoresIniciales.x = prom.x_inicial;
      this.valoresIniciales.y = prom.y_inicial;

      this.valoresInicialesRaw = `Y(${prom.x_inicial}=${prom.y_inicial})`;
      this.rango.inicio = prom.rango_inicial;
      this.rango.final = prom.rango_final;

      this.rangoRaw = `${prom.rango_inicial % 1 !== 0 ? `${prom.rango_inicial}` : `${prom.rango_inicial}.0`} ≤ x ≤ ${prom.rango_final % 1 !== 0 ? `${prom.rango_final}` : `${prom.rango_final}.0`}`
      console.log(this.rangoRaw);

      this.actualizarDatosGrafica(JSON.parse(datos));
      this.displayModal = false;
    }
  }

  resetZoom() {
    if (this.chart && this.chart.chart) {
      this.chart.chart.resetZoom();
    }
  }

  zoomIn() {
    if (this.chart && this.chart.chart) {
      requestAnimationFrame(() => {
        this.chart.chart.zoom(1.1);
      });
    }
  }
  
  zoomOut() {
    if (this.chart && this.chart.chart) {
      requestAnimationFrame(() => {
        this.chart.chart.zoom(0.9);
      });
    }
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
  console.log(this.metodo)
    this.actualizarRango();
    this.actualizarValoresIniciales();
    const datos = {
      funcion: this.funcion,
      solucion_real_func: this.resultadoFuncion,
      numPasos: this.numPasos,
      x_inicial: this.valoresIniciales.x,
      y_inicial: this.valoresIniciales.y,
      rango_inicial: this.rango.inicio,
      rango_final: this.rango.final
    };
  
    if (this.metodo === 'euler') {
      this.eulerService.calcularEuler(datos).subscribe({
        next: (resultados: euler[]) => {
          this.resultados = resultados;
          this.actualizarDatosGrafica(resultados);
          localStorage.setItem('euler', JSON.stringify(resultados, null, 2));
          localStorage.setItem('euler-prom', JSON.stringify(datos, null, 2))
          this.displayModal = false;
        },
        error: (error) => this.toastr.error('Hubo un error al procesar una expresión', 'Error en el cálculo')
      });
    } else if (this.metodo === 'eulerMejorado') {
      this.eulerService.calcularEulerMejorado(datos).subscribe({
        next: (resultados: eulerMejorado[]) => {
          this.resultados = resultados;
          this.actualizarDatosGrafica(resultados);
          localStorage.setItem('euler', JSON.stringify(resultados, null, 2));
          localStorage.setItem('euler-prom', JSON.stringify(datos, null, 2))
          this.displayModal = false;
        },
        error: (error) => this.toastr.error('Hubo un error al procesar una expresión', 'Error en el cálculo')
      });
    }
  }

  eliminarRegistro() {
    this.resultados = new Array<euler>;
    this.actualizarDatosGrafica([]);
    localStorage.clear();
  }
}