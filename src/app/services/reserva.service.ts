import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { Reserva } from '../models/reserva';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {

  url = 'http://localhost:8080/reservas';

  constructor(private httpClient: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  }

  findAll(): Observable<Reserva[]> {
    return this.httpClient.get<Reserva[]>(this.url)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
  }

  findById(id: Number): Observable<Reserva> {
    return this.httpClient.get<Reserva>(this.url + '/' + id)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
  }

  create(reserva: Reserva): Observable<Reserva> {
    return this.httpClient.post<Reserva>(this.url, JSON.stringify(reserva), this.httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
  }

  update(reserva: Reserva): Observable<Reserva> {
    return this.httpClient.put<Reserva>(this.url + '/' + reserva.id, JSON.stringify(reserva), this.httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
  }

  cancel(id: Number): Observable<Reserva> {
    return this.httpClient.delete<Reserva>(this.url + '/' + id, this.httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
  }

  deleteAll(): Observable<Reserva> {
    return this.httpClient.delete<Reserva>(this.url);
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = '';

    if(error.error instanceof ErrorEvent) {
      //Erro ocorreu no lado do cliente
        errorMessage = error.error.message;
    } else {
      //Erro ocorreu no lado do servidor
      errorMessage = `Código do erro: ${error.status}, ` + `menssagem: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(() => errorMessage);
  }
}
