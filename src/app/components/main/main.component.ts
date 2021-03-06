import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

import { TransferState } from '../../modules/transfer-state/transfer-state';

import { AutoUnsubscribe } from '../../decorators/auto.unsubscribe.decorator';

import { AnalyticsService } from '../../services/analytics.service';

import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-root',
  templateUrl: './main.component.pug',
  styleUrls: ['./main.component.styl'],
  changeDetection: ChangeDetectionStrategy.Default
})

@AutoUnsubscribe()
export class MainComponent implements OnInit, OnDestroy {

  private routerEventsSubscription: Subscription;
  private analyticSubscription: Subscription;

  constructor(private transferState: TransferState,
              private router: Router,
              private analyticsService: AnalyticsService,
              @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.routerEventsSubscription = this.router.events.subscribe(path => {
      if (path instanceof NavigationEnd) {
        if (isPlatformBrowser(this.platformId)) {
          window.scroll(0, 0);
        }
      }
    });

    this.transferState.set('cached', true);

    this.analyticSubscription = this.analyticsService.visit('Main').subscribe();
  }

  ngOnDestroy(): void {
    // pass
  }

  public scrollTo(event: any): void {
    const windowRef = event.view;
    const documentRef = event.view.document;

    const startingY = windowRef.pageYOffset;
    const elementY = windowRef.pageYOffset + documentRef.querySelector('body').getBoundingClientRect().top;
    const targetY = documentRef.body.scrollHeight - elementY < windowRef.innerHeight ?
      documentRef.body.scrollHeight - windowRef.innerHeight :
      elementY;
    const diff = targetY - 50 - startingY;

    const easing = (t: number) => {
      return t < .5 ? 4 * t * t * t : (t  - 1)  * (2 * t - 2)  *  (2 * t - 2) + 1;
    };

    let start: number;

    if (!diff) {
      return;
    }

    windowRef.requestAnimationFrame(function step(timestamp: number) {
      if (!start) {
        start = timestamp;
      }
      const time = timestamp - start;
      let percent = Math.min(time / 250, 1);
      percent = easing(percent);
      windowRef.scrollTo(0, startingY + diff * percent);
      if (time < 250) {
        windowRef.requestAnimationFrame(step);
      }
    });
  }
}
