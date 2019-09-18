import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FactService } from './_service/fact.service';
import { Fact } from './_model/fact.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private http: HttpClient,
              private factService: FactService) {
  }

}
