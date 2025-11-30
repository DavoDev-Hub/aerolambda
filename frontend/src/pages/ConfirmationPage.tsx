import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import Header from '@/components/flight/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Check,
  Plane,
  User,
  Calendar,
  Clock,
  AlertCircle,
  Download,
  Search,
  Luggage,
} from 'lucide-react';

export default function ConfirmationPage() {
  const { reservaId } = useParams<{ reservaId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reservaData, setReservaData] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Generar código QR
  useEffect(() => {
    if (reservaData) {
      const qrData = JSON.stringify({
        codigoReserva: reservaData.codigoReserva,
        vuelo: reservaData.vuelo?.numeroVuelo,
        asiento: reservaData.asiento?.numero,
        pasajero: `${reservaData.pasajero?.nombre} ${reservaData.pasajero?.apellido}`,
        origen: reservaData.vuelo?.origen?.codigo,
        destino: reservaData.vuelo?.destino?.codigo,
        fecha: new Date(reservaData.vuelo?.fechaSalida).toLocaleDateString('es-MX'),
        hora: reservaData.vuelo?.horaSalida,
      });

      QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e40af',
          light: '#ffffff'
        }
      })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('Error generando QR:', err));
    }
  }, [reservaData]);

  // Función para descargar PDF
  const handleDownloadPDF = async () => {
    if (!reservaData || !qrCodeUrl) return;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Colores - ✅ CORREGIDO con 'as const'
    const primaryColor = [37, 99, 235] as const;
    const lightBlue = [219, 234, 254] as const;
    const darkGray = [31, 41, 55] as const;
    const labelColor = [100, 116, 139] as const;
    const valueColor = [31, 41, 55] as const;
    const grayBorder = [200, 200, 200] as const;

    // === HEADER ===
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, pageWidth, 45, 'F');

    // Logo/Título
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AEROLAMBDA', pageWidth / 2, 18, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Pase de Abordar Digital', pageWidth / 2, 28, { align: 'center' });

    // Línea decorativa
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.5);
    pdf.line(20, 35, pageWidth - 20, 35);

    // === CÓDIGO QR ===
    const qrSize = 70;
    const qrX = (pageWidth - qrSize) / 2;
    const qrY = 55;
    
    pdf.addImage(qrCodeUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // Marco alrededor del QR
    pdf.setDrawColor(...primaryColor);
    pdf.setLineWidth(0.5);
    pdf.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4);

    // === CÓDIGO DE RESERVA ===
    let currentY = qrY + qrSize + 15;
    
    pdf.setFillColor(...lightBlue);
    pdf.roundedRect(20, currentY, pageWidth - 40, 15, 3, 3, 'F');
    
    pdf.setTextColor(...darkGray);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('CÓDIGO DE RESERVA', pageWidth / 2, currentY + 5, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setFont('courier', 'bold');
    pdf.text(reservaData.codigoReserva, pageWidth / 2, currentY + 12, { align: 'center' });

    currentY += 25;

    // === INFORMACIÓN DEL VUELO ===
    const vuelo = reservaData.vuelo;
    const asiento = reservaData.asiento;
    const pasajero = reservaData.pasajero;

    // Ruta grande
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryColor);
    pdf.text(`${vuelo.origen.codigo} → ${vuelo.destino.codigo}`, pageWidth / 2, currentY, { align: 'center' });

    currentY += 10;

    // Aeropuertos
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    const origenText = vuelo.origen.aeropuerto.substring(0, 35) + (vuelo.origen.aeropuerto.length > 35 ? '...' : '');
    const destinoText = vuelo.destino.aeropuerto.substring(0, 35) + (vuelo.destino.aeropuerto.length > 35 ? '...' : '');
    pdf.text(origenText, pageWidth / 2, currentY, { align: 'center' });
    currentY += 4;
    pdf.text(destinoText, pageWidth / 2, currentY, { align: 'center' });

    currentY += 12;

    // === DETALLES EN GRID ===
    const leftCol = 25;
    const rightCol = pageWidth / 2 + 10;

    // Vuelo
    pdf.setFontSize(8);
    pdf.setTextColor(...labelColor);
    pdf.setFont('helvetica', 'normal');
    pdf.text('VUELO', leftCol, currentY);
    pdf.setFontSize(12);
    pdf.setTextColor(...valueColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text(vuelo.numeroVuelo, leftCol, currentY + 5);

    // Fecha
    pdf.setFontSize(8);
    pdf.setTextColor(...labelColor);
    pdf.setFont('helvetica', 'normal');
    pdf.text('FECHA', rightCol, currentY);
    pdf.setFontSize(12);
    pdf.setTextColor(...valueColor);
    pdf.setFont('helvetica', 'bold');
    const fecha = new Date(vuelo.fechaSalida).toLocaleDateString('es-MX', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
    pdf.text(fecha, rightCol, currentY + 5);

    currentY += 15;

    // Hora
    pdf.setFontSize(8);
    pdf.setTextColor(...labelColor);
    pdf.setFont('helvetica', 'normal');
    pdf.text('HORA DE SALIDA', leftCol, currentY);
    pdf.setFontSize(12);
    pdf.setTextColor(...valueColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text(vuelo.horaSalida, leftCol, currentY + 5);

    // Duración
    pdf.setFontSize(8);
    pdf.setTextColor(...labelColor);
    pdf.setFont('helvetica', 'normal');
    pdf.text('DURACIÓN', rightCol, currentY);
    pdf.setFontSize(12);
    pdf.setTextColor(...valueColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text(vuelo.duracion, rightCol, currentY + 5);

    currentY += 15;

    // Asiento
    pdf.setFontSize(8);
    pdf.setTextColor(...labelColor);
    pdf.setFont('helvetica', 'normal');
    pdf.text('ASIENTO', leftCol, currentY);
    pdf.setFontSize(16);
    pdf.setTextColor(...primaryColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text(asiento.numero, leftCol, currentY + 6);

    // Clase
    pdf.setFontSize(8);
    pdf.setTextColor(...labelColor);
    pdf.setFont('helvetica', 'normal');
    pdf.text('CLASE', rightCol, currentY);
    pdf.setFontSize(12);
    pdf.setTextColor(...valueColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text(asiento.tipo === 'ejecutiva' ? 'Ejecutiva' : 'Económica', rightCol, currentY + 5);

    currentY += 18;

    // === PASAJERO ===
    pdf.setDrawColor(...grayBorder);
    pdf.line(20, currentY, pageWidth - 20, currentY);
    currentY += 8;

    pdf.setFontSize(8);
    pdf.setTextColor(...labelColor);
    pdf.setFont('helvetica', 'normal');
    pdf.text('PASAJERO', leftCol, currentY);
    pdf.setFontSize(12);
    pdf.setTextColor(...valueColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${pasajero.nombre} ${pasajero.apellido}`.toUpperCase(), leftCol, currentY + 5);

    currentY += 12;

    // Documento
    pdf.setFontSize(8);
    pdf.setTextColor(...labelColor);
    pdf.setFont('helvetica', 'normal');
    pdf.text('DOCUMENTO', leftCol, currentY);
    pdf.setFontSize(10);
    pdf.setTextColor(...valueColor);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${pasajero.tipoDocumento}: ${pasajero.numeroDocumento}`, leftCol, currentY + 5);

    currentY += 15;

    // === EQUIPAJE ===
    if (reservaData.equipaje) {
      pdf.setDrawColor(...grayBorder);
      pdf.line(20, currentY, pageWidth - 20, currentY);
      currentY += 8;

      pdf.setFontSize(10);
      pdf.setTextColor(...primaryColor);
      pdf.setFont('helvetica', 'bold');
      pdf.text('🧳 EQUIPAJE INCLUIDO', leftCol, currentY);
      currentY += 7;

      pdf.setFontSize(9);
      pdf.setTextColor(...valueColor);
      pdf.setFont('helvetica', 'normal');

      if (reservaData.equipaje.mano.incluido) {
        pdf.text(`✓ Equipaje de mano: ${reservaData.equipaje.mano.peso}kg (${reservaData.equipaje.mano.dimensiones})`, leftCol + 3, currentY);
        currentY += 5;
      }

      if (reservaData.equipaje.documentado.incluido) {
        const totalPiezas = reservaData.equipaje.documentado.piezasIncluidas + reservaData.equipaje.documentado.piezasAdicionales;
        pdf.text(`✓ Equipaje documentado: ${totalPiezas} ${totalPiezas === 1 ? 'pieza' : 'piezas'} (${reservaData.equipaje.documentado.pesoMaximo}kg máx.)`, leftCol + 3, currentY);
        currentY += 5;
      }

      currentY += 5;
    }

    // === FOOTER - INSTRUCCIONES ===
    pdf.setDrawColor(...grayBorder);
    pdf.line(20, currentY, pageWidth - 20, currentY);
    currentY += 8;

    pdf.setFillColor(...lightBlue);
    pdf.roundedRect(20, currentY, pageWidth - 40, 35, 2, 2, 'F');

    pdf.setFontSize(9);
    pdf.setTextColor(...primaryColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INSTRUCCIONES DE ABORDAJE', leftCol, currentY + 6);

    pdf.setFontSize(8);
    pdf.setTextColor(...darkGray);
    pdf.setFont('helvetica', 'normal');
    
    const instrucciones = [
      '• Presentarse en el aeropuerto 2 horas antes de la salida',
      '• Llevar documento de identidad oficial vigente',
      '• La puerta de embarque se cierra 30 minutos antes del despegue',
      '• Conserve este pase de abordar digital o impreso'
    ];

    let instrY = currentY + 12;
    instrucciones.forEach(inst => {
      pdf.text(inst, leftCol, instrY);
      instrY += 5;
    });

    // Precio pagado
    currentY = pageHeight - 25;
    pdf.setFillColor(...primaryColor);
    pdf.roundedRect(20, currentY, pageWidth - 40, 12, 2, 2, 'F');
    
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'normal');
    pdf.text('TOTAL PAGADO:', leftCol, currentY + 8);
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`$${reservaData.precioTotal.toLocaleString()} MXN`, pageWidth - 25, currentY + 8, { align: 'right' });

    // Footer final
    pdf.setFontSize(7);
    pdf.setTextColor(150, 150, 150);
    pdf.setFont('helvetica', 'italic');
    pdf.text('AeroLambda - Vuela con confianza', pageWidth / 2, pageHeight - 8, { align: 'center' });
    pdf.text(`Generado: ${new Date().toLocaleString('es-MX')}`, pageWidth / 2, pageHeight - 4, { align: 'center' });

    // Guardar PDF
    pdf.save(`Pase-de-Abordar-${reservaData.codigoReserva}.pdf`);
  };

  // Fetch reserva
  useEffect(() => {
    const fetchReserva = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`/api/reservas/${reservaId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al cargar la reserva');
        }

        if (data.success) {
          setReservaData(data.data);
        } else {
          throw new Error(data.message || 'Error al cargar la reserva');
        }
      } catch (err) {
        const error = err as Error;
        console.error('Error fetching booking:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (reservaId) {
      fetchReserva();
    }
  }, [reservaId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Generando tu pase de abordar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !reservaData) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error de carga</h3>
            <p className="text-gray-500 mb-6">{error || 'No se pudo cargar la confirmación'}</p>
            <Button onClick={() => navigate('/')} className="w-full">
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const vuelo = reservaData.vuelo;
  const asiento = reservaData.asiento;
  const pasajero = reservaData.pasajero;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />
      
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          
          {/* Mensaje de Éxito */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full mb-6 shadow-lg shadow-green-200"
            >
              <Check className="w-12 h-12 text-white stroke-[3]" />
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">¡Estás listo para volar!</h1>
            <p className="text-lg text-gray-600">
              Tu reserva <span className="font-mono font-bold text-primary">{reservaData.codigoReserva}</span> ha sido confirmada.
            </p>
          </motion.div>

          {/* Tarjeta con QR */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="overflow-hidden border-none shadow-2xl bg-white rounded-3xl mb-8 relative">
              
              {/* Header con ruta */}
              <div className="bg-primary p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-10 -translate-y-10">
                  <Plane className="w-64 h-64" />
                </div>
                
                <div className="relative z-10 flex justify-between items-start mb-6">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">Vuelo</p>
                    <p className="text-3xl font-bold tracking-wider">{vuelo.numeroVuelo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-sm font-medium mb-1">Clase</p>
                    <p className="text-xl font-bold capitalize">{asiento.tipo || 'Económica'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-4xl font-bold">{vuelo.origen.codigo}</p>
                    <p className="text-blue-100 text-xs mt-1 line-clamp-2 max-w-[120px]">
                      {vuelo.origen.aeropuerto}
                    </p>
                  </div>
                   
                  <div className="flex-1 px-4 flex flex-col items-center">
                    <div className="w-full flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                      <div className="flex-1 border-t-2 border-dashed border-blue-300/50 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <Plane className="w-5 h-5 text-white transform rotate-90" />
                        </div>
                      </div>
                      <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    </div>
                    <p className="text-xs text-blue-100 mt-2">{vuelo.duracion}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-4xl font-bold">{vuelo.destino.codigo}</p>
                    <p className="text-blue-100 text-xs mt-1 line-clamp-2 max-w-[120px]">
                      {vuelo.destino.aeropuerto}
                    </p>
                  </div>
                </div>
              </div>

              {/* CÓDIGO QR */}
              <div className="p-6 bg-gradient-to-b from-blue-50 to-white border-b-2 border-dashed border-gray-200">
                <div className="flex flex-col items-center">
                  <p className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">
                    Escanea tu pase de abordar
                  </p>
                  {qrCodeUrl && (
                    <div className="bg-white p-4 rounded-2xl shadow-lg border-4 border-primary/20">
                      <img 
                        src={qrCodeUrl} 
                        alt="Código QR" 
                        className="w-48 h-48"
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-4 text-center max-w-xs">
                    Presenta este código QR en el mostrador de documentación y en la puerta de embarque
                  </p>
                </div>
              </div>

              {/* Detalles del vuelo */}
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-8 gap-x-4">
                  
                  <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-1 text-xs uppercase font-bold tracking-wider">
                      <Calendar className="w-3 h-3" /> Fecha
                    </div>
                    <p className="font-bold text-gray-900 text-lg">
                      {new Date(vuelo.fechaSalida).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-1 text-xs uppercase font-bold tracking-wider">
                      <Clock className="w-3 h-3" /> Hora
                    </div>
                    <p className="font-bold text-gray-900 text-lg">
                      {vuelo.horaSalida}
                    </p>
                  </div>

                  <div className="col-span-2 sm:col-span-2">
                    <div className="flex items-center gap-2 text-gray-400 mb-1 text-xs uppercase font-bold tracking-wider">
                      <User className="w-3 h-3" /> Pasajero
                    </div>
                    <p className="font-bold text-gray-900 text-lg truncate">
                      {pasajero.nombre} {pasajero.apellido}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-1 text-xs uppercase font-bold tracking-wider">
                      <User className="w-3 h-3" /> Asiento
                    </div>
                    <p className="font-bold text-primary text-2xl">
                      {asiento.numero}
                    </p>
                  </div>
                </div>

                {/* Equipaje */}
                {reservaData.equipaje && (
                  <div className="border-t border-gray-100 pt-6 mt-6">
                    <div className="flex items-center gap-2 text-gray-400 mb-3 text-xs uppercase font-bold tracking-wider">
                      <Luggage className="w-3 h-3" /> Equipaje Incluido
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {reservaData.equipaje.mano.incluido && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <span className="font-medium text-gray-700">Mano:</span>
                          <p className="text-gray-600">{reservaData.equipaje.mano.peso}kg</p>
                        </div>
                      )}
                      {reservaData.equipaje.documentado.incluido && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <span className="font-medium text-gray-700">Documentado:</span>
                          <p className="text-gray-600">
                            {reservaData.equipaje.documentado.piezasIncluidas + reservaData.equipaje.documentado.piezasAdicionales} piezas ({reservaData.equipaje.documentado.pesoMaximo}kg)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Separador */}
              <div className="relative flex items-center justify-center">
                <div className="absolute left-0 w-6 h-6 bg-slate-50 rounded-full -translate-x-1/2"></div>
                <div className="w-full border-t-2 border-dashed border-gray-200"></div>
                <div className="absolute right-0 w-6 h-6 bg-slate-50 rounded-full translate-x-1/2"></div>
              </div>

              {/* Footer */}
              <div className="p-6 sm:p-8 bg-gray-50/50">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Código de Reserva</p>
                    <p className="text-2xl font-mono font-bold text-gray-900 tracking-widest">{reservaData.codigoReserva}</p>
                  </div>
                  
                  <div className="text-center sm:text-right">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Pagado</p>
                    <p className="text-2xl font-bold text-primary">${reservaData.precioTotal?.toLocaleString()} MXN</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
          
          {/* Botones de Acción */}
          <div className="space-y-3 max-w-md mx-auto">
            <Button 
              size="lg" 
              className="w-full h-14 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all text-base font-semibold flex items-center justify-center gap-2"
              onClick={handleDownloadPDF}
            >
              <Download className="w-5 h-5" />
              <span>Descargar pase en PDF</span>
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                size="lg" 
                className="h-12 bg-white hover:bg-gray-50 border-gray-200 flex items-center justify-center gap-2"
                onClick={() => navigate('/mis-reservas')}
              >
                <User className="w-4 h-4" />
                <span>Mis reservas</span>
              </Button>

              <Button 
                variant="outline" 
                size="lg" 
                className="h-12 bg-white hover:bg-gray-50 border-gray-200 flex items-center justify-center gap-2"
                onClick={() => navigate('/')}
              >
                <Search className="w-4 h-4" />
                <span>Buscar otro</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}