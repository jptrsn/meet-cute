import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PopupComponent } from './pages/popup/popup.component';
import { PopupRoutingModule } from './popup-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  declarations: [PopupComponent],
  imports: [CommonModule, PopupRoutingModule, ReactiveFormsModule, FormsModule],
  exports: [FormsModule, ReactiveFormsModule]
})
export class PopupModule {}
