import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PopupComponent } from './pages/popup/popup.component';
import { PopupRoutingModule } from './popup-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { SettingsComponent } from './pages/settings/settings.component';
import { LightComponent } from './pages/light/light.component';

@NgModule({
  declarations: [PopupComponent, SettingsComponent, LightComponent],
  imports: [CommonModule, PopupRoutingModule, ReactiveFormsModule, FormsModule, MaterialModule],
  exports: [FormsModule, ReactiveFormsModule, MaterialModule]
})
export class PopupModule {}
