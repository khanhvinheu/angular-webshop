import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HeaderModule } from '../../main/header/header.module';
import { NotificationsModule } from '../../notification/notification.module';

import { RegisterComponent } from './register.component';

import { PostalcodeService } from '../../../services/postalcode.service';
import { UserService } from '../../../services/user.service';
import { MetaService } from '../../../services/meta.service';
import { AnalyticsService } from '../../../services/analytics.service';

@NgModule({
  declarations: [
    RegisterComponent
  ],
  imports: [
    HeaderModule,
    NotificationsModule,

    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(
      [
        {
          path: '',
          component: RegisterComponent,
          pathMatch: 'full'
        }
      ]
    )
  ],
  providers: [
    PostalcodeService,
    UserService,
    MetaService,
    AnalyticsService
  ]
})
export class RegisterModule {}
