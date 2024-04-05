import { Component } from '@angular/core';

@Component({
  selector: 'app-cargando',
  templateUrl: './cargando.component.html',
  styleUrls: ['./cargando.component.css']
})
export class CargandoComponent {
  isLoading :boolean=true;
  auth: any;
  
    ngOnInit() {
      // Simulando una carga de datos
      setTimeout(() => {
        this.isLoading = false;
      }, 4000);
    }

}
