/**
 * 📦 carrito-verificacion.js
 * 
 * Descripción:
 * Este archivo contiene la lógica para la verificación de stock y creación de un pedido 
 * desde el carrito de compras en TianguiStore. Permite consultar el carrito de productos, 
 * verificar la disponibilidad de stock para cada producto y realizar el pedido si todo es válido.
 * 
 * Autor: I.S.C. Erick Renato Vega Ceron
 * Fecha de Creación: Mayo 2025
 */

 // Obtener el token JWT desde el almacenamiento local
 const token = localStorage.getItem("token");

 /**
  * 🔐 Función para obtener el carrito desde la API, utilizando el JWT.
  * Realiza una solicitud GET al backend para obtener los productos en el carrito.
  * 
  * @returns {Promise<Object[]>} - Devuelve los productos en el carrito.
  * @throws {Error} - Si ocurre un error al obtener el carrito.
  */
 async function obtenerCarritoDesdeAPI() {
   try {
     const res = await fetch("/carrito", {
       method: "GET",
       headers: {
         "Authorization": `Bearer ${token}`
       }
     });
 
     if (!res.ok) {
       throw new Error("No se pudo obtener el carrito desde la API");
     }
 
     return await res.json();
   } catch (err) {
     console.error("❌ Error al obtener el carrito:", err);
     throw new Error("Error al obtener el carrito.");
   }
 }
 
 /**
  * ✅ Función para verificar el stock de cada producto en el carrito.
  * Para cada producto, realiza una consulta al backend para verificar si 
  * el stock disponible es suficiente para la cantidad solicitada.
  * 
  * @param {Object[]} carrito - Los productos en el carrito.
  * @returns {string[]} - Lista de errores, si los hay, de productos con stock insuficiente.
  */
 async function verificarStockAntesDeEnviar(carrito) {
   const errores = [];
 
   for (const item of carrito) {
     try {
       const res = await fetch(`/productos/${item.producto_id}`);
       if (!res.ok) throw new Error("No se pudo obtener producto");
 
       const producto = await res.json();
 
       // Verificar si la cantidad solicitada excede el stock disponible
       if (item.cantidad > producto.stock) {
         errores.push(`⚠️ El producto "${producto.nombre}" solo tiene ${producto.stock} unidades disponibles.`);
       }
     } catch (err) {
       errores.push(`❌ Error al verificar el producto con ID ${item.producto_id}: ${err.message}`);
     }
   }
 
   return errores;
 }
 
 /**
  * 🛒 Función para realizar un pedido desde el carrito si el stock es suficiente.
  * Si el stock es adecuado para todos los productos, se realiza la solicitud para
  * generar el pedido en el backend.
  */
 async function realizarPedidoDesdeCarrito() {
   try {
     // Obtener el carrito desde la API
     const carrito = await obtenerCarritoDesdeAPI();
 
     // Verificar el stock de los productos en el carrito
     const errores = await verificarStockAntesDeEnviar(carrito);
 
     if (errores.length > 0) {
       // Si hay errores (productos con stock insuficiente), mostrar alerta y no continuar
       alert("❌ No se puede procesar el pedido:\n\n" + errores.join("\n"));
       return;
     }
 
     // Si el stock es suficiente, realizar el pedido
     const res = await fetch("/pedidos/desde-carrito", {
       method: "POST",
       headers: {
         "Authorization": `Bearer ${token}`,
         "Content-Type": "application/json"
       },
       body: JSON.stringify({ carrito })
     });
 
     const datos = await res.json();
 
     if (res.ok) {
       alert("✅ Pedido generado con éxito");
       window.location.reload();
     } else {
       alert("❌ Error al generar el pedido:\n" + (datos?.mensaje || "Error desconocido."));
     }
 
   } catch (err) {
     console.error("❌ Error crítico al procesar el pedido:", err);
     alert("⚠️ Error inesperado al intentar procesar el pedido.");
   }
 }
 
 // 🧩 Asociar botón al evento de realizar pedido
 document.addEventListener("DOMContentLoaded", () => {
   const btnPedido = document.getElementById("btnRealizarPedido");
   if (btnPedido) {
     btnPedido.addEventListener("click", realizarPedidoDesdeCarrito);
   }
 });
 