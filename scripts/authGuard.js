// 📁 scripts/authGuard.js
(() => {
  let timeoutRenovacion = null;

  /**
   * 🔐 Verifica si un token JWT ha expirado.
   */
  function tokenExpirado(token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return !payload.exp || payload.exp < Math.floor(Date.now() / 1000);
    } catch (e) {
      console.error("❌ Token inválido o corrupto:", e);
      return true;
    }
  }

  /**
   * 🔄 Solicita un nuevo token antes de que expire.
   */
  async function renovarToken() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/auth/renovar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        console.warn("🔐 Token no renovable.");
        cerrarSesionSilenciosa();
        return;
      }

      const { token: nuevoToken, usuario } = await res.json();
      localStorage.setItem("token", nuevoToken);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      clearTimeout(timeoutRenovacion);
      programarRenovacionToken();
      console.log("✅ Token renovado automáticamente.");
    } catch (error) {
      console.error("❌ Error al renovar token:", error);
      cerrarSesionSilenciosa();
    }
  }

  /**
   * ⏳ Programa la renovación automática del token antes de expirar.
   */
  function programarRenovacionToken() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const ahora = Math.floor(Date.now() / 1000);
      const segundosRestantes = payload.exp - ahora;
      const tiempoAntes = (segundosRestantes - 60) * 1000;

      if (tiempoAntes <= 0) return renovarToken();

      timeoutRenovacion = setTimeout(renovarToken, tiempoAntes);
      console.log(`⏱️ Renovación programada en ${(tiempoAntes / 60000).toFixed(1)} min`);
    } catch (e) {
      console.error("❌ Error al leer token:", e);
      cerrarSesionSilenciosa();
    }
  }

  /**
   * 🚪 Elimina token, usuario y redirige al inicio.
   */
  function cerrarSesionSilenciosa() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/index.html";
  }

  /**
   * ✅ Valida estructura mínima de sesión y permisos base.
   */
  function sesionValida() {
    const token = localStorage.getItem("token");
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

    const estructuraValida =
      usuario.usuario_id &&
      typeof usuario.rol === "string" &&
      typeof usuario.permisos === "object";

    const tienePermisos =
      usuario.permisos?.productos?.leer || usuario.permisos?.usuarios?.leer || usuario.permisos?.pedidos?.leer;

    return token && !tokenExpirado(token) && estructuraValida && tienePermisos;
  }

  /**
   * 🚀 Inicializador automático de protección de sesión.
   */
  document.addEventListener("DOMContentLoaded", () => {
    if (!sesionValida()) {
      console.warn("🚫 Sesión no válida. Redirigiendo...");
      cerrarSesionSilenciosa();
      return;
    }

    document.body.classList.add("sesion-verificada");
    programarRenovacionToken();
  });
})();
