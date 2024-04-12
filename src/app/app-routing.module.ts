import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EulerComponent } from './components/euler/euler.component';

const routes: Routes = [
  { path: 'euler', component:EulerComponent},
  { path: '**', redirectTo: 'euler'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
