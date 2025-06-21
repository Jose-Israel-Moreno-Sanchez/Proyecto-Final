/**
 * 📁 CONTROLADOR: marcasController.js
 * 📦 TABLA: marcas
 *
 * 🎯 Funcionalidad:
 *   - Listar marcas activas
 *   - Crear, editar y eliminar marcas
 *
 * 🧠 Accede a:
 *   - Modelo: marca.model.js
 *   - Rutas: definidas en routes/marcas.routes.js
 *   - Seguridad: autenticación y control por roles (admin/vendedor)
 */

const marcaModel = require("../models/marketing.model");

/**
 * 📋 GET /marcas
 * Obtener todas las marcas activas ordenadas por prioridad visual
 */
async function obtenerMarcas(req, res) {
  try {
    const marcas = await marcaModel.obtenerMarcasActivas();
    return res.status(200).json(marcas);
  } catch (error) {
    console.error("❌ Error al obtener marcas activas:", error);
    return res.status(500).json({ message: "Error interno al obtener marcas." });
  }
}

/**
 * ➕ POST /marcas
 * Agregar una nueva marca
 */
async function agregarMarca(req, res) {
  try {
    await marcaModel.insertarMarca(req.body);
    return res.status(201).json({ message: "Marca creada correctamente." });
  } catch (error) {
    console.error("❌ Error al agregar marca:", error);
    return res.status(500).json({ message: "Error interno al agregar marca." });
  }
}

/**
 * 🔍 GET /marcas/:id
 * Obtener una marca específica por su ID
 */
async function obtenerMarcaPorId(req, res) {
  const { id } = req.params;

  try {
    const marca = await marcaModel.obtenerMarcaPorId(id);
    if (!marca) {
      return res.status(404).json({ message: "Marca no encontrada." });
    }
    return res.status(200).json(marca);
  } catch (error) {
    console.error("❌ Error al obtener marca por ID:", error);
    return res.status(500).json({ message: "Error interno al obtener la marca." });
  }
}

/**
 * ✏️ PUT /marcas/:id
 * Actualizar los datos de una marca existente
 */
async function actualizarMarca(req, res) {
  const { id } = req.params;

  try {
    const existente = await marcaModel.obtenerMarcaPorId(id);
    if (!existente) {
      return res.status(404).json({ message: "Marca no encontrada." });
    }

    await marcaModel.actualizarMarca(id, req.body);
    return res.status(200).json({ message: "Marca actualizada correctamente." });
  } catch (error) {
    console.error("❌ Error al actualizar marca:", error);
    return res.status(500).json({ message: "Error interno al actualizar marca." });
  }
}

/**
 * 🗑️ DELETE /marcas/:id
 * Borrado lógico: desactiva la marca sin eliminarla físicamente
 */
async function eliminarMarca(req, res) {
  const { id } = req.params;

  try {
    const marca = await marcaModel.obtenerMarcaPorId(id);
    if (!marca) {
      return res.status(404).json({ message: "Marca no encontrada." });
    }

    await marcaModel.desactivarMarca(id);
    return res.status(200).json({ message: "Marca eliminada correctamente." });
  } catch (error) {
    console.error("❌ Error al eliminar marca:", error);
    return res.status(500).json({ message: "Error interno al eliminar marca." });
  }
}

module.exports = {
  obtenerMarcas,
  agregarMarca,
  obtenerMarcaPorId,
  actualizarMarca,
  eliminarMarca
};
