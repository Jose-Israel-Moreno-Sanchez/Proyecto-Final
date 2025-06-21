// 📦 admin/pedidos.js

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  if (!token || !usuario?.usuario_id || !usuario?.permisos?.pedidos?.leer) {
    console.warn("⛔ Acceso denegado o sesión inválida.");
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/index.html";
    return;
  }

  M.AutoInit();
const datepickerOptions = {
  format: "yyyy-mm-dd",
  autoClose: true,
  i18n: {
    cancel: "Cancelar",
    clear: "Limpiar",
    done: "Aceptar",
    months: [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ],
    monthsShort: [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ],
    weekdays: [
      "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"
    ],
    weekdaysShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    weekdaysAbbrev: ["D", "L", "M", "M", "J", "V", "S"]
  }
};

document.querySelectorAll(".datepicker").forEach((el) => {
  M.Datepicker.init(el, datepickerOptions);
});

  const modalEl = document.getElementById("modal-detalle-pedido");
  if (modalEl && !M.Modal.getInstance(modalEl)) {
    M.Modal.init(modalEl, {
      opacity: 0.6,
      endingTop: "10%",
      inDuration: 300,
      outDuration: 200,
    });
  }

  document
    .getElementById("btn-filtrar")
    ?.addEventListener("click", () => cargarPedidos(1));
  cargarPedidos(); // Primera carga
});

let paginaActual = 1;
const pedidosPorPagina = 30;

async function cargarPedidos(pagina = 1) {
  const tabla = document.getElementById("tabla-pedidos");
  const paginacion = document.getElementById("paginacion-pedidos");
  const token = localStorage.getItem("token");

  if (!tabla || !paginacion || !token) return;

  tabla.innerHTML = `<tr><td colspan="6">⏳ Cargando pedidos...</td></tr>`;
  paginacion.innerHTML = "";

  const fechaInicio = document.getElementById("fecha-inicio")?.value || "";
  const fechaFin = document.getElementById("fecha-fin")?.value || "";
  const estado = document.getElementById("estado-filtro")?.value || "";

  const params = new URLSearchParams({
    page: pagina,
    limite: pedidosPorPagina,
  });

  if (fechaInicio)
    params.append("fecha_inicio", encodeURIComponent(fechaInicio));
  if (fechaFin) params.append("fecha_fin", encodeURIComponent(fechaFin));
  if (estado) params.append("estado", encodeURIComponent(estado));

  try {
    const res = await fetch(`/pedidos/admin/listado?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      alert("⚠️ Tu sesión ha expirado.");
      window.location.href = "/index.html";
      return;
    }

    if (!res.ok) throw new Error("Error al obtener pedidos");

    const { pedidos, totalPaginas, paginaActual: actual } = await res.json();
    paginaActual = actual;

    if (!pedidos.length) {
      tabla.innerHTML = `<tr><td colspan="6">📭 No hay pedidos con los filtros aplicados.</td></tr>`;
      return;
    }

    tabla.innerHTML = pedidos
      .map(
        (p) => `
      <tr>
        <td>${p.pedido_id}</td>
        <td>${p.cliente || "Desconocido"}</td>
        <td>${new Date(p.fecha).toLocaleString("es-MX")}</td>
        <td>$${(+p.total).toFixed(2)}</td>
        <td><span class="new badge ${colorEstado(p.estado)}" data-badge-caption="${p.estado}"></span></td>
        <td>
          <a href="#modal-detalle-pedido" class="modal-trigger detalle-btn" data-id="${p.pedido_id}" title="Ver detalle">
            <i class="material-icons amber-text text-darken-3" title="Ver detalle">visibility</i>

          </a>
        </td>
      </tr>
    `
      )
      .join("");

    generarPaginacion(totalPaginas, paginaActual);

    document.querySelectorAll(".detalle-btn").forEach((el) => {
      el.addEventListener("click", (e) =>
        verDetalle(e.currentTarget.dataset.id)
      );
    });
  } catch (err) {
    console.error("❌ Error al cargar pedidos:", err);
    tabla.innerHTML = `<tr><td colspan="6">❌ ${err.message}</td></tr>`;
  }
}

function generarPaginacion(total, actual) {
  const paginacion = document.getElementById("paginacion-pedidos");
  paginacion.innerHTML = "";

  for (let i = 1; i <= total; i++) {
    const li = document.createElement("li");
    li.className = i === actual ? "active amber darken-2" : "waves-effect";
    li.innerHTML = `<a href="#!" data-page="${i}">${i}</a>`;
    li.querySelector("a").addEventListener("click", () => cargarPedidos(i));
    paginacion.appendChild(li);
  }
}

function colorEstado(estado) {
  switch (estado.toLowerCase()) {
    case "pagado":
      return "green";
    case "enviado":
      return "blue";
    case "pendiente":
      return "orange";
    case "cancelado":
      return "red";
    default:
      return "grey";
  }
}

async function verDetalle(pedido_id) {
  const token = localStorage.getItem("token");
  const modalEl = document.getElementById("modal-detalle-pedido");
  const modal = M.Modal.getInstance(modalEl);

  document.getElementById("detalle-id").textContent = pedido_id;
  document.getElementById("detalle-cliente").textContent = "Cargando...";
  document.getElementById("detalle-total").textContent = "...";
  document.getElementById("detalle-fecha").textContent = "...";
  document.getElementById("detalle-direccion").textContent = "...";
  document.getElementById("detalle-metodo").textContent = "...";
  document.getElementById("detalle-productos").innerHTML =
    "<li class='collection-item'>⏳ Cargando productos...</li>";

  try {
    const res = await fetch(`/pedidos/${pedido_id}/detalle`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      alert("⚠️ Tu sesión ha expirado.");
      window.location.href = "/index.html";
      return;
    }

    if (!res.ok) throw new Error("No autorizado o pedido no encontrado");

    const detalle = await res.json();

    document.getElementById("detalle-cliente").textContent = detalle.cliente;
    document.getElementById("detalle-total").textContent =
      `${(+detalle.total).toFixed(2)}`;
    document.getElementById("detalle-fecha").textContent = new Date(
      detalle.fecha_pedido
    ).toLocaleString("es-MX");
    const direccion = detalle.direccion_entrega;
    document.getElementById("detalle-direccion").textContent =
  direccion && direccion.trim().length > 0 ? direccion : "(No proporcionada)";

    document.getElementById("detalle-metodo").textContent = detalle.metodo_pago;

    document.getElementById("detalle-productos").innerHTML = detalle.productos
      .length
      ? detalle.productos
          .map((p) => {
            const precio = parseFloat(p.precio_unitario) || 0;
            const subtotal = precio * (parseInt(p.cantidad) || 0);
            return `
        <li class="collection-item">
          <strong>${p.nombre}</strong><br>
          Cantidad: ${p.cantidad}, Precio: $${precio.toFixed(2)}, 
          Subtotal: $${subtotal.toFixed(2)}
        </li>`;
          })
          .join("")
      : "<li class='collection-item'>Sin productos.</li>";

    modal.open();
  } catch (err) {
    console.error("❌ Error al cargar detalle:", err);
    document.getElementById("detalle-productos").innerHTML =
      `<li class='collection-item red-text'>${err.message}</li>`;
  }
}
