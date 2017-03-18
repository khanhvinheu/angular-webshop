import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HeaderModule } from '../header/header.module';

import { NotFoundComponent } from './notfound.component';

@NgModule({
  declarations: [
    NotFoundComponent
  ],
  imports: [
    HeaderModule,
    CommonModule,
    RouterModule.forChild(
      [
        {
          path: '',
          component: NotFoundComponent,
          pathMatch: 'full'
        }
      ]
    )
  ]
})
export class NotFoundModule {}
