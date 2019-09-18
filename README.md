---
layout: page-fullwidth
title: 'Infinite scroll in Angular
categories:
  - angular
tags:
  - angular
  - infinite-scroll
header: false
breadcrumb: true
author: chrisengelsma
meta_description: 'Learn how to implement an infinitely-scrolling page using Angular'
---

When dealing with a large amount of content, you may find it useful to add an infinite-scroll feature to your site. When I say "infinite scrolling", I'm referring to a page appending new content as the user continues to scroll, giving the page the illusion of scrolling indefinitely. Loads of websites use this feature, and can be a fluid alternative to something like [pagination](https://en.wikipedia.org/wiki/Pagination).

While there are myriad different ways to implement this, let's explore how we can accomplish this using the [Component Dev Kit (CDK)](https://material.angular.io/cdk/categories). 

## Setup
{% raw %}
```bash
npm install @angular/cdk
```
{% endraw %}

To leverage the infinite scrolling functionality in this package, import _ScrollingModule_ to your `app.module.ts`:

{% raw %}

<p class="file-desc"><span>app.module.ts</span></p>
```typescript
import { ScrollingModule} from '@angular/cdk/scrolling';
```

{% endraw %}

Then add it to your imports:

{% raw %}

<p class="file-desc"><span>app.module.ts</span></p>
```typescript
    imports: [
        ScrollingModule
    ]
```

{% endraw %}

You're now ready to start!

## Infinite scroll implementation

<figure class="text-center">
<img src="/angular/images/angular-infinite-scroll/Angular-Infinite-Scroll.gif" width="600" alt="Infinite scrolling" />
<figcaption>A never-ending list of historical facts!</figcaption>
</figure>

We're going to build a component that displays [random historical events](http://numbersapi.com/#random/trivia). When the user reaches the end of the scroll, our application will load more facts. For the purpose of this tutorial, I'm going to gloss over the details of building the service.

For the time being, assume that we have a FactService that only provides the following function:

```typescript
getRandomFact();
```

We will be pulling 10 facts at a time, and each time the user scrolls to the end, we will query for 10 more facts.

## FactScrollerComponent

Construct a new component that will act as your infinite-scroller. I'm calling mine 'FactScrollerComponent'. You can use the Angular CLI to do this:

```bash
$ ng g component fact-scroller 
```

Ensure that the new component is imported to you `app.module.ts` and added to the declarations.

{% raw %}

<p class="file-desc"><span>app.module.ts</span></p>

```typescript
import { ScrollingModule} from '@angular/cdk/scrolling';
```

{% endraw %}

{% raw %}

<p class="file-desc"><span>app.module.ts</span></p>

```typescript
    declarations: [
        FactScrollerComponent
    ]
```

{% endraw %}

In our `fact-scroller.component.html` let's construct the scroller scaffolding:

{% raw %}

<p class="file-desc"><span>fact-scroller.component.html</span></p>

```html
<cdk-virtual-scroll-viewport itemSize="100">
  <li *cdkVirtualFor="let fact of dataSource">
      <!-- Print stuff here -->
  </li>
</cdk-virtual-scroll-viewport>
```

{% endraw %}

Here, we use a `cdk-virtual-scroll-viewport` to be our virtual scroller. Within this, we loop over our items using `*cdkVirtualFor`, which is analogous as using `*ngFor`.

In order for the component to properly size its internal scroller, we need to tell the scroller how tall each item will be (in pixels). This is done using the `itemSize` directive. So, `itemSize="100"` means that item in the list will require 100px of height.

We've also told the scroller to pull the data from "dataSource" (which doesn't exist yet, so it's best we create it now).

## Our Custom FactsDataSource

In our `fact-scroller.component.ts` file, we need to define what our data source looks like. To do this, we will extend the `DataSource` class in `@angular/cdk/collections`. Here is what our data source looks like:

{% raw %}

<p class="file-desc"><span>fact-scroller.component.ts</span></p>

```typescript
import { CollectionViewer, DataSource } from '@angular/cdk/collections';

export interface Fact {
  text?: string;
  date?: string;
}

export class FactsDataSource extends DataSource<Fact | undefined> {
  private cachedFacts = Array.from<Fact>({ length: 0 });
  private dataStream = new BehaviorSubject<(Fact | undefined)[]>(this.cachedFacts);
  private subscription = new Subscription();

  constructor(private factService: FactService) {
    super();
  }

  connect(collectionViewer: CollectionViewer): Observable<(Fact | undefined)[] | ReadonlyArray<Fact | undefined>> {
    this.subscription.add(collectionViewer.viewChange.subscribe(range => {
      // Update the data
    }));
    return this.dataStream;
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.subscription.unsubscribe();
  }
}

```

{% endraw %}

There's a lot to digest here, so let's break it down.

We first define our model, `Fact`, which will be define our data structure.

Within `FactsDataSource`, we need to implement two functions: `connect()`, and `disconnect()`. The datasource is subscribed to any changes in the collection viewer (e.g. the user scrolls), and will then perform an action and return the data stream. We are going to tell the datasource to get more data when we have reached the end of the list.

We also declared three member variables: 

* `cachedFacts`: our cached results,
* `dataStream`: a RxJS BehaviorSubject to propagate changes to our cached results, and
* `subscription`: a subscription to listen for view collection changes.

Let's define a few helpers within this class:

```typescript
  private pageSize = 10;
  private lastPage = 0;

  private _fetchFactPage(): void {
    for (let i = 0; i < this.pageSize; ++i) {
      this.factService.getRandomFact().subscribe(res => {
        this.cachedFacts = this.cachedFacts.concat(res);
        this.dataStream.next(this.cachedFacts);
      });
    }
  }

private _getPageForIndex(i: number): number {
    return Math.floor(i / this.pageSize);
}
```

I'm setting the page size to 10.0, meaning I want to grab 10 facts at a time. I'm also going to keep track of the last page loaded.

`_fetchFactPage()` simply makes a call to our service to get some facts, which are then appended to the cache.

`_getPageForIndex()` will convert an line index to a page (or batch) value.


Putting these all together, we can then  define how we want the list to update within the subscription callback;

```typescript
connect(collectionViewer: CollectionViewer): Observable<(Fact | undefined)[] | ReadonlyArray<Fact | undefined>> {
    this.subscription.add(collectionViewer.viewChange.subscribe(range => {

      const currentPage = this._getPageForIndex(range.end);

      if (currentPage > this.lastPage) {
        this.lastPage = currentPage;
        this._fetchFactPage();
      }

    }));
    return this.dataStream;
  }
``` 

We also want to start with some data, so we can make a call to our fetch function in the constructor:

```typescript
constructor(private factService: FactService) {
    super();

    // Start with some data.
    this._fetchFactPage();
  }
```

Our custom datasource should now get us where we need to go. The final piece to put it all together is to add our new data source to the component.

```typescript
@Component({
  selector: 'app-fact-scroller',
  templateUrl: './fact-scroller.component.html',
  styleUrls: ['./fact-scroller.component.scss']
})
export class FactScrollerComponent {

  dataSource: FactsDataSource;

  constructor(private factService: FactService) {
    this.dataSource = new FactsDataSource(factService);
  }

}
```

And we're done! Everything from here on out is formatting. I've rewritten my html to display the facts like so:

```html
<cdk-virtual-scroll-viewport itemSize="100" class="fact-scroll-viewport">
  <li *cdkVirtualFor="let fact of dataSource">

    <div *ngIf="fact" class="fact-item">
      <div class="fact-date">{{ fact.year }}</div>
      <div class="fact-text">{{ fact.text }}</div>
    </div>
    <div *ngIf="!fact">
      Loading ...
    </div>

  </li>
</cdk-virtual-scroll-viewport>

```


{% raw %}

<p class="file-desc"><span>fact-scroller.component.ts</span></p>

```typescript
@Component({
  selector: 'app-fact-scroller',
  templateUrl: './fact-scroller.component.html',
  styleUrls: ['./fact-scroller.component.scss']
})
export class FactScrollerComponent {

  dataSource: FactsDataSource;

  constructor(private factService: FactService) {
    this.dataSource = new FactsDataSource(factService);
  }

}
```

{% endraw %}

