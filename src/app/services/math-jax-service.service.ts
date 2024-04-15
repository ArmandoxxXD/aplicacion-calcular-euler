import { Injectable } from '@angular/core';
import * as math from 'mathjs';

declare global {
  interface Window {
    MathJax: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class MathJaxService {

  constructor() { }

  private formatExpression(expression: string): string {
    // Utiliza mathjs para convertir la expresión a LaTeX
    try {
      const node = math.parse(expression);
      return node.toTex({ parenthesis: 'keep', implicit: 'show' });
    } catch (e) {
      console.error('Error parsing expression:', e);
      return '';
    }
  }

  public renderEquation(rawExpression: string, elementId: string): void {
    setTimeout(() => {
      const formattedExpression = this.formatExpression(rawExpression);
      const element = document.getElementById(elementId);
      if (element) {
        element.innerText = '';
        window.MathJax.typesetClear([element]);
        element.innerHTML = `\\[${formattedExpression}\\]`; // Encierra la expresión en delimitadores de MathJax
        window.MathJax.typesetPromise([element]).catch((err: any) => console.error('Error typesetting formulas', err));
      }
    });
  }
  }
