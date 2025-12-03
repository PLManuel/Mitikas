import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generarBoletaPdf(pedido) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // === ESTILOS ===
    const colorPrincipal = '#B71C1C';
    const colorSecundario = '#9E9E9E';
    const colorTexto = '#212121';

    // === LOGO ===
    const logoPath = path.join(__dirname, '../assets/mitikas.png');
    try {
      doc.image(logoPath, 40, 15, { width: 95 });
    } catch {
      doc.fontSize(18).fillColor(colorPrincipal).text('MITIKAS', 40, 30);
    }

    // === CABECERA DERECHA ===
    doc
      .fontSize(16)
      .fillColor(colorPrincipal)
      .text('BOLETA DE VENTA', 0, 30, { align: 'right' });

    doc
      .fontSize(10)
      .fillColor(colorSecundario)
      .text(`Nº ${String(pedido.id).padStart(6, '0')}`, { align: 'right' });

    doc
      .fontSize(9)
      .fillColor(colorTexto)
      .text(
        `Fecha: ${new Date(pedido.fecha).toLocaleDateString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        { align: 'right' }
      );

    doc.moveDown(1.5);

    // === SEPARADOR ===
    doc
      .moveTo(40, doc.y)
      .lineTo(555, doc.y)
      .strokeColor(colorPrincipal)
      .lineWidth(1.2)
      .stroke();

    doc.moveDown();

    // === DATOS DEL CLIENTE ===
    doc.fontSize(11).fillColor(colorPrincipal).text('Datos del Cliente', 40);
    doc.moveDown(0.5);

    doc.fontSize(9).fillColor(colorTexto);
    doc.text(`Cliente: ${pedido.nombre || ''} ${pedido.apellido || ''}`, 40);
    doc.text(`Dirección: ${pedido.direccion || 'N/A'}`, 40);
    if (pedido.distrito) doc.text(`Distrito: ${pedido.distrito}`, 40);

    doc.moveDown(1);

    // === DETALLE DE PRODUCTOS ===
    doc.fontSize(11).fillColor(colorPrincipal).text('Detalle de Productos', 40);
    doc.moveDown(0.3);

    // === ENCABEZADO DE TABLA ===
    const tableTop = doc.y;

    doc.rect(40, tableTop, 515, 20).fill(colorPrincipal);

    doc
      .fontSize(9)
      .fillColor('#FFFFFF')
      .text('PRODUCTO', 50, tableTop + 5)
      .text('CANT.', 300, tableTop + 5, { width: 40 })
      .text('P. UNIT.', 360, tableTop + 5, { width: 70 })
      .text('SUBTOTAL', 455, tableTop + 5, { width: 90 });

    let y = tableTop + 22;

    // === ITEMS ===
    pedido.productos.forEach((p, idx) => {
      if (idx % 2 === 0) {
        doc.rect(40, y, 515, 20).fill('#FAFAFA');
      }

      const nombre = `${p.nombreProducto}${p.tamano ? ' (' + p.tamano + ')' : ''}`;
      const cantidad = p.cantidad;
      const precioOriginal = Number(p.precioUnitario);
      const precioFinal =
        p.precioPromocion !== null && p.precioPromocion !== undefined
          ? Number(p.precioPromocion)
          : precioOriginal;

      const subtotal = (precioFinal * cantidad).toFixed(2);
      const tieneDescuento = precioFinal < precioOriginal;

      // Nombre
      doc.fillColor(colorTexto).fontSize(9);
      doc.text(nombre, 50, y + 4, { width: 235 });

      // Cantidad
      doc.text(String(cantidad), 300, y + 4, { width: 40, align: 'center' });

      // Precio Unitario
      if (tieneDescuento) {
        doc.fontSize(8).fillColor(colorSecundario);
        doc.text(`S/ ${precioOriginal.toFixed(2)}`, 360, y + 2);
        doc
          .moveTo(360, y + 9)
          .lineTo(400, y + 9)
          .strokeColor(colorSecundario)
          .lineWidth(0.5)
          .stroke();

        doc.fontSize(9).fillColor('#0A8F08');
        doc.text(`S/ ${precioFinal.toFixed(2)}`, 360, y + 10);
      } else {
        doc.fontSize(9).fillColor(colorTexto);
        doc.text(`S/ ${precioOriginal.toFixed(2)}`, 360, y + 4);
      }

      // Subtotal
      doc.fontSize(9).fillColor(colorTexto);
      doc.text(`S/ ${subtotal}`, 455, y + 4, { width: 90, align: 'right' });

      y += 20;

      // Salto de página
      if (y > 700) {
        doc.addPage();
        y = 40;
      }
    });

    // === LÍNEA SEPARADORA ANTES DE TOTALES ===
    doc
      .moveTo(350, y + 5)
      .lineTo(555, y + 5)
      .strokeColor(colorSecundario)
      .lineWidth(1)
      .stroke();

    const totalsY = y + 15;

    // === TOTALES ===
    doc.fontSize(9).fillColor(colorTexto);

    doc.text('Subtotal:', 380, totalsY);
    doc.text(`S/ ${Number(pedido.subtotal).toFixed(2)}`, 455, totalsY, {
      width: 100,
      align: 'right',
    });

    if (Number(pedido.descuentos) > 0) {
      doc.fillColor('#0A8F08');
      doc.text('Descuentos:', 380, totalsY + 14);
      doc.text(`- S/ ${Number(pedido.descuentos).toFixed(2)}`, 455, totalsY + 14, {
        width: 100,
        align: 'right',
      });
    }

    doc.fillColor(colorTexto);
    doc.text('Costo Envío:', 380, totalsY + 28);
    doc.text(`S/ ${Number(pedido.costoEnvio).toFixed(2)}`, 455, totalsY + 28, {
      width: 100,
      align: 'right',
    });

    // === TOTAL FINAL ===
    doc.rect(350, totalsY + 45, 205, 24).fill(colorPrincipal);
    doc.fontSize(11).fillColor('#FFFFFF');
    doc.text('TOTAL:', 360, totalsY + 52);
    doc.text(`S/ ${Number(pedido.total).toFixed(2)}`, 455, totalsY + 52, {
      width: 100,
      align: 'right',
    });

    // === PIE DE PÁGINA ===
    doc.fontSize(8).fillColor(colorSecundario);
    doc.text(
      'Av. Aviación 5095, Tienda 78-79, Surco - Lima, Perú',
      40,
      770,
      { width: 515, align: 'center' }
    );
    doc.text('¡Gracias por su compra!', 40, 785, {
      width: 515,
      align: 'center',
    });

    doc.end();
  });
}
