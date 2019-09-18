import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Fact } from '../_model/fact.model';
import { FactService } from '../_service/fact.service';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';


@Component({
  selector: 'app-fact-scroller',
  templateUrl: './fact-scroller.component.html',
  styleUrls: ['./fact-scroller.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FactScrollerComponent {

  dataSource: FactsDataSource;

  constructor(private factService: FactService) {
    this.dataSource = new FactsDataSource(factService);
  }

}

export class FactsDataSource extends DataSource<Fact | undefined> {
  private cachedFacts = Array.from<Fact>({ length: 0 });
  private dataStream = new BehaviorSubject<(Fact | undefined)[]>(this.cachedFacts);
  private subscription = new Subscription();

  private pageSize = 10;
  private lastPage = 0;

  constructor(private factService: FactService) {
    super();

    // Start with some data.
    this.fetchFactPage();
  }

  /**
   * Fetch a fact.
   */
  fetchFactPage(): void {
    for (let i = 0; i < this.pageSize; ++i) {
      this.factService.getRandomFact().subscribe(res => {
        this.cachedFacts = this.cachedFacts.concat(res);
        this.dataStream.next(this.cachedFacts);
      });
    }
  }

  connect(collectionViewer: CollectionViewer): Observable<(Fact | undefined)[] | ReadonlyArray<Fact | undefined>> {
    this.subscription.add(collectionViewer.viewChange.subscribe(range => {

      const lastIndex = range.end;
      const currentPage = this.getPageForIndex(range.end);

      if (lastIndex && this.cachedFacts) {
        console.log(this.getPageForIndex(lastIndex), this.cachedFacts.length);
      }

      if (currentPage > this.lastPage) {
        this.lastPage = currentPage;
        this.fetchFactPage();
      }
    }));
    return this.dataStream;
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.subscription.unsubscribe();
  }

  /**
   * Returns the page for a given index.
   */
  private getPageForIndex(i: number): number {
    return Math.floor(i / this.pageSize);
  }

  /**
   * Gets a random year from 1 to maxYear (AD)
   */
  getRandomYear(maxYear: number = 2019): number {
    return Math.ceil(Math.random() * maxYear) + 1;
  }
}
