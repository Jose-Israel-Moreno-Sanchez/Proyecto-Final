/**
 * 📁 CONTROLADOR: carritoController.js
 * 📦 MÓDULO: Carrito de compras del usuario autenticado
 *
 * 🧩 Este controlador permite:
 *   - Obtener el carrito actual
 *   - Agregar productos o actualizar cantidades
 *   - Eliminar un producto específico
 *   - Vaciar completamente el carrito
 *
 * 🔐 Todas las funciones dependen del `req.usuario.usuario_id` (autenticado por JWT).
 * 🧠 Usa `carritoModel.js` como modelo de acceso a datos.
 */

const validator = require("validator");
const carritoModel = require("../models/carrito.model");

/**
 * 📦 GET /carrito
 * Obtener todos los productos del carrito del usuario autenticado.
 * Requiere `usuario_id` desde el token JWT.
 */
async function obtenerCarrito(req, res) {
  const usuario_id = req.usuario?.usuario_id;
  if (!usuario_id)
    return res.status(403).json({ mensaje: "No autenticado." });

  try {
    const carrito = await carritoModel.obtenerCarritoPorUsuario(usuario_id);
    return res.json(carrito);
  } catch (error) {
    console.error("❌ Error al obtener el carrito:", error);
    return res.status(500).json({ mensaje: "Error interno al obtener el carrito." });
  }
}

/**
 * ➕ POST /carrito
 * Agregar un nuevo producto o incrementar cantidad si ya está en el carrito.
 *
 * Espera:
 *   - producto_id: entero positivo
 *   - cantidad: entero positivo
 */
async function agregarAlCarrito(req, res) {
  const usuario_id = req.usuario?.usuario_id;
  const { producto_id, cantidad } = req.body;

  if (!usuario_id)
    return res.status(403).json({ mensaje: "No autenticado." });

  // Validaciones de entrada
  if (
    !producto_id || !cantidad ||
    !validator.isInt(String(producto_id), { min: 1 }) ||
    !validator.isInt(String(cantidad), { min: 1 })
  ) {
    return res.status(400).json({ mensaje: "Producto y cantidad válidos son requeridos." });
  }

  try {
    // Buscar si el producto ya existe en el carrito
    const existente = await carritoModel.buscarProductoEnCarrito(usuario_id, producto_id);

    if (existente) {
      // Si ya está, actualiza la cantidad sumando
      const nuevaCantidad = existente.cantidad + Number(cantidad);
      await carritoModel.actualizarCantidad(usuario_id, producto_id, nuevaCantidad);
      return res.json({ mensaje: "Cantidad actualizada en el carrito." });
    } else {
      // Si no está, lo inserta
      await carritoModel.agregarProducto(usuario_id, producto_id, cantidad);
      return res.status(201).json({ mensaje: "Producto agregado al carrito." });
    }
  } catch (error) {
    console.error("❌ Error al modificar el carrito:", error);
    return res.status(500).json({ mensaje: "Error interno al modificar el carrito." });
  }
}

/**
 * 🗑️ DELETE /carrito/:id
 * Elimina un producto del carrito (por ID interno del registro en carrito).
 */
async function eliminarDelCarrito(req, res) {
  const usuario_id = req.usuario?.usuario_id;
  const { id } = req.params;

  if (!usuario_id)
    return res.status(403).json({ mensaje: "No autenticado." });

  if (!validator.isInt(id, { min: 1 })) {
    return res.status(400).json({ mensaje: "ID inválido para eliminar del carrito." });
  }

  try {
    await carritoModel.eliminarProductoPorId(id, usuario_id);
    return res.json({ mensaje: "Producto eliminado del carrito." });
  } catch (error) {
    console.error("❌ Error al eliminar del carrito:", error);
    return res.status(500).json({ mensaje: "Error interno al eliminar del carrito." });
  }
}

/**
 * 🧺 DELETE /carrito
 * Elimina todos los productos del carrito del usuario.
 */
async function vaciarCarrito(req, res) {
  const usuario_id = req.usuario?.usuario_id;
  if (!usuario_id)
    return res.status(403).json({ mensaje: "No autenticado." });

  try {
    await carritoModel.vaciarCarritoPorUsuario(usuario_id);
    return res.json({ mensaje: "Carrito vaciado correctamente." });
  } catch (error) {
    console.error("❌ Error al vaciar el carrito:", error);
    return res.status(500).json({ mensaje: "Error interno al vaciar el carrito." });
  }
}

module.exports = {
  obtenerCarrito,
  agregarAlCarrito,
  eliminarDelCarrito,
  vaciarCarrito
};
