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


Here, we define a `cdk-virtual-scroll-viewport` to act as our virtual scroller, within we declare the list items by attaching `*cdkVirtualFor`, which is analogous as using `*ngFor`

In order for the component to properly size its internal scroller, we also need to tell it how tall (in pixels) each item will be. This is done using `itemSize`. So, `itemSize="100"` tells it to allocate 100 pixels per line item.

That's
