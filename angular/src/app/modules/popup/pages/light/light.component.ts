import { Component, OnInit, OnDestroy } from '@angular/core';
import { WledService } from '../../services/wled.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-light',
  templateUrl: './light.component.html',
  styleUrls: ['./light.component.scss']
})
export class LightComponent implements OnInit, OnDestroy {

  state: any = {};
  address: string = '';
  stateNames: string[];
  stateCtrl: FormControl;

  constructor(private wled: WledService,
              private snackBar: MatSnackBar) { 
                this.stateCtrl = new FormControl('');
              }
  
  async ngOnInit() {
    
    const {address, state} = await this.wled.getLightDetails();
    this.address = address;
    this.handleLightState_(state);
    const savedStates = await this.wled.getSavedStates();
    this.stateNames = Object.keys(savedStates);
  }

  ngOnDestroy(): void {
    
  }

  private toast_(message: string) {
    this.snackBar.open(message, null, {duration: 1000});
  }

  private handleLightState_(state: any) {
    this.state = state;
  }

  openAddress() {
    chrome.tabs.create({url: `http://${this.address}`});
  }

  viewState() {
    console.log('viewState', this.stateCtrl.value);
    this.wled.viewState(this.stateCtrl.value).then(() => {
      this.toast_('Opened in tab')
      this.openAddress()
    });
  }

  saveState() {
    console.log('saveState', this.stateCtrl.value);
    this.wled.saveState(this.stateCtrl.value).then(() => this.toast_('Done!'));
  }

}
