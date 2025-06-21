/**
 * 🔐 login.js — Maneja inicio de sesión, validaciones y control de sesión
 * Autor: I.S.C. Erick Renato Vega Ceron — Adaptado a MaterializeCSS
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const rememberInput = document.getElementById("remember");
  const mensajeError = document.getElementById("mensajeError");
  const mensajeExito = document.getElementById("mensajeExito");

  // 🔒 Mostrar/ocultar contraseña
  const togglePasswordBtn = document.getElementById("togglePassword");
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener("click", () => {
      const input = passwordInput;
      const icon = togglePasswordBtn.querySelector("i");
      const visible = input.type === "text";
      input.type = visible ? "password" : "text";
      icon.classList.toggle("fa-eye", !visible);
      icon.classList.toggle("fa-eye-slash", visible);
    });
  }

  // 📨 Envío del formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarMensajes();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!validarFormulario(email, password)) return;

    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo_electronico: email,
          contrasena: password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        mostrarError(data.message || "❌ Credenciales incorrectas.");
        return;
      }

      // ✅ Guardar sesión
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      mostrarExito("Inicio de sesión exitoso ✅");

      // Redirección segura según permisos
      setTimeout(() => {
        const usuario = data.usuario;
        if (esAdministrador(usuario)) {
          window.location.href = "adminPanel.html";
        } else {
          window.location.href = "index.html";
        }
      }, 1500);
    } catch (error) {
      console.error("❌ Error en login:", error);
      mostrarError("No se pudo conectar con el servidor.");
    }
  });

  // ✅ Validación básica de campos
  function validarFormulario(correo, contrasena) {
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexPassword = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    let valido = true;

    if (!regexCorreo.test(correo)) {
      mostrarError("⚠️ Correo electrónico inválido.");
      emailInput.classList.add("invalid");
      valido = false;
    }

    if (!regexPassword.test(contrasena)) {
      mostrarError("⚠️ La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.");
      passwordInput.classList.add("invalid");
      valido = false;
    }

    return valido;
  }

  // ✅ Evaluar si tiene permisos administrativos reales
  function esAdministrador(usuario) {
    const permisos = usuario?.permisos || {};
    return (
      permisos.usuarios?.leer ||
      permisos.productos?.leer ||
      permisos.configuracion?.leer ||
      permisos.reportes?.exportar
    );
  }

  // 📣 Mensajes UI
  function mostrarError(msg) {
    mensajeError.textContent = msg;
    mensajeError.style.display = "block";
    mensajeExito.style.display = "none";
    setTimeout(() => (mensajeError.style.display = "none"), 4000);
  }

  function mostrarExito(msg) {
    mensajeExito.textContent = msg;
    mensajeExito.style.display = "block";
    mensajeError.style.display = "none";
    setTimeout(() => (mensajeExito.style.display = "none"), 3000);
  }

  function ocultarMensajes() {
    mensajeError.style.display = "none";
    mensajeExito.style.display = "none";
    emailInput.classList.remove("invalid");
    passwordInput.classList.remove("invalid");
  }
});
