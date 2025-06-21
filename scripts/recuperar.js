/**
 * 📦 recuperar.js
 * 
 * Descripción:
 * Este archivo maneja la lógica de recuperación de contraseña en TianguiStore. 
 * Permite al usuario ingresar su correo electrónico para recibir un enlace de recuperación si el correo está registrado en el sistema.
 * Realiza validaciones del correo electrónico y maneja los mensajes de error y éxito en la interfaz.
 * 
 * Funciones:
 * - Validación del correo electrónico.
 * - Envío del correo de recuperación al backend.
 * - Manejo de mensajes de error y éxito.
 * 
 * Autor: I.S.C. Erick Renato Vega Ceron
 * Fecha de Creación: Mayo 2025
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("recuperarForm");
  const emailInput = document.getElementById("email");
  const mensajeError = document.getElementById("mensajeError");
  const mensajeExito = document.getElementById("mensajeExito");

  // Evento de envío del formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevenir la recarga de la página

    ocultarMensajes(); // Ocultar mensajes previos

    const email = emailInput.value.trim(); // Obtener el valor del campo de correo
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para validar el correo

    // Validar el correo electrónico
    if (!regexCorreo.test(email)) {
      emailInput.classList.add("is-invalid"); // Añadir clase para mostrar error en el campo
      mostrarError("❌ Correo electrónico no válido."); // Mostrar mensaje de error
      return;
    }

    // Enviar solicitud al backend para la recuperación de la contraseña
    try {
      const res = await fetch("/auth/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo_electronico: email }) // Enviar correo como cuerpo de la solicitud
      });

      const data = await res.json(); // Parsear la respuesta JSON

      // Manejar respuesta del servidor
      if (!res.ok) {
        mostrarError(data.message || "❌ No se pudo enviar el correo."); // Mostrar error si la respuesta no es OK
        return;
      }

      mostrarExito("📩 Se ha enviado un enlace de recuperación si el correo está registrado."); // Mostrar éxito
    } catch (err) {
      console.error("❌ Error en recuperación:", err);
      mostrarError("❌ Error al conectar con el servidor."); // Mostrar error si la solicitud falla
    }
  });

  // Función para mostrar mensaje de error
  function mostrarError(msg) {
    mensajeError.textContent = msg;
    mensajeError.classList.remove("d-none"); // Mostrar el mensaje de error
  }

  // Función para mostrar mensaje de éxito
  function mostrarExito(msg) {
    mensajeExito.textContent = msg;
    mensajeExito.classList.remove("d-none"); // Mostrar el mensaje de éxito
  }

  // Función para ocultar los mensajes de error y éxito
  function ocultarMensajes() {
    mensajeError.classList.add("d-none"); // Ocultar mensaje de error
    mensajeExito.classList.add("d-none"); // Ocultar mensaje de éxito
    emailInput.classList.remove("is-invalid"); // Eliminar la clase de error del campo de correo
  }
});
