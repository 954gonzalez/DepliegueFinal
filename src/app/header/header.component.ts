import { Component, HostListener, OnInit, ElementRef } from '@angular/core';
import { UsuarioService } from '../service/usuario.service';
import { UsuarioSharedServiceService } from '../serviceUsuarioSharedService/usuario-shared-service.service';
import { GravatarConfig } from 'ngx-gravatar';
import { AuthService } from '../Auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  registrando = false;
  usuarioInfo: any;
  isMenuOpen = false;
  gravatarConfig: GravatarConfig;
  mostrarBotonCerrarSesion = false;
  modalAbierta: boolean = false;
  selectedFile: File | null = null;
  selectedFileName: string | null = null; 
 manicuristaInfo: any; // Información de la manicurista
  showManicuristaSection: boolean = false; // Estado para mostrar/ocultar la sección de la manicurista
  constructor(
    private usuarioService: UsuarioService,
    private usuarioSharedService: UsuarioSharedServiceService,
    public auth: AuthService,
    private el: ElementRef,
  ) {
    // Obtén la configuración de Gravatar del servicio compartido
    this.gravatarConfig = this.usuarioSharedService.getGravatarConfig();
  }

  ngOnInit(): void {
    document.addEventListener('click', (event) => this.handleGlobalClick(event));
    this.usuarioService.usuarioInfo$.subscribe(usuario => {
      this.usuarioInfo = usuario;
    });

    this.checkWindowWidth();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.selectedFileName = this.selectedFile.name; // Actualizar el nombre del archivo seleccionado
    } else {
      this.selectedFileName = null; // Si no se selecciona ningún archivo, establecer selectedFileName como null
    }
  }  

  abrirModal() {
    this.modalAbierta = true;
  }
  
  cerrarModal() {
    this.modalAbierta = false;
  }
  
  openCloseMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  handleGlobalClick(event: Event): void {
    const target = event.target as HTMLElement;
    // Verificar si el clic ocurrió en el icono de cierre (x)
    if (target.closest('.closeHeader')) {
      this.closeMenu();
      return;
    }
  
    // Verificar si el clic ocurrió fuera del menú y del header
    if (!this.el.nativeElement.contains(target) && !target.closest('.icon__menu')) {
      this.isMenuOpen = false;
    }
  }
  
  onMouseLeave(): void {
    this.mostrarBotonCerrarSesion = false;
  }

  ngOnDestroy() {
    // Eliminar los eventos de clic al destruir el componente para evitar fugas de memoria
    document.removeEventListener('click', (event) => this.handleGlobalClick(event));
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.checkWindowWidth();
  }

  private checkWindowWidth(): void {
    if (window.innerWidth >= 760) {
      this.isMenuOpen = false;
    }
  }

  activoClass(event: MouseEvent): void {
    const elements = document.querySelectorAll('.lista3');
    elements.forEach((element) => element.classList.remove('activo'));
    (event.target as HTMLElement).classList.add('activo');
  }
  
  subirImagen(): void {
    this.selectedFileName = null;
    if (this.selectedFile && this.usuarioInfo) {
      const idUsuario = this.usuarioInfo.id;
      
  
      // Generar un número aleatorio único para incluirlo como parámetro en la URL de la imagen
      const randomParam = Math.random();
      
      Swal.fire({
        title: '¿Deseas actualizar la foto de perfil?',
        icon: 'question',
        iconColor:'#631878',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        confirmButtonColor:'#631878',
        cancelButtonText: 'No'
      }).then((result) => {
        
        if (result.isConfirmed) {
          this.registrando = true;
          if (this.selectedFile) {
            this.usuarioService.actualizarImagenUsuario(idUsuario, this.selectedFile)
              .subscribe(
                response => {
                  console.log('Imagen actualizada correctamente', response);
                  // Actualizar la URL de la imagen en el estado del componente con el parámetro único
                  this.usuarioInfo.fotoUsuario = `${response.fileUrl}?random=${randomParam}`;
                  // Actualizar la información del usuario en el servicio compartido
                  this.usuarioService.actualizarUsuarioInfo(this.usuarioInfo);
                  // Mostrar alerta de éxito
                  Swal.fire({
                    title: 'Éxito',
                    text: 'La imagen se ha actualizado correctamente',
                    icon: 'success',
                    iconColor:'#631878',
                    confirmButtonText: 'OK',
                    confirmButtonColor:'#631878'
                  });
                  this.registrando = false;
                },
                error => {
                  console.error('Error al actualizar la imagen', error);
                  Swal.fire({
                    title: 'Imagen no válida',
                      text: 'La imagen que has seleccionado no es válida. Por favor, selecciona una imagen correcta.',
                      icon: 'warning',
                      iconColor:'#631878',
                      confirmButtonText: 'OK',
                      confirmButtonColor:'#631878'
                  });
                  this.registrando = false;
                }
              );
          } else {
            console.error('El archivo seleccionado es nulo');
            // Mostrar alerta de error
            Swal.fire('¡Error!', 'No se ha seleccionado ninguna imagen', 'error');
          }
        } else {
          console.log('La actualización de la imagen fue cancelada por el usuario');
        }
      });
    } else {
      console.error('No se ha seleccionado ninguna imagen o no se ha obtenido información del usuario');
      // Mostrar alerta de error
      Swal.fire('¡Error!', 'No se ha seleccionado ninguna imagen o no se ha obtenido información del usuario', 'error');
    }
  }  
  
}
