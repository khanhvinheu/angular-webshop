import {Component, OnInit, OnDestroy, Input, NgZone} from '@angular/core';
import {trigger, state, style, transition, animate} from '@angular/animations';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

import {Notification} from '../../interfaces/notifications/notification.type';

import {NotificationsService} from '../../services/notifications.service';


@Component({
  selector: 'app-notification',
  animations: [
    trigger('enterLeave', [
      state('fromRight', style({opacity: 1, transform: 'translateX(0)'})),
      transition('* => fromRight', [
        style({opacity: 0, transform: 'translateX(5%)'}),
        animate('400ms ease-in-out')
      ]),
      state('fromRightOut', style({opacity: 0, transform: 'translateX(-5%)'})),
      transition('fromRight => fromRightOut', [
        style({opacity: 1, transform: 'translateX(0)'}),
        animate('300ms ease-in-out')
      ]),

      state('fromLeft', style({opacity: 1, transform: 'translateX(0)'})),
      transition('* => fromLeft', [
        style({opacity: 0, transform: 'translateX(-5%)'}),
        animate('400ms ease-in-out')
      ]),
      state('fromLeftOut', style({opacity: 0, transform: 'translateX(5%)'})),
      transition('fromLeft => fromLeftOut', [
          style({opacity: 1, transform: 'translateX(0)'}),
          animate('300ms ease-in-out')
      ]),

      state('scale', style({opacity: 1, transform: 'scale(1)'})),
      transition('* => scale', [
        style({opacity: 0, transform: 'scale(0)'}),
        animate('400ms ease-in-out')
      ]),
      state('scaleOut', style({opacity: 0, transform: 'scale(0)'})),
      transition('scale => scaleOut', [
        style({opacity: 1, transform: 'scale(1)'}),
        animate('400ms ease-in-out')
      ]),

      state('rotate', style({opacity: 1, transform: 'rotate(0deg)'})),
      transition('* => rotate', [
        style({opacity: 0, transform: 'rotate(5deg)'}),
        animate('400ms ease-in-out')
      ]),
      state('rotateOut', style({opacity: 0, transform: 'rotate(-5deg)'})),
      transition('rotate => rotateOut', [
        style({opacity: 1, transform: 'rotate(0deg)'}),
        animate('400ms ease-in-out')
      ])
    ])
  ],
  templateUrl: './notification.component.pug',
  styleUrls: ['./notification.component.styl']
})

export class NotificationComponent implements OnInit, OnDestroy {

  @Input() public timeOut: number;
  @Input() public showProgressBar: boolean;
  @Input() public pauseOnHover: boolean;
  @Input() public clickToClose: boolean;
  @Input() public maxLength: number;
  @Input() public theClass: string;
  @Input() public rtl: boolean;
  @Input() public animate: string;
  @Input() public position: number;
  @Input() public item: Notification;


  // Progress bar variables
  public progressWidth = 0;
  public safeSvg: SafeHtml;

  private stopTime = false;
  private timer: any;
  private steps: number;
  private speed: number;
  private count = 0;
  private start: any;

  private diff: any;
  private icon: string;

  constructor(private notificationService: NotificationsService,
              private domSanitizer: DomSanitizer,
              private zone: NgZone) {}

  ngOnInit(): void {
    if (this.animate) {
      this.item.state = this.animate;
    }
    if (this.item.override) {
      this.attachOverrides();
    }
    if (this.timeOut !== 0) {
      this.startTimeOut();
    }

    this.safeSvg = this.domSanitizer.bypassSecurityTrustHtml(this.icon || this.item.icon);
  }

  startTimeOut(): void {
    this.steps = this.timeOut / 10;
    this.speed = this.timeOut / this.steps;
    this.start = new Date().getTime();
    this.zone.runOutsideAngular(() => this.timer = setTimeout(this.instance, this.speed));
  }

  onEnter(): void {
    if (this.pauseOnHover) {
      this.stopTime = true;
    }
  }

  onLeave(): void {
    if (this.pauseOnHover) {
      this.stopTime = false;
      setTimeout(this.instance, (this.speed - this.diff));
    }
  }

  setPosition(): number {
    return this.position !== 0 ? this.position * 90 : 0;
  }

  onClick($e: MouseEvent): void {
    this.item.click!.emit($e);

    if (this.clickToClose) {
      this.remove();
    }
  }

  // Attach all the overrides
  attachOverrides(): void {
    Object.keys(this.item.override).forEach(a => {
      if (this.hasOwnProperty(a)) {
        (<any>this)[a] = this.item.override[a];
      }
    });
  }

  ngOnDestroy(): void {
      clearTimeout(this.timer);
  }

  private instance = () => {
    this.zone.runOutsideAngular(() => {
      this.zone.run(() => this.diff = (new Date().getTime() - this.start) - (this.count * this.speed));

      if (this.count++ === this.steps) {
        this.zone.run(() => this.remove());
      } else if (!this.stopTime) {
        if (this.showProgressBar) {
          this.zone.run(() => this.progressWidth += 100 / this.steps);
        }

        this.timer = setTimeout(this.instance, (this.speed - this.diff));
      }
    });
  }

  private remove() {
    if (this.animate) {
      this.item.state = this.animate + 'Out';
      this.zone.runOutsideAngular(() => {
        setTimeout(() => {
          this.zone.run(() => this.notificationService.set(this.item, false));
        }, 310);
      });
    } else {
      this.notificationService.set(this.item, false);
    }
  }
}
