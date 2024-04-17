import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { euler } from '../interfaces/euler';

@Injectable({
  providedIn: 'root'
})
export class EulerServiceService {
  private apiUrl = 'http://localhost:8000/euler';

  constructor(private http: HttpClient) { }

  calcularEuler(datos: any): Observable< euler[]> {
    return this.http.post<any>(this.apiUrl, datos);
  }
}
