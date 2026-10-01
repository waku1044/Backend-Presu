import { Router } from 'express';
import { crearCliente, obtenerClientes } from '../controllers/clientes.controllers.js';
import { crearPresupuesto } from '../controllers/presupuestos.controllers.js';
import { crearFactura } from '../controllers/facturas.controllers.js';
// 🛠️ Importamos el generador de PDF
import { generarPdfDocumento } from '../services/pdf.service.js';

const router = Router();

router.post('/clientes', crearCliente);
router.get('/clientes', obtenerClientes);
router.post('/presupuestos', crearPresupuesto);
router.post('/facturas', crearFactura);

// 📄 Ruta para descargar PDF de Presupuesto
router.get('/presupuestos/:id/pdf', async (req, res) => {
  try {
    const presupuesto = await req.db.presupuesto.findUnique({
      where: { id: req.params.id },
      include: { cliente: true, articulos: true }
    });
    if (!presupuesto) return res.status(404).json({ error: "Presupuesto no encontrado" });
    
    generarPdfDocumento(res, presupuesto, 'PRESUPUESTO');
  } catch (error) {
    res.status(500).json({ error: "Error al generar el PDF" });
  }
});

// 📄 Ruta para descargar PDF de Factura
router.get('/facturas/:id/pdf', async (req, res) => {
  try {
    const factura = await req.db.factura.findUnique({
      where: { id: req.params.id },
      include: { cliente: true, articulos: true }
    });
    if (!factura) return res.status(404).json({ error: "Factura no encontrada" });
    
    generarPdfDocumento(res, factura, 'FACTURA');
  } catch (error) {
    res.status(500).json({ error: "Error al generar el PDF" });
  }
});

export default router;
