import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HeaderModule } from '../main/header/header.module';
import { FilterPipeModule } from '../../pipes/filter.pipe.module';
import { HighlightPipeModule } from '../../pipes/highlight.pipe.module';
import { NotificationsModule } from '../notification/notification.module';

import { ImageCropperModule } from 'ng2-img-cropper';

import { AdminComponent } from './admin.component';
import { AdminCategoriesComponent } from './categories/categories.component';
import { AdminProductsComponent } from './products/products.component';
import { AdminAddProductComponent } from './products/add/add.product.component';
import { AdminEditProductComponent } from './products/edit/edit.product.component';
import { AdminStatsComponent } from './stats/stats.component';

import { ProductService } from '../../services/product.service';
import { UserService } from '../../services/user.service';
import { AdminService } from '../../services/admin.service';
import { MetaService } from '../../services/meta.service';

import { AdminGuard } from '../../guards/admin.guard';

const routes: Routes =
  [
    {
      path: '',
      component: AdminComponent,
      children: [
        {
          path: '',
          redirectTo: 'categories',
          pathMatch: 'full'
        },
        {
          path: 'categories',
          component: AdminCategoriesComponent
        },
        {
          path: 'products',
          component: AdminProductsComponent
        },
        {
          path: 'addproduct',
          component: AdminAddProductComponent
        },
        {
          path: 'editproduct/:id',
          component: AdminEditProductComponent
        },
        {
          path: 'stats',
          component: AdminStatsComponent
        }
      ]
    }
  ];

@NgModule({
  declarations: [
    AdminComponent,
    AdminCategoriesComponent,
    AdminProductsComponent,
    AdminAddProductComponent,
    AdminEditProductComponent,
    AdminStatsComponent
  ],
  imports: [
    HeaderModule,
    FilterPipeModule,
    HighlightPipeModule,
    NotificationsModule,

    ImageCropperModule,

    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule.forChild(
      routes
    )
  ],
  providers: [
    ProductService,
    UserService,
    MetaService,
    AdminService,
    AdminGuard
  ],
  exports: [
    AdminComponent
  ]
})
export class AdminModule {}
