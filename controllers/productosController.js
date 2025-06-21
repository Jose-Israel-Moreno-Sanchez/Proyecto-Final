/**
 * 📁 CONTROLADOR: productosController.js
 * 📦 Módulo: Gestión de productos (catálogo principal)
 *
 * Funcionalidades:
 * - Obtener productos visibles
 * - Consultar detalle con galería
 * - Consultar detalle enriquecido (con promociones y estadísticas)
 * - Crear producto (JSON o archivos)
 * - Actualizar producto existente
 * - Eliminar producto (borrado lógico)
 *
 * Modelos utilizados:
 * - productosModel.js
 * - galeriaModel.js
 * - promocionesModel.js
 * - ventasModel.js
 */

const productosModel = require("../models/producto.model");
const galeriaModel = require("../models/galeria.model");
const promocionesModel = require("../models/marketing.model");
const ventasModel = require("../models/ventas.model");

// ─────────────────────────────────────────────
// 📥 GET /api/productos (con etiquetas visuales)
// ─────────────────────────────────────────────
exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await productosModel.obtenerProductosPublicados();

    const ahora = new Date();
    const productosConEtiquetas = productos.map((producto) => {
      const fechaCreacion = new Date(producto.fecha_creacion);
      const diasDesdeCreacion = Math.floor((ahora - fechaCreacion) / (1000 * 60 * 60 * 24));

      return {
        ...producto,
        es_nuevo: diasDesdeCreacion <= 15,        // 🟢 Nuevo: < 15 días
        es_popular: producto.stock > 50,          // 🟡 Popular: stock alto
        bajo_stock: producto.stock <= 5,          // 🟠 ¡Últimos!: stock bajo
        destacado: Boolean(producto.destacado)    // 🔵 Destacado
      };
    });

    res.status(200).json(productosConEtiquetas);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    res.status(500).json({ mensaje: "Error interno al obtener productos." });
  }
};


// ─────────────────────────────────────────────
// 🔍 GET /api/productos/:id (detalle básico)
// ─────────────────────────────────────────────
exports.obtenerProductoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const producto = await productosModel.obtenerProductoPorId(id);
    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado." });
    }

    const galeria = await galeriaModel.obtenerGaleriaPorProducto(id);
    const imagenes = galeria.filter(g => g.tipo === "imagen").map(g => g.url);
    const modelo3d = galeria.find(g => g.tipo === "modelo_3d")?.url || null;

    res.status(200).json({ ...producto, imagenes, modelo3d });
  } catch (error) {
    console.error(`❌ Error al obtener producto ID ${id}:`, error);
    res.status(500).json({ mensaje: "Error interno al obtener el producto." });
  }
};

// ─────────────────────────────────────────────
// 🔍 GET /api/producto-detalle/:id (detalle enriquecido)
// ─────────────────────────────────────────────
exports.obtenerDetalleProducto = async (req, res) => {
  const { id } = req.params;

  try {
    const producto = await productosModel.obtenerProductoPorIdExtendido(id);
    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado." });
    }

    const galeria = await galeriaModel.obtenerGaleriaPorProducto(id);
    const imagenes = galeria.filter(g => g.tipo === "imagen").map(g => g.url);
    const videos = galeria.filter(g => g.tipo === "video").map(g => g.url);
    const modelo3d = galeria.find(g => g.tipo === "modelo_3d")?.url || null;

    const promociones = await promocionesModel.obtenerPromocionesPorProducto(id);
    const ventas = await ventasModel.obtenerEstadisticasProducto(id);
    const relacionados = await productosModel.obtenerProductosRelacionados(id, producto.categoria_id);

    return res.status(200).json({
      ...producto,
      imagenes,
      videos,
      modelo3d,
      promociones,
      ventas,
      relacionados
    });
  } catch (error) {
    console.error(`❌ Error al obtener detalle de producto ID ${id}:`, error);
    return res.status(500).json({ mensaje: "Error interno al obtener detalle del producto." });
  }
};

// ─────────────────────────────────────────────
// ➕ POST /api/productos
// ─────────────────────────────────────────────
exports.agregarProducto = async (req, res) => {
  const producto = req.body;
  const camposObligatorios = ["nombre", "precio", "categoria_id", "proveedor_id"];

  for (const campo of camposObligatorios) {
    if (!producto[campo]) {
      return res.status(400).json({ mensaje: `El campo '${campo}' es obligatorio.` });
    }
  }

  try {
    const insertId = await productosModel.insertarProducto(producto);
    res.status(201).json({
      mensaje: "✅ Producto registrado correctamente.",
      id: insertId
    });
  } catch (error) {
    console.error("❌ Error al agregar producto:", error);
    res.status(500).json({ mensaje: "Error interno al agregar producto." });
  }
};

// ─────────────────────────────────────────────
// 🖼️ POST /api/productos/archivos
// ─────────────────────────────────────────────
exports.agregarProductoConArchivos = async (req, res) => {
  const datos = req.body;
  const camposObligatorios = ["nombre", "precio", "categoria_id", "tipo_pago"];

  for (const campo of camposObligatorios) {
    if (!datos[campo]) {
      return res.status(400).json({ mensaje: `El campo '${campo}' es obligatorio.` });
    }
  }

  try {
    const productoId = await productosModel.insertarProducto(datos);

    const imagenes = req.files?.imagenes || [];
    for (const archivo of imagenes) {
      await galeriaModel.insertarElemento({
        producto_id: productoId,
        tipo: "imagen",
        url: `/uploads/imagenes/${archivo.filename}`,
        alt_text: datos.nombre
      });
    }

    const modelo3d = req.files?.modelo3d?.[0];
    if (modelo3d) {
      await galeriaModel.insertarElemento({
        producto_id: productoId,
        tipo: "modelo_3d",
        url: `/uploads/modelos/${modelo3d.filename}`
      });
    }

    res.status(201).json({
      mensaje: "✅ Producto creado correctamente con archivos.",
      id: productoId
    });
  } catch (error) {
    console.error("❌ Error al agregar producto con archivos:", error);
    res.status(500).json({ mensaje: "Error interno al crear producto con archivos." });
  }
};

// ─────────────────────────────────────────────
// ✏️ PUT /api/productos/:id
// ─────────────────────────────────────────────
exports.actualizarProducto = async (req, res) => {
  const { id } = req.params;
  const datos = req.body;
  const camposObligatorios = ["nombre", "precio", "categoria_id"];

  for (const campo of camposObligatorios) {
    if (!datos[campo]) {
      return res.status(400).json({ mensaje: `El campo '${campo}' es obligatorio.` });
    }
  }

  try {
    await productosModel.actualizarProducto(id, datos);
    res.status(200).json({ mensaje: "✅ Producto actualizado correctamente." });
  } catch (error) {
    console.error(`❌ Error al actualizar producto ID ${id}:`, error);
    res.status(500).json({ mensaje: "Error interno al actualizar producto." });
  }
};

// ─────────────────────────────────────────────
// 🗑️ DELETE /api/productos/:id
// ─────────────────────────────────────────────
exports.eliminarProducto = async (req, res) => {
  const { id } = req.params;

  try {
    await productosModel.eliminarProducto(id);
    res.status(200).json({ mensaje: "🗑️ Producto eliminado correctamente." });
  } catch (error) {
    console.error(`❌ Error al eliminar producto ID ${id}:`, error);
    res.status(500).json({ mensaje: "Error interno al eliminar producto." });
  }
};
