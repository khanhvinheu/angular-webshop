import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HeaderModule } from '../main/header/header.module';
import { FilterPipeModule } from '../../pipes/pipe.filter.module';

import { ProductsComponent } from './products.component';

import { LazyImageModule } from '../../directives/lazy.image.module';

@NgModule({
  declarations: [
    ProductsComponent
  ],
  imports: [
    HeaderModule,
    FilterPipeModule,
    LazyImageModule,

    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(
      [
        {
          path: '',
          component: ProductsComponent,
          pathMatch: 'full'
        }
      ]
    )
  ]
})
export class ProductsModule {}
