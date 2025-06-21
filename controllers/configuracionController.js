const configuracionModel = require("../models/configuracion.model");

/**
 * 📦 Obtener todas las configuraciones del sistema.
 */
async function obtenerTodasConfiguraciones(req, res) {
  try {
    const configuraciones = await configuracionModel.obtenerTodas();
    
    if (!configuraciones || configuraciones.length === 0) {
      return res.status(404).json({ message: "No se encontraron configuraciones." });
    }

    res.status(200).json(configuraciones);
  } catch (error) {
    console.error("❌ Error al obtener configuraciones:", error);
    res.status(500).json({
      message: "Error interno al obtener configuraciones.",
      error: error.message || error
    });
  }
}

/**
 * 🔍 Obtener una configuración específica por clave.
 */
async function obtenerConfiguracionPorClave(req, res) {
  const { clave } = req.params;

  try {
    const config = await configuracionModel.obtenerConfiguracionPorClave(clave);

    if (!config) {
      return res.status(404).json({ message: "Configuración no encontrada." });
    }

    res.status(200).json(config);
  } catch (error) {
    console.error("❌ Error al obtener configuración:", error);
    res.status(500).json({
      message: "Error interno al obtener la configuración.",
      error: error.message || error
    });
  }
}

/**
 * ✏️ Actualizar una configuración existente.
 */
async function actualizarConfiguracion(req, res) {
  const { clave } = req.params;
  const nuevoValor = req.body.valor_json;

  // Validación del campo 'valor_json' en el cuerpo de la solicitud
  if (!nuevoValor) {
    return res.status(400).json({ message: "El campo 'valor_json' es obligatorio y debe ser un JSON válido." });
  }

  try {
    const config = await configuracionModel.obtenerConfiguracionPorClave(clave);

    if (!config) {
      return res.status(404).json({ message: "Configuración no encontrada." });
    }

    if (!config.modificable) {
      return res.status(403).json({ message: "Esta configuración no puede modificarse." });
    }

    if (!validarTipoDato(nuevoValor, config.tipo_dato)) {
      return res.status(400).json({
        message: `El valor proporcionado no es válido para el tipo '${config.tipo_dato}'.`
      });
    }

    // Guardar la configuración actualizada
    await configuracionModel.guardarConfiguracion({
      clave,
      valor: nuevoValor
    });

    res.status(200).json({ message: "Configuración actualizada correctamente." });
  } catch (error) {
    console.error("❌ Error al actualizar configuración:", error);
    res.status(500).json({
      message: "Error interno al actualizar configuración.",
      error: error.message || error
    });
  }
}

/**
 * ✅ Valida el tipo de dato del valor que se desea guardar
 */
function validarTipoDato(valor, tipo) {
  switch (tipo) {
    case "texto":
      return typeof valor === "string" && valor.trim().length > 0;
    case "numero":
      return typeof valor === "number" && isFinite(valor);
    case "booleano":
      return typeof valor === "boolean";
    case "lista":
      return Array.isArray(valor) && valor.every(v => typeof v === "string" || typeof v === "number");
    case "json":
      try {
        JSON.parse(valor); // Verifica si el valor es un JSON válido
        return true;
      } catch (e) {
        return false; // Si no es un JSON válido, retorna false
      }
    default:
      return false;
  }
}

// Exportación de las funciones del controlador
module.exports = {
  obtenerTodasConfiguraciones,
  obtenerConfiguracionPorClave,
  actualizarConfiguracion
};
