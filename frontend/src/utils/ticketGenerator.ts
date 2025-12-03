import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

interface TicketData {
  codigoReserva: string;
  vuelo: {
    numeroVuelo: string;
    aerolinea: string;
    origen: { codigo: string; aeropuerto?: string; ciudad?: string };
    destino: { codigo: string; aeropuerto?: string; ciudad?: string };
    fechaSalida: string | Date;
    horaSalida: string;
    duracion?: string;
  };
  asiento: {
    numero: string;
    tipo?: string;
  };
  pasajero: {
    nombre: string;
    apellido: string;
  };
  equipaje?: {
    mano: { incluido: boolean; peso: number };
    documentado: { incluido: boolean; piezasIncluidas: number; piezasAdicionales: number; peso: number };
  };
}

export const generateBoardingPass = async (reserva: TicketData) => {
  const toastId = toast.loading('Imprimiendo boleto...');

  try {
    // 1. Generar QR
    const qrData = JSON.stringify({
      pnr: reserva.codigoReserva,
      flight: reserva.vuelo.numeroVuelo,
      seat: reserva.asiento.numero,
      passenger: `${reserva.pasajero.nombre} ${reserva.pasajero.apellido}`,
    });

    const qrUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 0,
      color: { dark: '#000000', light: '#ffffff' }
    });

    // 2. Configurar PDF (Tamaño Ticket: 210x90 mm)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [210, 90] 
    });

    // --- COLORES ---
    const aeroBlue = [37, 99, 235] as const; // Blue-600
    const textDark = [15, 23, 42] as const;  // Slate-900
    const textGray = [100, 116, 139] as const; // Slate-500
    const bgSeat = [241, 245, 249] as const; // Slate-100

    // --- BANDA LATERAL AZUL (Izquierda) ---
    pdf.setFillColor(...aeroBlue);
    pdf.rect(0, 0, 25, 90, 'F');
    
    // Logo vertical
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AeroLambda', 18, 75, { angle: 90 });

    // --- CABECERA ---
    pdf.setTextColor(...textDark);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PASE DE ABORDAR / BOARDING PASS', 35, 12);
    
    pdf.setFontSize(7);
    pdf.setTextColor(...textGray);
    pdf.setFont('helvetica', 'normal');
    pdf.text('ESTE DOCUMENTO CONFIRMA TU VUELO', 35, 16);

    // --- PASAJERO ---
    let yPos = 28;
    pdf.setFontSize(6);
    pdf.setTextColor(...textGray);
    pdf.text('PASAJERO / PASSENGER', 35, yPos);
    
    yPos += 5;
    pdf.setFontSize(14);
    pdf.setTextColor(...textDark);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${reserva.pasajero.nombre} ${reserva.pasajero.apellido}`.toUpperCase(), 35, yPos);

    // --- RUTA (Origen -> Destino) ---
    yPos = 48;
    const xOrigin = 35;
    const xDest = 85;

    // Etiquetas
    pdf.setFontSize(6);
    pdf.setTextColor(...textGray);
    pdf.setFont('helvetica', 'normal');
    pdf.text('DE / FROM', xOrigin, yPos);
    pdf.text('A / TO', xDest, yPos);

    // Códigos IATA (Grandes y Azules)
    pdf.setFontSize(28);
    pdf.setTextColor(...aeroBlue);
    pdf.setFont('helvetica', 'bold');
    pdf.text(reserva.vuelo.origen.codigo, xOrigin, yPos + 10);
    pdf.text(reserva.vuelo.destino.codigo, xDest, yPos + 10);

    // Ciudades (Debajo del código)
    const ciudadOrigin = reserva.vuelo.origen.ciudad || '';
    const ciudadDest = reserva.vuelo.destino.ciudad || '';
    
    pdf.setFontSize(8);
    pdf.setTextColor(...textDark);
    pdf.setFont('helvetica', 'bold');
    pdf.text(ciudadOrigin, xOrigin, yPos + 15);
    pdf.text(ciudadDest, xDest, yPos + 15);

    // ✅ NUEVO: Nombre del Aeropuerto (Debajo de la ciudad)
    const aeroOrigin = reserva.vuelo.origen.aeropuerto || '';
    const aeroDest = reserva.vuelo.destino.aeropuerto || '';

    pdf.setFontSize(5);
    pdf.setTextColor(...textGray);
    pdf.setFont('helvetica', 'normal');
    
    // Ajustamos el ancho máximo del texto a 40mm para que no se encimen
    const splitOrigin = pdf.splitTextToSize(aeroOrigin, 40);
    const splitDest = pdf.splitTextToSize(aeroDest, 40);
    
    pdf.text(splitOrigin, xOrigin, yPos + 18);
    pdf.text(splitDest, xDest, yPos + 18);

    // --- DETALLES INFERIORES (Vuelo, Fecha, Hora) ---
    yPos = 75;
    const gap = 30;
    
    // Headers
    pdf.setFontSize(6);
    pdf.setTextColor(...textGray);
    pdf.text('VUELO / FLIGHT', xOrigin, yPos);
    pdf.text('FECHA / DATE', xOrigin + gap, yPos);
    pdf.text('HORA / TIME', xOrigin + gap * 2, yPos);

    // Values
    pdf.setFontSize(10);
    pdf.setTextColor(...textDark);
    pdf.setFont('helvetica', 'bold');
    pdf.text(reserva.vuelo.numeroVuelo, xOrigin, yPos + 5);
    
    const fecha = new Date(reserva.vuelo.fechaSalida).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    pdf.text(fecha, xOrigin + gap, yPos + 5);
    
    pdf.text(reserva.vuelo.horaSalida, xOrigin + gap * 2, yPos + 5);

    // --- EQUIPAJE (Pie de página) ---
    if (reserva.equipaje) {
      pdf.setFontSize(6);
      pdf.setTextColor(...textGray);
      pdf.setFont('helvetica', 'normal');
      let equipajeStr = `EQUIPAJE: `;
      if (reserva.equipaje.mano.incluido) equipajeStr += `Mano ${reserva.equipaje.mano.peso}kg `;
      if (reserva.equipaje.documentado.incluido) equipajeStr += `+ Doc ${reserva.equipaje.documentado.peso}kg`;
      pdf.text(equipajeStr, xOrigin, 85);
    }

    // ==========================================
    // SECCIÓN DERECHA
    // ==========================================
    
    // Línea punteada
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineDashPattern([2, 2], 0);
    pdf.line(150, 5, 150, 85);
    pdf.setLineDashPattern([], 0);

    const rightStart = 160;

    // Caja de Asiento
    pdf.setFillColor(...bgSeat);
    pdf.rect(rightStart, 15, 35, 20, 'F');
    
    pdf.setFontSize(6);
    pdf.setTextColor(...textGray);
    pdf.text('ASIENTO / SEAT', rightStart + 17.5, 20, { align: 'center' });
    
    pdf.setFontSize(22);
    pdf.setTextColor(...textDark);
    pdf.setFont('helvetica', 'bold');
    pdf.text(reserva.asiento.numero, rightStart + 17.5, 30, { align: 'center' });

    // Clase
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'normal');
    pdf.text(reserva.asiento.tipo === 'ejecutiva' ? 'EJECUTIVA' : 'ECONÓMICA', rightStart + 17.5, 38, { align: 'center' });

    // QR CODE
    pdf.addImage(qrUrl, 'PNG', rightStart + 2, 45, 30, 30);

    // Pasajero Stub
    pdf.setFontSize(5);
    pdf.setTextColor(...textGray);
    pdf.text(reserva.pasajero.apellido.toUpperCase(), 205, 50, { angle: 90 });
    pdf.text(reserva.vuelo.numeroVuelo, 208, 50, { angle: 90 });

    // Guardar
    pdf.save(`Boleto-${reserva.codigoReserva}.pdf`);
    toast.success('Boleto generado exitosamente', { id: toastId });
  } catch (error) {
    console.error('Error PDF:', error);
    toast.error('Error al generar el boleto', { id: toastId });
  }
};