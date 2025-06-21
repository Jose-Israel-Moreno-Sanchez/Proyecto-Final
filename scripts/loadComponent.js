/**
 * 📦 loadComponent.js
 * Carga dinámica de navbar/footer, tema claro/oscuro, contador de carrito
 * y menú contextual de usuario con roles, nivel y permisos.
 * Autor: I.S.C. Erick Renato Vega Ceron – Última revisión: Mayo 2025
 */

document.addEventListener("DOMContentLoaded", async () => {
  try {
    aplicarTemaDesdePreferencias();
    await Promise.all([cargarNavbar(), cargarFooter()]);
    inicializarMaterialize();
    sincronizarToggleTema();
    actualizarContadorCarrito(); // ✅ ESTA LÍNEA
  } catch (error) {
    console.error("⚠️ Error durante inicialización:", error);
  }
});

/* ══════════════════════════════════════
   🌐 CARGA DINÁMICA DE COMPONENTES
═══════════════════════════════════════ */

async function cargarNavbar() {
  const contenedor = document.getElementById("navbar-container");
  if (!contenedor) return;

  try {
    const res = await fetch("/componentes/navbar.html");

    if (!res.ok) throw new Error("No se pudo cargar navbar.html");

    contenedor.innerHTML = await res.text();
    contenedor.classList.add("animate__animated", "animate__fadeInDown");

    inicializarMaterialize(); // ✅ Primero activa tooltips, dropdowns, etc.
    gestionarVisibilidadMenus(); // ✅ Luego muestra u oculta ítems del menú
    actualizarContadorCarrito(); // ✅ Finalmente actualiza los íconos del carrito
  } catch (err) {
    console.error("❌ Error cargando navbar:", err);
    contenedor.innerHTML = `<nav class="red darken-4 center-align">⚠️ Error al cargar menú</nav>`;
  }
}

async function cargarFooter() {
  const contenedor = document.getElementById("footer-container");
  if (!contenedor) return;

  try {
    const res = await fetch("/componentes/footer.html");

    if (!res.ok) throw new Error("No se pudo cargar footer.html");

    contenedor.innerHTML = await res.text();
    contenedor.classList.add("animate__animated", "animate__fadeInUp");
  } catch (err) {
    console.error("❌ Error cargando footer:", err);
    contenedor.innerHTML = `<footer class="page-footer red darken-4 center-align">⚠️ Error al cargar pie de página</footer>`;
  }
}

/* ══════════════════════════════════════
   🌓 CONTROL DE TEMA OSCURO / CLARO
═══════════════════════════════════════ */

function aplicarTemaDesdePreferencias() {
  const tema = localStorage.getItem("tema") || "oscuro";
  document.documentElement.classList.toggle("dark", tema === "oscuro");
}

function sincronizarToggleTema() {
  const toggle = document.getElementById("toggleThemeBtn");
  const icono = toggle?.querySelector("i");
  if (!toggle || !icono) return;

  const temaActual = localStorage.getItem("tema") || "oscuro";
  icono.classList.replace(
    "fa-moon",
    temaActual === "oscuro" ? "fa-sun" : "fa-moon"
  );

  toggle.addEventListener("click", () => {
    const oscuro = document.documentElement.classList.toggle("dark");
    localStorage.setItem("tema", oscuro ? "oscuro" : "claro");
    icono.classList.toggle("fa-sun", oscuro);
    icono.classList.toggle("fa-moon", !oscuro);
  });
}

/* ══════════════════════════════════════
   🧠 INICIALIZACIÓN DE COMPONENTES MATERIALIZE
═══════════════════════════════════════ */

function inicializarMaterialize() {
  // 📱 Menú lateral móvil
  const sidenavs = document.querySelectorAll(".sidenav");
  if (sidenavs.length) M.Sidenav.init(sidenavs);

  // 🧭 Tooltips (iconos, botones, avatar)
  const tooltips = document.querySelectorAll(".tooltipped");
  if (tooltips.length) M.Tooltip.init(tooltips);

  // 🔽 Menús desplegables
  const dropdowns = document.querySelectorAll(".dropdown-trigger");
  if (dropdowns.length) {
    M.Dropdown.init(dropdowns, {
      constrainWidth: false,
      coverTrigger: false,
      alignment: "right",
    });
  }

  // 📂 Acordeones colapsables (opcional)
  const collapsibles = document.querySelectorAll(".collapsible");
  if (collapsibles.length) M.Collapsible.init(collapsibles);

  // 📋 Select con estilo
  const selects = document.querySelectorAll("select");
  if (selects.length) M.FormSelect.init(selects);
}

/* ══════════════════════════════════════
   🛒 ACTUALIZACIÓN DE CARRITO
═══════════════════════════════════════ */
/**
 * 🛒 Actualiza visualmente el contador de carrito en desktop y móvil.
 * Incluye animación con Animate.css si hay productos.
 */
function actualizarContadorCarrito() {
  try {
    const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
    const total = carrito.reduce((acc, prod) => acc + (prod.cantidad || 0), 0);

    const badgeDesktop = document.getElementById("contador-carrito");
    const badgeMobile = document.getElementById("contador-carrito-mobile");

    // 🔄 Función reutilizable para actualizar y animar cada badge
    const actualizarYAnimarBadge = (badge) => {
      if (!badge) return;

      badge.textContent = total;
      badge.style.display = total > 0 ? "inline-block" : "none";

      // Reinicia y aplica animación si hay productos
      if (total > 0) {
        badge.classList.remove("animate__animated", "animate__bounceIn");
        void badge.offsetWidth; // Forzar reflow para reiniciar animación
        badge.classList.add("animate__animated", "animate__bounceIn");

        // Limpia la clase después de un breve tiempo
        setTimeout(() => {
          badge.classList.remove("animate__animated", "animate__bounceIn");
        }, 800);
      }
    };

    actualizarYAnimarBadge(badgeDesktop);
    actualizarYAnimarBadge(badgeMobile);
  } catch (err) {
    console.error("❌ Error en contador de carrito:", err);
  }
}

/* ══════════════════════════════════════
   🔐 GENERACIÓN DE MENÚ POR ROL Y VISIBILIDAD
═══════════════════════════════════════ */

function gestionarVisibilidadMenus() {
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

  const loginBtn = document.getElementById("menu-login");
  const registroBtn = document.getElementById("menu-registro");
  const menuUsuario = document.getElementById("menu-usuario");

  if (!token || !usuario) {
    loginBtn?.classList.remove("hide");
    registroBtn?.classList.remove("hide");
    return;
  }

  if (!menuUsuario) return;

  // Elimina el avatar anterior sin borrar el carrito ni el login/registro
  document.getElementById("menu-avatar")?.remove();

  // Inserta solo el bloque de usuario logueado
  menuUsuario.insertAdjacentHTML("beforeend", generarBloqueUsuario(usuario));

  // Agrega dropdown de usuario
  document.body.appendChild(generarDropdownUsuario(usuario.permisos || {}));

  setTimeout(() => {
    const logoutBtn = document.getElementById("menu-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.clear();
        M.toast({
          html: "Sesión cerrada exitosamente",
          classes: "rounded amber darken-3",
        });
        window.location.href = "login.html";
      });
    } else {
      console.warn(
        "⚠️ No se encontró el botón #menu-logout para cerrar sesión."
      );
    }
  }, 300);

  mostrarMenuPedidosSiSesionActiva();
}

function generarBloqueUsuario(usuario) {
  const nombre = escapeHTML(usuario.nombre || usuario.correo || "Usuario");
  const rol = (usuario.rol || "cliente").toLowerCase();
  const nivel = escapeHTML(usuario.nivel || "Básico");
  let foto = usuario.fotoPerfil;
  if (!foto || typeof foto !== "string" || !foto.startsWith("/")) {
    foto = "/imagenes/default_profile.png";
  }

  const iconosRol = {
    admin: "fas fa-user-shield",
    soporte: "fas fa-headset",
    vendedor: "fas fa-store",
    cliente: "fas fa-user",
    desarrollador: "fas fa-code",
  };

  const icono = iconosRol[rol] || "fas fa-user";
  const claseRol = `badge-rol ${rol}`;

  return `
    <li>
      <a class="dropdown-trigger tooltipped" href="#" data-target="dropdown-usuario" data-tooltip="${nombre}" aria-label="Menú de usuario">
        <img src="${foto}" alt="Perfil" class="circle z-depth-2" style="width: 36px; height: 36px; object-fit: cover; border: 2px solid #555;" />
        <div style="display: flex; flex-direction: column; line-height: 1.2;">
          <span class="white-text" style="font-weight: 600; font-size: 0.95rem;">${nombre}</span>
          <span class="${claseRol}">
            <i class="${icono}"></i> ${usuario.rol} — ${nivel}
          </span>
        </div>
        <i class="fas fa-caret-down right white-text"></i>
      </a>
    </li>
  `;
}

function generarDropdownUsuario(permisos) {
  const dropdown = document.createElement("ul");
  dropdown.id = "dropdown-usuario";
  dropdown.className = "dropdown-content glass-navbar z-depth-2";
  dropdown.setAttribute("role", "menu");

  dropdown.innerHTML = `
    <li><a href="perfil.html"><i class="fas fa-id-card" style="color:#4caf50;"></i> Perfil</a></li>
    ${permisos.admin ? `<li><a href="adminPanel.html"><i class="fas fa-cogs" style="color:#fbc02d;"></i> Panel Admin</a></li>` : ""}
    ${permisos.usuarios?.leer ? `<li><a href="usuarios.html"><i class="fas fa-users" style="color:#29b6f6;"></i> Usuarios</a></li>` : ""}
    ${permisos.configuracion?.leer ? `<li><a href="configuracion.html"><i class="fas fa-sliders-h" style="color:#ff8f00;"></i> Configuración</a></li>` : ""}
    ${permisos.reportes?.exportar ? `<li><a href="metricas.html"><i class="fas fa-chart-bar" style="color:#26a69a;"></i> Métricas</a></li>` : ""}
    ${
      permisos.pedidos?.leer
        ? `
  <li>
    <a href="${permisos.admin && usuario.rol === "admin" ? "/admin/pedidos.html" : "/misPedidos.html"}">
      <i class="fas fa-box-open" style="color:#ffa000;"></i> Pedidos
    </a>
  </li>`
        : ""
    }

    <li class="divider" tabindex="-1"></li>
    <li><a href="#" id="menu-logout"><i class="fas fa-sign-out-alt red-text"></i> Cerrar sesión</a></li>
  `;
  return dropdown;
}

function mostrarMenuPedidosSiSesionActiva() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const puedeVerPedidos = usuario?.permisos?.pedidos?.leer === true;

  const linkNavPedidos = document.getElementById("link-nav-pedidos");
  const linkDropdownPedidos = document.getElementById("link-dropdown-pedidos");
  const linkSidenavPedidos = document.getElementById("link-sidenav-pedidos");

  if (!puedeVerPedidos) return;

  const destino =
    usuario?.rol === "admin" ? "/admin/pedidos.html" : "/misPedidos.html";

  // Actualiza hrefs dinámicamente según rol
  linkNavPedidos?.setAttribute("href", destino);
  linkDropdownPedidos?.setAttribute("href", destino);
  linkSidenavPedidos?.setAttribute("href", destino);

  // Asegura que los enlaces estén visibles
  document.getElementById("nav-pedidos")?.style.setProperty("display", "flex");
  document
    .getElementById("dropdown-pedidos")
    ?.style.setProperty("display", "block");
  document
    .getElementById("sidenav-pedidos")
    ?.style.setProperty("display", "block");
}

/* ══════════════════════════════════════
   🔓 CIERRE DE SESIÓN Y LIMPIEZA LOCAL
═══════════════════════════════════════ */

function asignarLogout(ids) {
  const logout = () => {
    localStorage.clear();
    M.toast({
      html: "Sesión cerrada exitosamente",
      classes: "rounded amber darken-3",
    });
    window.location.href = "/login.html";
  };

  ids.forEach((id) => {
    document.getElementById(id)?.addEventListener("click", logout);
  });
}

/* ══════════════════════════════════════
   🧼 ESCAPE BÁSICO DE HTML (prevención de XSS)
═══════════════════════════════════════ */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
