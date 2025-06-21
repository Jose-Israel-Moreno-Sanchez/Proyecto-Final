// 📁 admin/index.js
// Panel de Administración | TianguiStore

// ─────────────────────────────
// 📦 Importaciones por sección
// ─────────────────────────────
import { obtenerUsuarioAutenticado } from "./auth.js";
import { mostrarDashboard } from "./dashboard.js";
import { mostrarUsuarios } from "./usuarios.js";
import { mostrarProductos } from "./productos.js";
import { mostrarPedidos } from "./pedidos.js";
import { mostrarConfiguracion } from "./configuracion.js";

// ─────────────────────────────
// 📌 Configuración de secciones
// ─────────────────────────────
const secciones = {
  dashboard: { mostrar: mostrarDashboard, permiso: true },
  usuarios: { mostrar: mostrarUsuarios, permisoKey: "usuarios" },
  productos: { mostrar: mostrarProductos, permisoKey: "productos" },
  pedidos: { mostrar: mostrarPedidos, permisoKey: "pedidos" },
  configuracion: { mostrar: mostrarConfiguracion, permisoKey: "configuracion" }
};

let seccionActual = "";

// ─────────────────────────────
// 🚪 Cerrar sesión
// ─────────────────────────────
export function cerrarSesion() {
  localStorage.removeItem("usuario");
  localStorage.removeItem("token");
  localStorage.removeItem("carrito");
  window.location.href = "/login.html";
}

// ─────────────────────────────
// 🔄 Mostrar sección con permisos
// ─────────────────────────────
export async function mostrarSeccion(nombreSeccion) {
  if (nombreSeccion === seccionActual) return;
  seccionActual = nombreSeccion;
  location.hash = nombreSeccion;

  const contenedor = document.getElementById("seccion-principal");
  const usuario = obtenerUsuarioAutenticado();
  const permisos = usuario?.permisos || {};
  const seccion = secciones[nombreSeccion];

  if (!contenedor || !seccion) {
    console.warn(`❌ Sección "${nombreSeccion}" inválida.`);
    return;
  }

  // Spinner de carga
  contenedor.innerHTML = `
    <div class="center-align" style="margin-top: 4rem;">
      <div class="preloader-wrapper active">
        <div class="spinner-layer spinner-amber-only">
          <div class="circle-clipper left"><div class="circle"></div></div>
          <div class="gap-patch"><div class="circle"></div></div>
          <div class="circle-clipper right"><div class="circle"></div></div>
        </div>
      </div>
      <p class="grey-text text-lighten-1 mt-3">Cargando sección <strong>${nombreSeccion}</strong>...</p>
    </div>
  `;

  // Verificación de permisos
  const tienePermiso = seccion.permiso === true || permisos[seccion.permisoKey]?.leer;

  if (!tienePermiso) {
    contenedor.innerHTML = `
      <div class="center-align amber-text text-lighten-2" style="margin-top: 5rem;">
        <i class="fas fa-lock fa-2x mb-2"></i>
        <p>No tienes permiso para acceder a esta sección.</p>
      </div>
    `;
    return;
  }

  try {
    await seccion.mostrar(contenedor);
    resaltarMenuActivo(nombreSeccion);
  } catch (error) {
    console.error(`⚠️ Error en sección "${nombreSeccion}":`, error);
    contenedor.innerHTML = `
      <div class="center-align red-text text-lighten-2" style="margin-top: 5rem;">
        <i class="fas fa-bug fa-2x mb-2"></i>
        <p>Ocurrió un error al cargar la sección. Intenta de nuevo.</p>
      </div>
    `;
  }
}

// ─────────────────────────────
// 🧭 Resaltar sección activa
// ─────────────────────────────
function resaltarMenuActivo(nombre) {
  document.querySelectorAll(".sidenav a").forEach(el =>
    el.classList.remove("active", "amber-text")
  );
  const activo = document.querySelector(`.sidenav a[data-seccion="${nombre}"]`);
  if (activo) activo.classList.add("active", "amber-text");
}

// ─────────────────────────────
// 🧩 Navegación por hash
// ─────────────────────────────
window.addEventListener("hashchange", () => {
  const nueva = location.hash.replace("#", "");
  if (secciones[nueva]) mostrarSeccion(nueva);
});

// ─────────────────────────────
// 🚀 Inicialización al cargar
// ─────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const usuario = obtenerUsuarioAutenticado();
  if (!usuario) {
    alert("⚠️ Acceso no autorizado o sesión expirada.");
    window.location.href = "/login.html";
    return;
  }

  // Mostrar nombre en navbar
  const nombre = usuario.nombre || "Administrador";
  const spanNombre = document.getElementById("usuario-info");
  if (spanNombre) spanNombre.textContent = nombre;

  // Inicialización de tooltips y dropdowns
  const tooltipElems = document.querySelectorAll('.tooltipped');
  M.Tooltip.init(tooltipElems);

  const dropdownElems = document.querySelectorAll('.dropdown-trigger');
  M.Dropdown.init(dropdownElems, {
    constrainWidth: false,
    alignment: 'right',
    coverTrigger: false
  });

  // Cargar sección por hash o dashboard por defecto
  const hashInicial = location.hash.replace("#", "") || "dashboard";
  mostrarSeccion(hashInicial);
});
