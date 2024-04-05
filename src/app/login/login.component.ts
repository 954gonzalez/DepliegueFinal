import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../Auth/auth.service';
import { UsuarioService } from '../service/usuario.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  registrandoSpinner = false;
  isChecked = false;
  usuario = {
    nombre: '',
    apellido: '',
    email: '',
    contrasena: '',
    rol: 'cliente'
  };
  usuarioLg = {
    email: '',
    contrasena: '',
  };
  registrando = false; // Bandera para indicar si se está intentando registrar

  constructor(private usuarioService: UsuarioService, public auth: AuthService, private router: Router) {}

  iniciarSesion() {
    this.registrandoSpinner=true;
    console.log('Intentando iniciar sesión:', this.usuarioLg);
    this.registrando = true; // Establecer registrando a true cuando se intenta iniciar sesión
    if (!this.usuarioLg.email || !this.usuarioLg.contrasena) {
      let mensaje = "Por favor, complete los siguientes campos obligatorios:";
      if (!this.usuarioLg.email) mensaje += " Email";
      if (!this.usuarioLg.contrasena) mensaje += " Contraseña";
      Swal.fire({
        title: 'Error',
        text: mensaje,
        icon: 'error',
        iconColor: '#631878',
        confirmButtonColor: '#631878'
      });
      
      return;
    }
    this.usuarioService.loginUser(this.usuarioLg.email, this.usuarioLg.contrasena).subscribe(
      (response:any) => {
        this.auth.login(response.token)
        this.router.navigate(['/Inicio']);
        this.registrandoSpinner=false;
      },
      (error) => {
        console.error('Error al iniciar sesión:', error);
        if (error.status === 401) {
          console.error('Correo o contraseña incorrectos');
          Swal.fire({
            title: 'Error',
            text: 'Hubo un error al iniciar sesión el usuario. Por favor, inténtalo de nuevo.',
            icon: 'error',
            iconColor: '#631878',
            confirmButtonColor: '#631878'
          });
        }
        this.registrandoSpinner=false;
      }
      
    );
  }
  
  registrarUsuario() {
    this.registrandoSpinner=true;
    console.log('Intentando registrar usuario:', this.usuario);
    this.registrando = true; // Marcamos que se está intentando registrar
    if (!this.usuario.nombre || !this.usuario.apellido || !this.usuario.email || !this.usuario.contrasena) {
      let mensaje = "Por favor, complete los siguientes campos obligatorios:";
      if (!this.usuario.nombre) mensaje += " Nombres";
      if (!this.usuario.apellido) mensaje += " Apellidos";
      if (!this.usuario.email) mensaje += " Email";
      if (!this.usuario.contrasena) mensaje += " Contraseña";
      Swal.fire({
        title: 'Error',
        text: mensaje,
        icon: 'error',
        iconColor: '#631878',
        confirmButtonColor: '#631878'
      });
      this.registrandoSpinner=false;
      return;
    }
    this.usuarioService.createUser(this.usuario).subscribe(
      (response) => {
        console.log('Usuario registrado con éxito:', response);
        // Después de registrar, inicia sesión
        this.usuarioService.loginUser(this.usuario.email, this.usuario.contrasena).subscribe(
          (loginResponse:any) => {
            console.log('Inicio de sesión exitoso después del registro:', loginResponse);
            this.auth.login(loginResponse.token)
            this.router.navigate(['/Inicio']);
            this.registrandoSpinner=false;
          },
          (loginError) => {
            console.error('Error al iniciar sesión después del registro:', loginError);
          }
          
        );

      },
      (error) => {
        console.error('Error al registrar usuario:', error);
        Swal.fire({
          title: 'Error',
          text: 'Hubo un error al registrar el usuario. Por favor, inténtalo de nuevo.',
          icon: 'error',
        });
        this.registrandoSpinner=false;
      }
    ).add(() => {
      this.registrando = false; // Reiniciamos la bandera cuando se completa el registro
    });
  }  
}
