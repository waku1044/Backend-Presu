export const crearPresupuesto = async (req, res) => {
  try {
    const { 
      clienteId, 
      numero, 
      fechaVencimiento, 
      terminosCondiciones, // 🛠️ Unificado en español nativo
      metodoPago, 
      articulos 
    } = req.body;

    if (!clienteId || !numero || !articulos || !articulos.length) {
      return res.status(400).json({ 
        error: "Faltan campos requeridos (clienteId, numero o articulos)" 
      });
    }

    // 🕒 CÁLCULO AUTOMÁTICO: Si no viene fecha, sumamos exactamente 10 días a partir de hoy
    let fechaLimite = fechaVencimiento ? new Date(fechaVencimiento) : null;
    
    if (!fechaLimite) {
      const hoy = new Date();
      hoy.setDate(hoy.getDate() + 10);
      fechaLimite = hoy;
    }

    let totalAcumulado = 0;
    const articulosProcesados = articulos.map(item => {
      const cantidad = parseFloat(item.cantidad) || 0;
      const precioUnitario = parseFloat(item.precioUnitario) || 0;
      const subtotal = cantidad * precioUnitario;
      totalAcumulado += subtotal;

      return {
        descripcion: item.descripcion,
        cantidad: cantidad,
        precioUnitario: precioUnitario,
        subtotal: subtotal
      };
    });

    const nuevoPresupuesto = await req.db.presupuesto.create({
      data: {
        numero,
        fechaVencimiento: fechaLimite, // Guarda los 10 días automáticos
        terminosCondiciones,           // Mapeado directo en español
        metodoPago,
        total: totalAcumulado,
        cliente: { connect: { id: clienteId } },
        articulos: { create: articulosProcesados }
      },
      include: { cliente: true, articulos: true }
    });

    return res.status(201).json(nuevoPresupuesto);

  } catch (error) {
    console.error("Error al procesar el presupuesto:", error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: "Ese número de presupuesto ya está registrado" });
    }
    return res.status(500).json({ error: "Error en el servidor al generar el presupuesto" });
  }
};
