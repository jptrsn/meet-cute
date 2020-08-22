import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { bindCallback, Subject, BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TAB_ID } from '../../../../providers/tab-id.provider';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-popup',
  templateUrl: 'popup.component.html',
  styleUrls: ['popup.component.scss']
})
export class PopupComponent implements OnInit, OnDestroy {
  
  private readonly onDestroy$: Subject<void>
  ipCtrl: FormControl;

  constructor(@Inject(TAB_ID) readonly tabId: number) {
    this.onDestroy$ = new Subject<void>();
    this.ipCtrl = new FormControl('');
  }

  ngOnInit() {
    chrome.runtime.sendMessage({type: 'getLightIp'}, (address) => {
      this.ipCtrl.setValue(address);
    });
  }

  saveIpAddress() {
    chrome.runtime.sendMessage({type: 'setLightIp', address: this.ipCtrl.value}, (resp) => {
      console.log('state', resp);
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

}
