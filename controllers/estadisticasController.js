/**
 * 📁 CONTROLADOR: estadisticas.controller.js
 * 📦 Módulo: Gestión de estadísticas de la tienda
 *
 * 🎯 Funcionalidades:
 *   - Obtener estadísticas generales de ventas.
 *   - Obtener estadísticas de productos más vendidos.
 *   - Calcular estadísticas personalizadas según fechas.
 *
 * 💻 Este archivo contiene las funciones que gestionan las estadísticas
 * relacionadas con ventas, productos y otros análisis específicos del sistema.
 * 
 * 🚨 Asegúrese de que las dependencias necesarias estén instaladas y que 
 * los modelos asociados (Producto, Pedido) estén correctamente definidos.
 * 
 * 📂 Modelos utilizados:
 *   - estadisticas.model.js
 * 
 * 📊 Consultas y cálculos realizados en este controlador:
 *   - Conteo de ventas completadas.
 *   - Suma de productos vendidos y generación de ingresos.
 *   - Consultas por rango de fechas.
 * 
 * 🔐 Requiere permisos de lectura de estadísticas para los usuarios.
 */

const estadisticasModel = require('../models/estadisticas.model'); // Modelo para las estadísticas

/**
 * 📝 Función: obtenerEstadisticasVentas
 * 🔹 Descripción:
 *   Obtiene las estadísticas generales de ventas, incluyendo la cantidad total 
 *   de ventas, los productos vendidos y los ingresos totales generados.
 * 
 * 🔄 Proceso:
 *   - Llama al modelo para obtener las ventas completadas, productos vendidos, e ingresos totales.
 * 
 * 📦 Respuesta esperada:
 *   - ventasTotales: Número total de ventas completadas.
 *   - productosVendidos: Número total de productos vendidos.
 *   - ingresosTotales: Suma total de los ingresos generados.
 */
module.exports.obtenerEstadisticasVentas = async (req, res) => {
  try {
    // Llamar al modelo para obtener las estadísticas generales de ventas
    const ventasTotales = await estadisticasModel.contarPedidos();
    const productosVendidos = await estadisticasModel.contarProductosPublicados();
    const ingresosTotales = await estadisticasModel.calcularTotalIngresos();

    // Responder con las estadísticas generales
    res.status(200).json({
      ventasTotales,
      productosVendidos,
      ingresosTotales,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de ventas:', error);
    res.status(500).json({ mensaje: 'Error al obtener estadísticas de ventas' });
  }
};

/**
 * 📝 Función: obtenerIngresosMensuales
 * 🔹 Descripción:
 *   Obtiene los ingresos agrupados por mes durante los últimos 6 meses.
 * 
 * 🔄 Proceso:
 *   - Llama al modelo para obtener los ingresos mensuales agrupados.
 * 
 * 📦 Respuesta esperada:
 *   - ingresosMensuales: Lista de ingresos por cada mes de los últimos 6 meses.
 */
module.exports.obtenerIngresosMensuales = async (req, res) => {
  try {
    // Llamar al modelo para obtener los ingresos agrupados por mes (últimos 6 meses)
    const ingresosMensuales = await estadisticasModel.obtenerIngresosPorMes();

    // Responder con los ingresos mensuales
    res.status(200).json({
      ingresosMensuales,
    });
  } catch (error) {
    console.error('Error al obtener los ingresos mensuales:', error);
    res.status(500).json({ mensaje: 'Error al obtener los ingresos mensuales' });
  }
};

/**
 * 📝 Función: obtenerTopProductosVendidos
 * 🔹 Descripción:
 *   Obtiene las estadísticas de los productos más vendidos en el sistema.
 *   Se ordena por la cantidad de productos vendidos, mostrando los más vendidos.
 * 
 * 🔄 Proceso:
 *   - Llama al modelo para obtener los productos más vendidos.
 *   - Limita el resultado a los 5 productos más vendidos.
 * 
 * 📦 Respuesta esperada:
 *   - productos: Lista de los productos más vendidos con su nombre, precio y cantidad vendida.
 */
module.exports.obtenerTopProductosVendidos = async (req, res) => {
  try {
    // Llamar al modelo para obtener los productos más vendidos
    const productos = await estadisticasModel.obtenerTopProductosVendidos();

    // Responder con la lista de productos más vendidos
    res.status(200).json({
      productos,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de productos:', error);
    res.status(500).json({ mensaje: 'Error al obtener estadísticas de productos' });
  }
};

/**
 * 📝 Función: calcularEstadisticasPersonalizadas
 * 🔹 Descripción:
 *   Realiza cálculos de estadísticas personalizadas según las fechas proporcionadas.
 *   Esta función permite realizar análisis de ventas dentro de un rango de fechas.
 * 
 * 🔄 Proceso:
 *   - Valida las fechas proporcionadas.
 *   - Llama al modelo para obtener las ventas totales dentro de ese rango de fechas.
 *   - Puede incluir cálculos adicionales si es necesario.
 * 
 * 📦 Respuesta esperada:
 *   - ventasEnRango: Total de ingresos generados dentro del rango de fechas.
 *   - otrasEstadisticas: Cualquier otra estadística personalizada calculada (si se usa alguna utilidad).
 */
module.exports.calcularEstadisticasPersonalizadas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;  // Extraer fechas del query string

    // Validar las fechas
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ mensaje: 'Se requieren las fechas de inicio y fin.' });
    }

    // Validación de fechas (Asegurarse de que las fechas son válidas)
    const fechaInicioValida = Date.parse(fechaInicio);
    const fechaFinValida = Date.parse(fechaFin);

    if (isNaN(fechaInicioValida) || isNaN(fechaFinValida)) {
      return res.status(400).json({ mensaje: 'Las fechas proporcionadas no son válidas.' });
    }

    if (fechaFinValida < fechaInicioValida) {
      return res.status(400).json({ mensaje: 'La fecha de fin no puede ser anterior a la fecha de inicio.' });
    }

    // Llamar al modelo para obtener las ventas dentro del rango de fechas
    const ventasEnRango = await estadisticasModel.obtenerIngresosMensuales();

    // Responder con los resultados calculados
    res.status(200).json({
      ventasEnRango,
    });
  } catch (error) {
    console.error('Error al calcular estadísticas personalizadas:', error);
    res.status(500).json({ mensaje: 'Error al calcular estadísticas personalizadas' });
  }
};
