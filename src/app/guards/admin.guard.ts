import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, CanActivate, CanLoad } from '@angular/router';

import { AutoUnsubscribe } from '../decorators/auto.unsubscribe.decorator';

import { AdminService } from '../services/admin.service';
import { LocalStorageService } from '../services/localstorage.service';

import { tokenNotExpired, JwtHelper } from 'angular2-jwt';

import { Subscription } from 'rxjs/Rx';


@AutoUnsubscribe()
@Injectable()
export class AdminGuard implements CanActivate, CanLoad {

  private checkAdminSubscription: Subscription;

  constructor(private router: Router,
              private adminService: AdminService,
              private localStorageService: LocalStorageService,
              @Inject(PLATFORM_ID) private platformId: Object) { }

  canActivate(): boolean {
    if (this.checkLocal()) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }

  canLoad(): boolean {
    if (this.checkLocal()) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }

  public checkLocal(): boolean {
    if (isPlatformBrowser(this.platformId) && this.localStorageService.get('user')) {
      if (!tokenNotExpired(undefined, <string> this.localStorageService.get('user'))) {
        this.localStorageService.remove('user');
        this.router.navigate(['/login']);
        return false;
      }

      try {
        if (new JwtHelper().decodeToken(<string> this.localStorageService.get('user')).data.admin === true) {
          return true;
        }
      } catch (err) {}
    }
    return false;
  }

  public checkRemote(): void {
    this.checkAdminSubscription = this.adminService.checkAdmin().subscribe(
      (res: boolean) => {
        if (!res) {
          this.router.navigate(['/login']);
        }
      }
    );
  }
}
