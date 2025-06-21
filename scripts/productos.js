/**
 * 📦 productos.js
 * Renderiza tarjetas de productos con estilo dark-glassmorphism y paginación.
 * Autor: I.S.C. Erick Renato Vega Ceron | Optimización Junio 2025
 */

let productosGlobal = [];
let productosPorPagina = 10;
let paginaActual = 1;

document.addEventListener("DOMContentLoaded", async () => {
  await cargarProductos();
  actualizarContadorCarrito();
});

/* ══════════════════════════════════════
 * 🔄 Carga de productos desde el backend
 * ══════════════════════════════════════ */
async function cargarProductos() {
  const contenedor = document.getElementById("productos-container");
  const paginacion = document.getElementById("paginacion-productos");
  if (!contenedor || !paginacion) return;

  try {
    const res = await fetch("/productos");
    if (!res.ok) throw new Error("No se pudo obtener el listado de productos.");

    productosGlobal = await res.json();

    console.log("✅ Productos recibidos:", productosGlobal); // 🔍 Depuración

    if (!Array.isArray(productosGlobal) || productosGlobal.length === 0) {
      contenedor.innerHTML = `<p class="center-align grey-text text-lighten-2">No hay productos disponibles.</p>`;
      paginacion.innerHTML = "";
      return;
    }

    mostrarPagina(paginaActual);
    generarPaginacion();
  } catch (err) {
    console.error("❌ Error al cargar productos:", err);
    contenedor.innerHTML = `<p class="center-align red-text text-lighten-2">Error al cargar productos.</p>`;
    paginacion.innerHTML = "";
  }
}

/* ══════════════════════════════════════
 * 📄 Mostrar productos por página
 * ══════════════════════════════════════ */
function mostrarPagina(num) {
  const contenedor = document.getElementById("productos-container");
  contenedor.innerHTML = "";

  const inicio = (num - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;
  const productosPagina = productosGlobal.slice(inicio, fin);

  productosPagina.forEach((producto) =>
    renderizarProducto(producto, contenedor)
  );
  asignarEventosAgregar();
}

/* ══════════════════════════════════════
 * 🔢 Crear paginación dinámica
 * ══════════════════════════════════════ */
function generarPaginacion() {
  const paginacion = document.getElementById("paginacion-productos");
  paginacion.innerHTML = "";

  const totalPaginas = Math.ceil(productosGlobal.length / productosPorPagina);

  for (let i = 1; i <= totalPaginas; i++) {
    const li = document.createElement("li");
    li.className =
      i === paginaActual ? "active amber darken-3" : "waves-effect";

    const a = document.createElement("a");
    a.href = "#!";
    a.textContent = i;
    a.addEventListener("click", () => {
      paginaActual = i;
      mostrarPagina(paginaActual);
      generarPaginacion();
    });

    li.appendChild(a);
    paginacion.appendChild(li);
  }
}

/* ══════════════════════════════════════
 * 🎨 Renderizar tarjeta individual de producto
 * ══════════════════════════════════════ */
function renderizarProducto(producto, contenedor) {
  const {
    producto_id: id,
    nombre = "Producto sin nombre",
    descripcion = "Sin descripción disponible",
    precio = 0,
    stock = 0,
    imagen_url,
    es_nuevo = false,
    es_popular = false,
  } = producto;

  const imagen = (imagen_url || "/imagenes/default.png")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^public/, "")
    .replace(/^\/?/, "/");

  const tarjeta = document.createElement("div");
  tarjeta.className = "col s12 m6 l4";

  const card = document.createElement("article");
  card.className = "card product-card hoverable z-depth-4";

  const linkImagen = document.createElement("a");
  linkImagen.href = `/detalleProducto.html?id=${id}`;
  linkImagen.className = "card-image";
  linkImagen.setAttribute("aria-label", `Ver detalles de ${nombre}`);

  const img = document.createElement("img");
  img.src = imagen;
  img.alt = `Imagen de ${nombre}`;
  img.className = "responsive-img product-img";
  img.loading = "lazy";
  img.onerror = () => {
    img.src = "/imagenes/default.png";
  };

  // 🏷️ Contenedor de múltiples badges
  const badgesContenedor = document.createElement("div");
  badgesContenedor.classList.add("badges-contenedor");

  // 🟠 Bajo stock
  if (stock > 0 && stock <= 10) {
    const badge = document.createElement("span");
    badge.className = "badge-etiqueta badge-bajo-stock";
    badge.title = "Quedan pocas unidades";
    badge.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ¡Últimos!`;
    badge.style.marginRight = "6px";
    badge.style.marginBottom = "6px";
    badgesContenedor.appendChild(badge);
  }

  // 🔥 Popular
  if (es_popular) {
    const badge = document.createElement("span");
    badge.className = "badge-etiqueta badge-popular";
    badge.title = "Producto popular";
    badge.innerHTML = `<i class="fas fa-fire"></i> Popular`;
    badge.style.marginRight = "6px";
    badge.style.marginBottom = "6px";
    badgesContenedor.appendChild(badge);
  }

  // ✨ Nuevo
  if (es_nuevo) {
    const badge = document.createElement("span");
    badge.className = "badge-etiqueta badge-nuevo";
    badge.title = "Nuevo producto";
    badge.innerHTML = `<i class="fas fa-star"></i> Nuevo`;
    badge.style.marginRight = "6px";
    badge.style.marginBottom = "6px";
    badgesContenedor.appendChild(badge);
  }

  // 🌟 Destacado
  if (producto.destacado) {
    const badge = document.createElement("span");
    badge.className = "badge-etiqueta badge-destacado";
    badge.title = "Producto destacado";
    badge.innerHTML = `<i class="fas fa-certificate"></i> Destacado`;
    badge.style.marginRight = "6px";
    badge.style.marginBottom = "6px";
    badgesContenedor.appendChild(badge);
  }

  // Añade los badges al contenedor de imagen si existen
  linkImagen.append(img);
  if (badgesContenedor.childNodes.length > 0) {
    linkImagen.appendChild(badgesContenedor);
  }

  const cardContent = document.createElement("section");
  cardContent.className = "card-content";

  const titulo = document.createElement("h6");
  titulo.className = "product-title";

  const linkTitulo = document.createElement("a");
  linkTitulo.href = `/detalleProducto.html?id=${id}`;
  linkTitulo.textContent = nombre;
  linkTitulo.className = "amber-text text-darken-2";
  linkTitulo.setAttribute("aria-label", `Ir a detalle de ${nombre}`);

  titulo.appendChild(linkTitulo);

  const desc = document.createElement("p");
  desc.className = "product-description";
  desc.textContent = descripcion;

  const info = document.createElement("div");
  info.className = "product-price-stock";

  const precioEl = document.createElement("span");
  precioEl.className = "product-price";
  precioEl.textContent = `$${parseFloat(precio).toFixed(2)}`;

  const stockEl = document.createElement("span");
  stockEl.className = "product-stock";
  stockEl.textContent = `Stock: ${stock}`;

  info.append(precioEl, stockEl);
  cardContent.append(titulo, desc, info);

  const cardAction = document.createElement("footer");
  cardAction.className = "card-action center-align";

  const btn = document.createElement("button");
  btn.className =
    "btn btn-agregar amber darken-2 waves-effect waves-light z-depth-1";
  btn.setAttribute("aria-label", `Agregar ${nombre} al carrito`);
  btn.innerHTML = `<i class="fas fa-cart-plus left"></i> Agregar`;
  btn.dataset.id = id;
  btn.dataset.nombre = nombre;
  btn.dataset.precio = precio;
  btn.dataset.imagen = imagen;

  cardAction.appendChild(btn);
  card.append(linkImagen, cardContent, cardAction);
  tarjeta.appendChild(card);
  contenedor.appendChild(tarjeta);
}

/* ══════════════════════════════════════
 * ➕ Agregar al carrito
 * ══════════════════════════════════════ */
function asignarEventosAgregar() {
  document.querySelectorAll(".btn-agregar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const { id, nombre, precio, imagen } = btn.dataset;
      const imagenFinal = imagen?.trim() || "/imagenes/default.png";
      agregarAlCarrito(id, nombre, parseFloat(precio), imagenFinal);
    });
  });
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
  actualizarContadorCarrito();
  mostrarToast(`🛒 ${nombre} agregado al carrito`);
}

/* ══════════════════════════════════════
 * 🔄 Actualiza visualmente el contador
 * ══════════════════════════════════════ */
function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const total = carrito.reduce((acc, p) => acc + (p.cantidad || 0), 0);
  document
    .querySelectorAll("#contador-carrito")
    .forEach((el) => (el.textContent = total));
}

/* ══════════════════════════════════════
 * 🔔 Mostrar notificación tipo toast
 * ══════════════════════════════════════ */
function mostrarToast(mensaje) {
  M.toast({
    html: `<i class="fas fa-check-circle left"></i> ${mensaje}`,
    classes: "rounded amber darken-2 white-text",
    displayLength: 3000,
  });
}
