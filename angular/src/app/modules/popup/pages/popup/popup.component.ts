import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { TAB_ID } from '../../../../providers/tab-id.provider';

@Component({
  selector: 'app-popup',
  templateUrl: 'popup.component.html',
  styleUrls: ['popup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PopupComponent implements OnInit {
  
  private readonly onDestroy$: Subject<void>
  constructor(@Inject(TAB_ID) readonly tabId: number) {
    this.onDestroy$ = new Subject<void>();
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.onDestroy$.next();
  }

}
