/**
 * Archivo: agregarProducto.js
 * Descripción:
 * Este archivo contiene la lógica para la adición de productos a la tienda en línea TianguiStore.
 * Permite agregar un nuevo producto a través de un formulario, manejar las categorías y marcas desde la API, 
 * y visualizar vistas previas de las imágenes y modelos 3D.
 * 
 * Autor: I.S.C. Erick Renato Vega Ceron
 * Fecha de Creación: Mayo 2025
 */

document.addEventListener("DOMContentLoaded", () => {
  // Cargar categorías, marcas y configurar vistas previas de imágenes y modelos 3D
  cargarCategorias();
  cargarMarcas();
  configurarVistaPreviaImagenes();
  configurarVistaPreviaModelo3D();

  // Obtener el formulario de agregar producto
  const form = document.getElementById("form-agregar-producto");

  // Manejo del evento de envío del formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto (recarga de la página)

    const formData = new FormData();

    // 📦 Campos simples: recoger los valores del formulario y agregarlos al FormData
    formData.append("nombre", document.getElementById("nombre").value.trim());
    formData.append("descripcion", document.getElementById("descripcion").value.trim());
    formData.append("precio", document.getElementById("precio").value);
    formData.append("stock", document.getElementById("stock").value);
    formData.append("categoria_id", document.getElementById("categoria_id").value);
    formData.append("marca_id", document.getElementById("marca_id").value);
    formData.append("tipo_pago", document.getElementById("tipo_pago").value);
    formData.append("publicado", document.getElementById("publicado").checked);
    formData.append("meses_sin_intereses", document.getElementById("meses_sin_intereses").checked);

    // 🖼️ Imágenes múltiples: Agregar todas las imágenes seleccionadas al FormData
    const imagenes = document.getElementById("imagenes").files;
    for (let i = 0; i < imagenes.length; i++) {
      formData.append("imagenes", imagenes[i]);
    }

    // 🧩 Modelo 3D (opcional): Agregar el archivo del modelo 3D si está presente
    const modelo3d = document.getElementById("modelo3d").files[0];
    if (modelo3d) {
      formData.append("modelo3d", modelo3d);
    }

    // Enviar los datos al servidor
    try {
      const res = await fetch("/productos", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      // Manejo de respuesta exitosa o error
      if (!res.ok) {
        mostrarToast("❌ Error: " + (data.message || "No se pudo guardar el producto."), "danger");
        return;
      }

      mostrarToast("✅ Producto guardado exitosamente.", "success");

      // Limpiar el formulario y las vistas previas
      form.reset();
      document.getElementById("preview-imagenes").innerHTML = "";
      document.getElementById("preview-modelo3d").innerHTML = "";

    } catch (error) {
      console.error("Error al guardar producto:", error);
      mostrarToast("❌ Error de red o servidor.", "danger");
    }
  });
});

// 🔄 Cargar categorías desde API
async function cargarCategorias() {
  try {
    const res = await fetch("/categorias");
    const categorias = await res.json();
    const select = document.getElementById("categoria_id");
    select.innerHTML = '<option value="">Selecciona una categoría</option>';
    categorias.forEach(c => {
      const option = document.createElement("option");
      option.value = c.categoria_id;
      option.textContent = c.nombre;
      select.appendChild(option);
    });
  } catch {
    mostrarToast("⚠️ Error al cargar categorías.", "warning");
  }
}

// 🔄 Cargar marcas desde API
async function cargarMarcas() {
  try {
    const res = await fetch("/marcas");
    const marcas = await res.json();
    const select = document.getElementById("marca_id");
    select.innerHTML = '<option value="">Selecciona una marca</option>';
    marcas.forEach(m => {
      const option = document.createElement("option");
      option.value = m.marca_id;
      option.textContent = m.nombre;
      select.appendChild(option);
    });
  } catch {
    mostrarToast("⚠️ Error al cargar marcas.", "warning");
  }
}

// 🖼️ Vista previa de imágenes seleccionadas
function configurarVistaPreviaImagenes() {
  const input = document.getElementById("imagenes");
  const preview = document.getElementById("preview-imagenes");

  input.addEventListener("change", () => {
    preview.innerHTML = ""; // Limpiar cualquier vista previa previa
    const archivos = input.files;
    for (let i = 0; i < archivos.length; i++) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.className = "img-thumbnail";
        img.style.height = "80px";
        img.style.marginRight = "10px";
        preview.appendChild(img);
      };
      reader.readAsDataURL(archivos[i]);
    }
  });
}

// 🔍 Vista previa del modelo 3D (si se carga un archivo .glb o .gltf)
function configurarVistaPreviaModelo3D() {
  const input = document.getElementById("modelo3d");
  const preview = document.getElementById("preview-modelo3d");

  input.addEventListener("change", () => {
    preview.innerHTML = ""; // Limpiar la vista previa previa
    const archivo = input.files[0];
    if (archivo && /\.(glb|gltf)$/i.test(archivo.name)) {
      const url = URL.createObjectURL(archivo);
      const modelViewer = document.createElement("model-viewer");
      modelViewer.setAttribute("src", url);
      modelViewer.setAttribute("camera-controls", "");
      modelViewer.setAttribute("auto-rotate", "");
      modelViewer.setAttribute("style", "width: 100%; height: 300px;");
      preview.appendChild(modelViewer);
    } else {
      preview.innerHTML = "<small class='text-muted'>Modelo no compatible para vista previa.</small>";
    }
  });
}

// 🔔 Función para mostrar notificaciones (toast) en la interfaz
function mostrarToast(mensaje, tipo = "success") {
  const toastContainer = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-white bg-${tipo} border-0 show shadow`;
  toast.setAttribute("role", "alert");
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body fw-bold">${mensaje}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4000); // Remover el toast después de 4 segundos
}
