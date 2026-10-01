export const crearFactura = async (req, res) => {
  try {
    const { 
      clienteId, 
      numero, 
      fechaVencimiento, 
      terminosCondiciones, 
      metodoPago, 
      articulos,
      presupuestoId // Opcional
    } = req.body;

    if (!numero) {
      return res.status(400).json({ error: "El número de factura es obligatorio" });
    }

    let datosArticulos = [];
    let totalAcumulado = 0;
    let idDelCliente = clienteId; // 👈 Declarada correctamente en el ámbito principal

    // CASO A: Si la factura viene de un presupuesto aprobado
    if (presupuestoId) {
      const presupuesto = await req.db.presupuesto.findUnique({
        where: { id: presupuestoId },
        include: { articulos: true }
      });

      if (!presupuesto) {
        return res.status(404).json({ error: "El presupuesto de origen no existe" });
      }

      idDelCliente = presupuesto.clienteId;
      totalAcumulado = parseFloat(presupuesto.total);
      
      datosArticulos = presupuesto.articulos.map(item => ({
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.subtotal
      }));
    } 
    // CASO B: Es una factura directa desde cero
    else {
      if (!idDelCliente || !articulos || !articulos.length) {
        return res.status(400).json({ error: "Faltan datos requeridos (clienteId o articulos)" });
      }

      datosArticulos = articulos.map(item => {
        const cant = parseFloat(item.quantity || item.cantidad) || 0;
        const precio = parseFloat(item.unitPrice || item.precioUnitario) || 0;
        const sub = cant * precio;
        totalAcumulado += sub;

        return { 
          descripcion: item.descripcion, 
          cantidad: cant, 
          precioUnitario: precio, 
          subtotal: sub 
        };
      });
    }

    // Ejecutamos la transacción limpia en SQLite
    const nuevaFactura = await req.db.$transaction(async (tx) => {
      
      const facturaCreada = await tx.factura.create({
        data: {
          numero,
          fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
          terminosCondiciones,
          metodoPago,
          total: totalAcumulado,
          cliente: { connect: { id: idDelCliente } },
          articulos: { create: datosArticulos },
          // Relación nativa mapeada correctamente para Prisma
          ...(presupuestoId && {
            presupuesto: { connect: { id: presupuestoId } }
          })
        },
        include: { cliente: true, articulos: true }
      });

      // Si venía de un presupuesto, cambiamos su estado a ACEPTADO
      if (presupuestoId) {
        await tx.presupuesto.update({
          where: { id: presupuestoId },
          data: { estado: 'ACEPTADO' }
        });
      }

      return facturaCreada;
    });

    return res.status(201).json(nuevaFactura);

  } catch (error) {
    console.error("Error al crear factura:", error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: "El número de factura ya existe" });
    }
    return res.status(500).json({ error: "Error en el servidor al generar la factura" });
  }
};
