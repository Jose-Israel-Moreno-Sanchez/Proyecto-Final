document.addEventListener("DOMContentLoaded", () => {
  const id = new URLSearchParams(window.location.search).get("id");

  if (!id || isNaN(id)) {
    mostrarError("⚠️ ID de producto no válido.", true);
    console.warn("[detalleProducto] ID inválido recibido:", id);
    return;
  }

  cargarProducto(id);
});

async function cargarProducto(id) {
  const endpoint = `/productos/detalle/${id}`;

  console.info(
    `[detalleProducto] Consultando producto ID ${id} en ${endpoint}...`
  );

  try {
    const res = await fetch(endpoint);

    if (res.status === 404) {
      const msg = `Producto ID ${id} no encontrado (404)`;
      console.warn(`[detalleProducto] ${msg}`);
      throw new Error(msg);
    }

    if (!res.ok) {
      const msg = `Error HTTP ${res.status} en ${endpoint}`;
      console.error(`[detalleProducto] ${msg}`);
      throw new Error(msg);
    }

    const producto = await res.json();

    if (!producto || typeof producto !== "object") {
      const msg = `⚠️ Respuesta inesperada o vacía para ID ${id}`;
      console.error("[detalleProducto] Respuesta corrupta:", producto);
      throw new Error(msg);
    }

    console.log("[detalleProducto] Producto cargado:", producto);

    renderizarProducto(producto);
    document.title = `${producto.nombre} | TianguiStore`;

    const btnAgregar = document.getElementById("btn-agregar");
    if (btnAgregar) {
      btnAgregar.addEventListener("click", () => {
        agregarAlCarrito(
          producto.producto_id,
          producto.nombre,
          producto.precio,
          producto.imagenes?.[0] || "/imagenes/default.png"
        );
      });
    }
  } catch (err) {
    console.error(
      `❌ [detalleProducto] Fallo al cargar el producto ID ${id}:`,
      err.message
    );
    mostrarError(`❌ No se pudo cargar el producto. ${err.message}`, true);
  }
}

function renderizarProducto(p) {
  const nombre = p.nombre || "Producto sin nombre";
  const descripcion = p.descripcion || "Sin descripción disponible.";
  const imagenes =
    Array.isArray(p.imagenes) && p.imagenes.length > 0
      ? p.imagenes
      : ["/imagenes/default.png"];

  document.getElementById("nombre-producto").textContent = nombre;
  document.getElementById("descripcion-producto").textContent = descripcion;
  document.getElementById("precio-producto").textContent =
    `$${parseFloat(p.precio).toFixed(2)}`;
  document.getElementById("stock-producto").textContent = p.stock ?? "N/D";
  document.getElementById("marca-producto").textContent =
    p.marca_nombre || "N/D";
  document.getElementById("categoria-producto").textContent =
    p.categoria_nombre || "N/D";
  document.getElementById("subcategoria-producto").textContent =
    p.subcategoria_nombre || "N/D";

  const imgEl = document.getElementById("imagen-producto");
  imgEl.src = imagenes[0].replace(/^public/, "");
  imgEl.alt = `Imagen de ${nombre}`;
  imgEl.onerror = () => {
    console.warn(
      "[detalleProducto] Imagen principal no cargó. Usando imagen por defecto."
    );
    imgEl.src = "/imagenes/default.png";
  };
}

function mostrarError(msg, mostrarBoton = false) {
  const contenedor = document.querySelector(".detalle-producto-wrapper");
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="card-panel red darken-3 white-text center-align" role="alert">
      <i class="material-icons left">error_outline</i> ${msg}
      ${
        mostrarBoton
          ? `<div class="section">
               <button class="btn-small amber darken-2 black-text z-depth-1" onclick="location.reload()">
                 <i class="material-icons left">refresh</i> Reintentar
               </button>
             </div>`
          : ""
      }
    </div>`;
}

function agregarAlCarrito(id, nombre, precio, imagen_url) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const existente = carrito.find((p) => p.id === id);

  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ id, nombre, precio, cantidad: 1, imagen_url });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  mostrarToast(`🛒 ${nombre} agregado al carrito`);
  actualizarContadorCarrito();
}

function mostrarToast(mensaje) {
  M.toast({
    html: `<i class="material-icons left">check_circle</i> ${mensaje}`,
    classes: "rounded amber darken-2 white-text",
    displayLength: 3500,
  });
}

function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const total = carrito.reduce((acc, p) => acc + (p.cantidad || 0), 0);
  document.querySelectorAll("#contador-carrito").forEach((el) => {
    el.textContent = total;
  });
}
/* -----------------------------------------------------------------------
   🔄 Compatibilidad con APIs que devuelven solo "imagen_url"
   (agrega el array "imagenes" sin tocar el código original)
   ----------------------------------------------------------------------- */
function compatImagenesAntiguas(producto) {
  if (!producto) return;

  // Si ya existe un arreglo válido de imágenes, no hacemos nada
  if (Array.isArray(producto.imagenes) && producto.imagenes.length) return;

  // Si viene campo único "imagen_url", lo convertimos en arreglo
  if (producto.imagen_url) {
    producto.imagenes = [producto.imagen_url];
  }
}

// Re‑envuelve la función original sin modificar su cuerpo
const _renderizarProductoOriginal = renderizarProducto;
renderizarProducto = function (p) {
  compatImagenesAntiguas(p);
  _renderizarProductoOriginal(p);
};