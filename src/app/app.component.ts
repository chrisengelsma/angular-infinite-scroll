import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FactService } from './_service/fact.service';
import { Fact } from './_model/fact.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild(CdkVirtualScrollViewport, { static: true })
  viewport: CdkVirtualScrollViewport;

  facts: Observable<Fact[]>;

  constructor(private http: HttpClient,
              private factService: FactService) {
    this.getFacts();
  }

  getFacts(): void {
    const years = [...Array(10)].map((_, i) => this.getRandomYear());
    this.factService.getFacts(years).subscribe(res => {
      console.log(res);

    });
  }

  getRandomYear(): number {
    return Math.ceil(Math.random() * 2019) + 1;
  }

}
