/// <reference path="../../interfaces/products/products.interface.ts" />
/// <reference path="../../interfaces/products/categories.interface.ts" />

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Log } from '../../decorators/log.decorator';
import { LogObservable } from '../../decorators/log.observable.decorator';
import { PageAnalytics } from '../../decorators/page.analytic.decorator';
import { AutoUnsubscribe } from '../../decorators/auto.unsubscribe.decorator';

import { ProductService } from '../../services/product.service';
import { MetaService } from '../../services/meta.service';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/debounceTime';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.pug',
  styleUrls: ['./products.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@Log()
@PageAnalytics('Products')
@AutoUnsubscribe()
export class ProductsComponent implements OnInit, OnDestroy {
  @LogObservable public categories: Observable<categoriesInterface.RootObject>;

  public products: Array<productsInterface.RootObject>;
  public productsFiltered: Array<productsInterface.RootObject>;
  // tslint:disable-next-line:no-inferrable-types
  public filterText: string = '';
  // tslint:disable-next-line:no-inferrable-types
  public filterCategoryText: string = '';
  public filterInput = new FormControl();
  public filterCategory = new FormControl();

  private filterInputSubscription: Subscription;
  private filterCategorySubscription: Subscription;
  private productSubscription: Subscription;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private productService: ProductService,
              private metaService: MetaService) {
  }

  ngOnInit(): void {
    this.metaService.addTags();

    this.getProducts();
    this.getCategories();

    this.filterInputSubscription = this.filterInput
      .valueChanges
      .debounceTime(250)
      .subscribe(term => {
        this.filterText = term;
        this.filterProducts();
      });

    this.filterCategorySubscription = this.filterCategory
      .valueChanges
      .subscribe(category => {
        this.filterCategoryText = category;
        this.filterProducts();
      });
  }

  ngOnDestroy(): void {
    // pass
  }

  private getProducts(): void {
    this.productSubscription = this.productService.products(Infinity).subscribe(
      (res: Array<productsInterface.RootObject>) => {
        this.products = res;
        this.filterProducts();
      }
    );
  }

  private filterProducts(): void {
    if (this.filterText !== '' && this.filterCategoryText !== '') {
      this.productsFiltered = this.products.filter(
        product => product.name.toLowerCase().includes(this.filterText.toLowerCase()) &&
        product.category === this.filterCategoryText
      );
    } else if (this.filterText !== '') {
      this.productsFiltered = this.products.filter(product => product.name.toLowerCase().includes(this.filterText.toLowerCase()));
    } else if (this.filterCategoryText !== '') {
      this.productsFiltered = this.products.filter(product => product.category === this.filterCategoryText);
    } else {
      this.productsFiltered = this.products;
    }
    this.changeDetectorRef.markForCheck();
  }

  private getCategories(): void {
    this.categories = this.productService.categories();
  }

  public reset(): void {
    this.filterInput.setValue('');
    this.filterCategory.setValue('');
    this.filterText = '';
    this.filterCategoryText = '';

    this.changeDetectorRef.markForCheck();
  }

  public trackByFn(index: number, item: productsInterface.RootObject | categoriesInterface.RootObject): string {
    return(item._id);
  }
}
