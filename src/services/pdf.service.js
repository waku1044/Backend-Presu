import PDFDocument from 'pdfkit';

export const generarPdfDocumento = (res, datos, tipo = 'PRESUPUESTO') => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Configuramos los headers HTTP para que el navegador entienda que es un archivo de descarga
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${tipo}-${datos.numero}.pdf`);

  // Conectamos el flujo del PDF directamente a la respuesta Express
  doc.pipe(res);

  // --- DISEÑO DEL PDF ---

  // 1. Encabezado del Negocio
  doc.fillColor('#1e3a8a').fontSize(20).text('WalTech', 50, 50, { bold: true });
  doc.fillColor('#4b5563').fontSize(10).text('Refrigeración y Electricidad Domiciliaria', 50, 75);
  
  // Tipo de Documento y Número (Derecha)
  doc.fillColor('#1e3a8a').fontSize(16).text(tipo.toUpperCase(), 400, 50, { align: 'right' });
  doc.fillColor('#4b5563').fontSize(11).text(`Número: ${datos.numero}`, 400, 70, { align: 'right' });
  doc.text(`Fecha: ${new Date(datos.fechaEmision).toLocaleDateString()}`, 400, 85, { align: 'right' });

 // 🕒 Si el documento tiene fecha de vencimiento, la agregamos al PDF
  if (datos.fechaVencimiento) {
    doc.fillColor('#b91c1c').text(`Vence: ${new Date(datos.fechaVencimiento).toLocaleDateString()}`, 400, 100, { align: 'right', bold: true });
  }

  doc.moveDown(2);
  doc.lineWidth(1).moveTo(50, 115).lineTo(550, 115).stroke('#e5e7eb');

  // 2. Información del Cliente (Izquierda)
  doc.fillColor('#1e3a8a').fontSize(12).text('CLIENTE:', 50, 135, { bold: true });
  doc.fillColor('#1f2937').fontSize(11).text(`Nombre: ${datos.cliente.nombre}`, 50, 155);
  if (datos.cliente.identificacionFiscal) doc.text(`Identificación: ${datos.cliente.identificacionFiscal}`, 50, 170);
  if (datos.cliente.direccion) doc.text(`Dirección: ${datos.cliente.direccion}, ${datos.cliente.ciudad || ''}`, 50, 185);
  if (datos.cliente.telefono) doc.text(`Teléfono: ${datos.cliente.telefono}`, 50, 200);

  doc.moveDown(3);

  // 3. Tabla de Artículos / Servicios (Mano de Obra y Repuestos)
  let yTabla = 240;
  
  // Cabecera de la tabla
  doc.fillColor('#f3f4f6').rect(50, yTabla, 500, 20).fill();
  doc.fillColor('#1e3a8a').fontSize(10);
  doc.text('Descripción', 60, yTabla + 5, { width: 250 });
  doc.text('Cant.', 320, yTabla + 5, { width: 50, align: 'right' });
  doc.text('Precio U.', 390, yTabla + 5, { width: 70, align: 'right' });
  doc.text('Subtotal', 470, yTabla + 5, { width: 70, align: 'right' });

  yTabla += 25;
  doc.fillColor('#1f2937');

  // Filas de materiales o mano de obra
  datos.articulos.forEach((item) => {
    doc.text(item.descripcion, 60, yTabla, { width: 250 });
    doc.text(item.cantidad.toString(), 320, yTabla, { width: 50, align: 'right' });
    doc.text(`$${item.precioUnitario.toLocaleString()}`, 390, yTabla, { width: 70, align: 'right' });
    doc.text(`$${item.subtotal.toLocaleString()}`, 470, yTabla, { width: 70, align: 'right' });
    
    yTabla += 20;
  });

  doc.lineWidth(0.5).moveTo(50, yTabla).lineTo(550, yTabla).stroke('#e5e7eb');
  yTabla += 15;

  // 4. Bloque de Totales y Condiciones
  if (datos.terminosCondiciones) {
    doc.fillColor('#4b5563').fontSize(9).text('Términos y condiciones:', 50, yTabla);
    doc.text(datos.terminosCondiciones, 50, yTabla + 15, { width: 300 });
  }

  doc.fillColor('#1e3a8a').fontSize(14).text(`TOTAL: $${datos.total.toLocaleString()}`, 400, yTabla, { align: 'right', bold: true });

  // Finalizamos el renderizado del documento
  doc.end();
};
