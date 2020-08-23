import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { takeUntil, map, tap } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';
import { MessagingService } from 'src/app/services/messaging.service';
import {MatSnackBar} from '@angular/material/snack-bar';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass']
})
export class SettingsComponent implements OnInit, OnDestroy {

  private readonly onDestroy$: Subject<void>
  ipCtrl: FormControl;
  actDectCtrl: FormControl;
  
  constructor(private messaging: MessagingService,
              private snackBar: MatSnackBar) {
    this.onDestroy$ = new Subject<void>();
    this.ipCtrl = new FormControl('', [Validators.required]);
    this.actDectCtrl = new FormControl(false);
  }

  async ngOnInit() {
    
    const details = await this.messaging.sendMessage({type: 'getLightDetails'});
    console.log('details', details);
    this.ipCtrl.setValue(details['address']);
    this.handleLightState_(details.state);
    

    const meetConfig = await this.messaging.sendMessage({type: 'getMeetDetectionConfig'});
    this.actDectCtrl.setValue(meetConfig.activityDetection);
    this.actDectCtrl.valueChanges.pipe(takeUntil(this.onDestroy$)).subscribe((s) => this.activityDetectionStateChanged(s));
  }

  private handleLightState_(state: any) {
    console.log('handleLightState', state);
    if (state && state.error) {
      console.log('setting error state', state);
      this.ipCtrl.setErrors({'notfound': true});
      this.ipCtrl.markAsTouched();
      this.toast_('Could not connect to light');
    } else {
      this.toast_('Connected!');
    }
  }

  private toast_(message: string) {
    this.snackBar.open(message, null, {duration: 1000});
  }

  activityDetectionStateChanged(newState) {
    console.log('activityDetectionStateChanged', newState);
    this.messaging.sendMessage({type: 'setActivityDetection', shouldDetect: newState}).then(() => this.toast_('Saved!'));
    
  }

  getIpCtrlError() {
    if (this.ipCtrl.errors.notfound) {
      return 'Failed to connect';
    }
    return 'Required';
  }

  async saveIpAddress() {
    const newState = await this.messaging.sendMessage({type: 'setLightIp', address: this.ipCtrl.value});
    console.log('newState', newState);
    this.handleLightState_(newState);
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

}
