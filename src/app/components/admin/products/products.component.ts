/// <reference path="../../../interfaces/products/products.interface.ts" />
/// <reference path="../../../interfaces/products/categories.interface.ts" />

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';

import { AutoUnsubscribe } from '../../../decorators/auto.unsubscribe.decorator';

import { AdminService } from '../../../services/admin.service';
import { ProductService } from '../../../services/product.service';
import { MetaService } from '../../../services/meta.service';

import { AdminGuard } from '../../../guards/admin.guard';

import { url } from '../../../../constants';

import { Subscription } from 'rxjs/Rx';

import 'rxjs/add/operator/debounceTime';

import swal from 'sweetalert2';

@Component({
  selector: 'app-admin-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})

@AutoUnsubscribe()
export class AdminProductsComponent implements OnInit {

  // tslint:disable-next-line:no-inferrable-types
  public msg: string = 'Producten';
  public products: productsInterface.RootObject;

  public categories: categoriesInterface.RootObject;
  // tslint:disable-next-line:no-inferrable-types
  public filterText: string = '';
  // tslint:disable-next-line:no-inferrable-types
  public filterCategoryText: string = '';
  public filterInput = new FormControl();
  public filterCategory = new FormControl();

  private filterInputSubscription: Subscription;
  private filterCategorySubscription: Subscription;
  private productsSubscription: Subscription;
  private categoriesSubscription: Subscription;
  private deleteProductSubscription: Subscription;

  constructor(private adminService: AdminService,
              private adminGuard: AdminGuard,
              private productService: ProductService,
              private metaService: MetaService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.metaService.addTags();
    this.adminGuard.checkRemote();

    this.getProducts();
    this.getCategories();

    this.filterInputSubscription = this.filterInput
      .valueChanges
      .debounceTime(250)
      .subscribe(term => {
        this.filterText = term;
      });

    this.filterCategorySubscription = this.filterCategory
      .valueChanges
      .debounceTime(250)
      .subscribe(category => {
        this.filterCategoryText = category;
      });
  }

  private getProducts(): void {
    this.productsSubscription = this.productService.products(Infinity).subscribe(
      (res: productsInterface.RootObject) => {
        this.products = res;
      }
    );
  }

  private getCategories(): void {
    this.categoriesSubscription = this.productService.categories().subscribe(
      (res: categoriesInterface.RootObject) => {
        this.categories = res;
      }
    );
  }

  public preview(photo: string) {
    swal({
      confirmButtonClass: 'button',
      confirmButtonText: 'Ok',
      imageUrl: `${url}/assets/products/${photo}`
    }).then(() => {
      // pass
    }, (dismiss) => {
      // pass
    });
  }

  public reset() {
    this.filterInput.setValue('');
    this.filterCategory.setValue('');
    this.filterText = '';
    this.filterCategoryText = '';
  }

  public delete(id: string, name: string): void {
    swal({
      title: `${name} verwijderen?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'button',
      cancelButtonClass: 'button',
      confirmButtonText: 'Verwijderen',
      cancelButtonText: 'Annuleer',
    }).then(() => {
      this.deleteProductSubscription = this.adminService.deleteProduct({'id': id}).subscribe(
        (res: genericInterface.RootObject) => {
          if (res.error === 'false') {
            this.getProducts();

            swal({
              title: 'Verwijderd!',
              type: 'success',
              confirmButtonClass: 'button',
            }).then(() => {
              // pass
            }, (dismiss) => {
              // pass
            });
          }
        }
      );
    }, (dismiss) => {
      // pass
    });
  }

  public trackByFn(index: number, item): string {
    return(item._id);
  }
}

