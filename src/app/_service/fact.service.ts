import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Fact } from '../_model/fact.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FactService {

  constructor(private http: HttpClient) { }

  getFacts(years: number[]): Observable<Fact[]> {
    return this.http.get<Fact[]>(`http://numbersapi.com/${years.join(',')}/year?json`);
  }
}
