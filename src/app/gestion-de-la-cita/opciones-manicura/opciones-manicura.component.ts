import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UsuarioService } from 'src/app/service/usuario.service';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';

declare var ePayco: any;

@Component({
  selector: 'app-opciones-manicura',
  templateUrl: './opciones-manicura.component.html',
  styleUrls: ['./opciones-manicura.component.css']
})
export class OpcionesManicuraComponent implements OnInit {
  registrando:boolean=false;
  manicuristas: any[] = [];
  servicios: any[] = [];
  filas: any[] = [];
  tipoServicioSeleccionado: string = '';
  manicuristaSeleccionada: { id_manicurista: number, nombre: string, favorito: boolean } | null = null;
  ubicacionServicio: string = '';
  duracionEnHoras: number = 0;
  opcionSeleccionada: string = '';
  modalAbierta: boolean = false;
  calendarioModalAbierta: boolean = false;
  siguienteHabilitado: boolean = false;
  usuarioInfo: any;
  favoritoSeleccionado: boolean = false;
  fechaHoraSeleccionada: string = '';
  horaSeleccionada: string = '';
  horasDisponibles: string[] = [];
  idServicio: number = 0;
  

  @ViewChild('fechaInput', { static: true }) fechaInput!: ElementRef;

  constructor(private usuarioService: UsuarioService, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.usuarioService.getManicuristas().subscribe(
      (manicuristas) => {
        this.manicuristas = manicuristas.map(manicurista => ({ ...manicurista, favorito: false }));
      },
      (error) => {
        console.error('Error al obtener manicuristas:', error);
      }
    );

    this.loadEPaycoScript();

    this.usuarioService.usuarioInfo$.subscribe(usuario => {
      this.usuarioInfo = usuario;
    });

    this.usuarioService.getConfiguracion().subscribe(
      (response) => {
        if (Array.isArray(response.servicios)) {
          this.servicios = response.servicios;
          this.filas = this.chunkArray(this.servicios, 4);
        } else {
          console.error('La propiedad servicios de la respuesta de getConfiguracion no es un arreglo:', response.servicios);
        }
      },
      (error) => {
        console.error('Error al obtener servicios:', error);
      }
    );

    this.actualizarHorasDisponibles();
  }

  actualizarHorasDisponibles() {
    const horasDisponibles = [];
    for (let i = 9; i <= 17; i++) {
      const hora = i < 10 ? `0${i}:00` : `${i}:00`;
      horasDisponibles.push(hora);
    }
    this.horasDisponibles = horasDisponibles;
    this.horaSeleccionada = this.horasDisponibles[0];
  }

  loadEPaycoScript() {
    const script = document.createElement('script');
    script.src = 'https://checkout.epayco.co/checkout.js';
    script.onload = () => {
      console.log('Script de ePayco cargado correctamente.');
    };
    document.body.appendChild(script);
  }

  chunkArray(arr: any[], size: number): any[] {
    const newArr = [];
    for (let i = 0; i < arr.length; i += size) {
      newArr.push(arr.slice(i, i + size));
    }
    return newArr;
  }

  abrirModal(tipoServicio: string) {
    this.tipoServicioSeleccionado = tipoServicio;
    this.modalAbierta = true;
  }

  abrirCalendarioModal() {
    this.calendarioModalAbierta = true;
  }

  cerrarModal() {
    this.modalAbierta = false;
  }

  cerrarCalendarioModal() {
    this.calendarioModalAbierta = false;
  }

  cerrarTodasModales() {
    this.modalAbierta = false;
    this.calendarioModalAbierta = false;
  }

  seleccionarManicurista(manicurista: any) {
    this.manicuristaSeleccionada = manicurista;
    this.verificarSeleccion();
  }

  marcarComoFavorita(manicurista: any) {
    manicurista.favorito = !manicurista.favorito;
  }

  seleccionarTipoServicio(tipoServicio: string) {
    this.ubicacionServicio = tipoServicio;
    this.calcularDuracionEnHoras();
    this.verificarSeleccion();
    this.opcionSeleccionada = tipoServicio;
  }

  seleccionarServicio(servicio: any) {
    this.idServicio = servicio.id_servicio;
    this.abrirModal(servicio.tipo_servicio);
  }

  calcularDuracionEnHoras() {
    if (this.tipoServicioSeleccionado === 'tradicional') {
      this.duracionEnHoras = (this.ubicacionServicio === 'manos' || this.ubicacionServicio === 'pies') ? 1 : 2;
    } else if (this.tipoServicioSeleccionado === 'semipermanente') {
      this.duracionEnHoras = (this.ubicacionServicio === 'manos') ? 2 : 1.5;
    } else if (this.tipoServicioSeleccionado === 'acrilicas') {
      this.duracionEnHoras = (this.ubicacionServicio === 'manos') ? 3 : 2.5;
    }

    return this.duracionEnHoras;
  }

  verificarSeleccion() {
    this.siguienteHabilitado = !!this.tipoServicioSeleccionado && !!this.manicuristaSeleccionada && !!this.ubicacionServicio;
  }

  siguientePaso() {
    if (this.siguienteHabilitado) {
      if (!this.manicuristaSeleccionada || !('id_manicurista' in this.manicuristaSeleccionada)) {
        console.error('Manicurista seleccionado inválido');
        return;
      }

      this.cerrarModal();
      this.abrirCalendarioModal();
    }
  }
agendarCita() {
  if (this.siguienteHabilitado) {

    console.log(this.siguienteHabilitado);
    
    const fechaHoraSeleccionada = new Date(this.fechaHoraSeleccionada);
    const fechaHoraFin = new Date(fechaHoraSeleccionada.getTime() + this.duracionEnHoras * 60 * 60 * 1000);
    const fechaFinFormated=this.formatDateTime(fechaHoraFin)
 
 

    const datosCita = {
      id_usuario: this.usuarioInfo.id,
      id_manicurista: this.manicuristaSeleccionada?.id_manicurista,
      tipo_servicio: this.idServicio,
      ubicacion_servicio: this.ubicacionServicio,
      duracion_en_horas: this.calcularDuracionEnHoras(),
      favorito: this.manicuristaSeleccionada?.favorito,
      fecha_del_servicio: this.formatDateTime(fechaHoraSeleccionada),
      estado: 'programada'
      
    };

  const fechaInicio=datosCita.fecha_del_servicio.toString()
  const fechaFin=fechaFinFormated.toString()
    console.log("fechainicio", fechaInicio);
    console.log("fechafin", fechaFin);
    
    
console.log("duracion",this.duracionEnHoras);


    console.log('Datos de la cita a enviar:', datosCita);

   
    this.usuarioService.verificarDisponibilidadCita(fechaInicio,fechaFin).subscribe(
      (response) => {
        if (response.disponible) {

          
console.log("siii");
this.registrando=true;
this.usuarioService.obtenerDetallesTransaccion(this.idServicio, this.usuarioInfo.id).subscribe(
  (data) => {
    console.log('Detalles de la transacción:', data);
    this.iniciarProcesoDePago(data, this.idServicio);
    // Marcar la cita como agendada después de completar el pago
    this.usuarioService.createCita(datosCita).subscribe(
      (response) => {
        Swal.fire({
          title: '¡Casi terminas!',
          text: 'completa el metodo de pago!',
          icon: 'success',
          iconColor: '#631878'
        });
        this.registrando=false;
      },
      (error) => {
        console.error('Error al agendar la cita:', error);
        Swal.fire('Error', 'Hubo un problema al agendar la cita. Por favor, inténtalo de nuevo.', 'error');
        this.registrando=false;
      },
      () => {
        this.cerrarTodasModales();
        this.favoritoSeleccionado = true;
      }
    );
  },
  (error) => {
    console.error('Error al obtener detalles de la transacción:', error);
  }
);




          
        } else {
          Swal.fire('Error', 'La fecha y hora seleccionadas ya están ocupadas. Por favor, elige otro horario.', 'error');
        }
      },
      (error) => {
        console.error('Error al verificar la disponibilidad de citas:', error);
        Swal.fire('Error', 'Hubo un problema al verificar la disponibilidad de citas. Por favor, inténtalo de nuevo.', 'error');
      }
    );
  }
}

  

  formatDateTime(date: any): string {
    if (!(date instanceof Date)) {
      console.error('El valor proporcionado no es una instancia de Date:', date);
      return '';
    }
    const formattedDate = this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss', 'America/Bogota');
    return formattedDate ? formattedDate : '';
  }

  realizarPago() {
    this.usuarioService.obtenerDetallesTransaccion(this.idServicio, this.usuarioInfo.id).subscribe(
      (data) => {
        console.log('Detalles de la transacción:', data);
        this.iniciarProcesoDePago(data, this.idServicio);
      },
      (error) => {
        console.error('Error al obtener detalles de la transacción:', error);
      }
    );
  }

  iniciarProcesoDePago(data: any, idServicio: number) {
    var handler = ePayco.checkout.configure({
      key: 'a6f86157c75795fdc8e81242b0e20aad',
      test: true
    });

    data.idServicio = idServicio;

    handler.open(data);
  }
}
