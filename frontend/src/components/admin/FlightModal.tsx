import { useEffect, useState } from 'react';
import { Luggage, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

interface FlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (flightData: FlightFormData) => Promise<void>;
  flight?: Flight | null;
  mode: 'create' | 'edit';
}

export interface Flight {
  _id: string;
  numeroVuelo: string;
  aerolinea: string;
  origen: {
    ciudad: string;
    codigo: string;
    aeropuerto: string;
  };
  destino: {
    ciudad: string;
    codigo: string;
    aeropuerto: string;
  };
  fechaSalida: string;
  horaSalida: string;
  fechaLlegada: string;
  horaLlegada: string;
  duracion: string;
  precio: number;
  equipaje?: {
    mano: {
      permitido: boolean;
      peso: number;
      dimensiones: string;
    };
    documentado: {
      permitido: boolean;
      peso: number;
      piezas: number;
      precioExtra: number;
    };
  };
  capacidadTotal: number;
  asientosDisponibles: number;
  estado: string;
  tipoVuelo: string;
}

export interface FlightFormData {
  numeroVuelo: string;
  aerolinea: string;
  origen: {
    ciudad: string;
    codigo: string;
    aeropuerto: string;
  };
  destino: {
    ciudad: string;
    codigo: string;
    aeropuerto: string;
  };
  fechaSalida: string;
  horaSalida: string;
  fechaLlegada: string;
  horaLlegada: string;
  duracion: string;
  precio: number;
  equipaje: {
    mano: {
      permitido: boolean;
      peso: number;
      dimensiones: string;
    };
    documentado: {
      permitido: boolean;
      peso: number;
      piezas: number;
      precioExtra: number;
    };
  };
  capacidadTotal: number;
  estado: string;
  tipoVuelo: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function FlightModal({ isOpen, onClose, onSave, flight, mode }: FlightModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  // Estados separados para duración (más fácil de usar)
  const [duracionHoras, setDuracionHoras] = useState<string>('');
  const [duracionMinutos, setDuracionMinutos] = useState<string>('');
  
  const [formData, setFormData] = useState<FlightFormData>({
    numeroVuelo: '',
    aerolinea: 'AeroLambda',
    origen: { ciudad: '', codigo: '', aeropuerto: '' },
    destino: { ciudad: '', codigo: '', aeropuerto: '' },
    fechaSalida: '',
    horaSalida: '',
    fechaLlegada: '',
    horaLlegada: '',
    duracion: '',
    precio: 0,
    equipaje: {
      mano: { permitido: true, peso: 10, dimensiones: '55x40x20 cm' },
      documentado: { permitido: true, peso: 23, piezas: 1, precioExtra: 500 }
    },
    capacidadTotal: 180,
    estado: 'programado',
    tipoVuelo: 'directo',
  });

  // Parsear duración cuando se carga un vuelo existente
  const parseDuracion = (duracion: string) => {
    const match = duracion.match(/(\d+)h?\s*(\d+)?m?/i);
    if (match) {
      setDuracionHoras(match[1] || '0');
      setDuracionMinutos(match[2] || '0');
    }
  };

  useEffect(() => {
    if (flight && mode === 'edit') {
      setFormData({
        numeroVuelo: flight.numeroVuelo,
        aerolinea: flight.aerolinea,
        origen: flight.origen,
        destino: flight.destino,
        fechaSalida: flight.fechaSalida.split('T')[0],
        horaSalida: flight.horaSalida,
        fechaLlegada: flight.fechaLlegada.split('T')[0],
        horaLlegada: flight.horaLlegada,
        duracion: flight.duracion,
        precio: flight.precio,
        equipaje: flight.equipaje || {
          mano: { permitido: true, peso: 10, dimensiones: '55x40x20 cm' },
          documentado: { permitido: true, peso: 23, piezas: 1, precioExtra: 500 }
        },
        capacidadTotal: flight.capacidadTotal,
        estado: flight.estado,
        tipoVuelo: flight.tipoVuelo,
      });
      parseDuracion(flight.duracion);
      setErrors({});
    } else if (mode === 'create' && isOpen) {
      setFormData({
        numeroVuelo: '',
        aerolinea: 'AeroLambda',
        origen: { ciudad: '', codigo: '', aeropuerto: '' },
        destino: { ciudad: '', codigo: '', aeropuerto: '' },
        fechaSalida: '',
        horaSalida: '',
        fechaLlegada: '',
        horaLlegada: '',
        duracion: '',
        precio: 0,
        equipaje: {
          mano: { permitido: true, peso: 10, dimensiones: '55x40x20 cm' },
          documentado: { permitido: true, peso: 23, piezas: 1, precioExtra: 500 }
        },
        capacidadTotal: 180,
        estado: 'programado',
        tipoVuelo: 'directo',
      });
      setDuracionHoras('');
      setDuracionMinutos('');
      setErrors({});
    }
  }, [flight, mode, isOpen]);

  // Actualizar duración en formato string cuando cambian horas/minutos
  useEffect(() => {
    const horas = parseInt(duracionHoras) || 0;
    const minutos = parseInt(duracionMinutos) || 0;
    
    if (horas > 0 || minutos > 0) {
      const duracionStr = `${horas}h ${minutos}m`;
      setFormData(prev => ({ ...prev, duracion: duracionStr }));
    }
  }, [duracionHoras, duracionMinutos]);

  const calcularLlegada = (fechaSalida: string, horaSalida: string, duracion: string) => {
    if (!fechaSalida || !horaSalida || !duracion) return { fechaLlegada: '', horaLlegada: '' };

    try {
      const duracionMatch = duracion.match(/(\d+)h?\s*(\d+)?m?/i);
      if (!duracionMatch) return { fechaLlegada: '', horaLlegada: '' };

      const horas = parseInt(duracionMatch[1] || '0');
      const minutos = parseInt(duracionMatch[2] || '0');

      const [year, month, day] = fechaSalida.split('-').map(Number);
      const [hours, mins] = horaSalida.split(':').map(Number);
      
      const fechaHoraSalida = new Date(year, month - 1, day, hours, mins);

      fechaHoraSalida.setHours(fechaHoraSalida.getHours() + horas);
      fechaHoraSalida.setMinutes(fechaHoraSalida.getMinutes() + minutos);

      const fechaLlegada = fechaHoraSalida.toISOString().split('T')[0];
      const horaLlegada = fechaHoraSalida.toTimeString().slice(0, 5);

      return { fechaLlegada, horaLlegada };
    } catch (error) {
      console.error('Error calculando llegada:', error);
      return { fechaLlegada: '', horaLlegada: '' };
    }
  };

  useEffect(() => {
    if (formData.fechaSalida && formData.horaSalida && formData.duracion) {
      const { fechaLlegada, horaLlegada } = calcularLlegada(
        formData.fechaSalida,
        formData.horaSalida,
        formData.duracion
      );

      if (fechaLlegada && horaLlegada) {
        setFormData(prev => ({
          ...prev,
          fechaLlegada,
          horaLlegada,
        }));
      }
    }
  }, [formData.fechaSalida, formData.horaSalida, formData.duracion]);

  // ✅ FUNCIÓN DE VALIDACIÓN MEJORADA
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Número de vuelo
    if (!formData.numeroVuelo.trim()) {
      newErrors.numeroVuelo = 'El número de vuelo es requerido';
    }

    // Aerolínea
    if (!formData.aerolinea.trim()) {
      newErrors.aerolinea = 'La aerolínea es requerida';
    }

    // Origen
    if (!formData.origen.ciudad.trim()) {
      newErrors.origenCiudad = 'La ciudad de origen es requerida';
    }
    if (!formData.origen.codigo.trim()) {
      newErrors.origenCodigo = 'El código IATA de origen es requerido';
    } else if (formData.origen.codigo.length !== 3) {
      newErrors.origenCodigo = 'El código IATA debe tener exactamente 3 letras';
    } else if (!/^[A-Z]{3}$/.test(formData.origen.codigo)) {
      newErrors.origenCodigo = 'El código IATA debe contener solo letras mayúsculas';
    }
    if (!formData.origen.aeropuerto.trim()) {
      newErrors.origenAeropuerto = 'El aeropuerto de origen es requerido';
    }

    // Destino
    if (!formData.destino.ciudad.trim()) {
      newErrors.destinoCiudad = 'La ciudad de destino es requerida';
    }
    if (!formData.destino.codigo.trim()) {
      newErrors.destinoCodigo = 'El código IATA de destino es requerido';
    } else if (formData.destino.codigo.length !== 3) {
      newErrors.destinoCodigo = 'El código IATA debe tener exactamente 3 letras';
    } else if (!/^[A-Z]{3}$/.test(formData.destino.codigo)) {
      newErrors.destinoCodigo = 'El código IATA debe contener solo letras mayúsculas';
    }
    if (!formData.destino.aeropuerto.trim()) {
      newErrors.destinoAeropuerto = 'El aeropuerto de destino es requerido';
    }

    // Validar que origen y destino sean diferentes
    if (formData.origen.codigo && formData.destino.codigo && 
        formData.origen.codigo === formData.destino.codigo) {
      newErrors.destinoCodigo = 'El destino debe ser diferente al origen';
    }

    // Fechas y horas
    if (!formData.fechaSalida) {
      newErrors.fechaSalida = 'La fecha de salida es requerida';
    }
    if (!formData.horaSalida) {
      newErrors.horaSalida = 'La hora de salida es requerida';
    }

    // Validar duración (horas o minutos deben ser > 0)
    const horas = parseInt(duracionHoras) || 0;
    const minutos = parseInt(duracionMinutos) || 0;
    if (horas === 0 && minutos === 0) {
      newErrors.duracion = 'Debes ingresar al menos 1 hora o 1 minuto';
    }
    if (horas > 24) {
      newErrors.duracion = 'Las horas no pueden ser mayores a 24';
    }
    if (minutos >= 60) {
      newErrors.duracion = 'Los minutos deben ser menores a 60';
    }

    // Precio - Validación segura contra NaN
    const precioNumero = Number(formData.precio);
    if (isNaN(precioNumero) || precioNumero <= 0) {
      newErrors.precio = 'El precio debe ser un número mayor a 0';
    } else if (precioNumero > 100000) {
      newErrors.precio = 'El precio parece muy alto (máx. $100,000)';
    }

    // Capacidad - Validación segura contra NaN
    const capacidadNumero = Number(formData.capacidadTotal);
    if (isNaN(capacidadNumero) || capacidadNumero <= 0) {
      newErrors.capacidadTotal = 'La capacidad debe ser un número mayor a 0';
    } else if (capacidadNumero > 500) {
      newErrors.capacidadTotal = 'La capacidad parece muy alta (máx. 500)';
    }

    // Equipaje - Validación segura
    const pesoMano = Number(formData.equipaje.mano.peso);
    if (isNaN(pesoMano) || pesoMano <= 0 || pesoMano > 25) {
      newErrors.equipajeMano = 'Peso de mano debe estar entre 1-25 kg';
    }
    
    const pesoDoc = Number(formData.equipaje.documentado.peso);
    if (isNaN(pesoDoc) || pesoDoc <= 0 || pesoDoc > 32) {
      newErrors.equipajeDocumentado = 'Peso documentado debe estar entre 1-32 kg';
    }
    
    const piezas = Number(formData.equipaje.documentado.piezas);
    if (isNaN(piezas) || piezas < 0 || piezas > 5) {
      newErrors.equipajePiezas = 'Piezas debe estar entre 0-5';
    }
    
    const precioExtra = Number(formData.equipaje.documentado.precioExtra);
    if (isNaN(precioExtra) || precioExtra < 0 || precioExtra > 5000) {
      newErrors.equipajePrecio = 'Precio extra debe estar entre $0-$5,000';
    }

    setErrors(newErrors);

    // Mostrar toast con el primer error
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError, {
        duration: 4000,
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#ef4444',
          color: '#fff',
        },
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // ✅ Validar antes de enviar
    if (!validateForm()) {
      return; // NO cerrar el modal
    }

    setSubmitting(true);
    try {
      await onSave(formData);
      toast.success(
        mode === 'create' ? '✈️ Vuelo creado exitosamente' : '✅ Vuelo actualizado',
        {
          duration: 3000,
          style: {
            borderRadius: '10px',
            background: '#10b981',
            color: '#fff',
          },
        }
      );
      onClose(); // Solo cerrar si todo salió bien
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error saving flight:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al guardar el vuelo';
      toast.error(errorMessage, {
        duration: 4000,
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#ef4444',
          color: '#fff',
        },
      });
      // NO cerrar el modal en caso de error
    } finally {
      setSubmitting(false);
    }
  };

  // Función helper para convertir string vacío a 0
  const safeParseFloat = (value: string): number => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const safeParseInt = (value: string): number => {
    const num = parseInt(value);
    return isNaN(num) ? 0 : num;
  };

  // Limpiar error cuando el usuario modifica un campo
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Crear Nuevo Vuelo' : 'Editar Vuelo'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numeroVuelo">Número de Vuelo *</Label>
              <Input
                id="numeroVuelo"
                value={formData.numeroVuelo}
                onChange={(e) => {
                  setFormData({ ...formData, numeroVuelo: e.target.value.toUpperCase() });
                  clearError('numeroVuelo');
                }}
                placeholder="AL-2102"
                className={errors.numeroVuelo ? 'border-red-500 focus:ring-red-500' : ''}
              />
              {errors.numeroVuelo && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.numeroVuelo}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="aerolinea">Aerolínea *</Label>
              <Input
                id="aerolinea"
                value={formData.aerolinea}
                onChange={(e) => {
                  setFormData({ ...formData, aerolinea: e.target.value });
                  clearError('aerolinea');
                }}
                placeholder="AeroLambda"
                className={errors.aerolinea ? 'border-red-500 focus:ring-red-500' : ''}
              />
              {errors.aerolinea && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.aerolinea}
                </p>
              )}
            </div>
          </div>

          {/* Origen */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">📍 Origen</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="origenCiudad">Ciudad de Origen *</Label>
                <Input
                  id="origenCiudad"
                  value={formData.origen.ciudad}
                  onChange={(e) => {
                    setFormData({ ...formData, origen: { ...formData.origen, ciudad: e.target.value }});
                    clearError('origenCiudad');
                  }}
                  placeholder="Ciudad de México"
                  className={errors.origenCiudad ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {errors.origenCiudad && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.origenCiudad}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="origenCodigo">Código IATA * (3 letras)</Label>
                <Input
                  id="origenCodigo"
                  value={formData.origen.codigo}
                  onChange={(e) => {
                    setFormData({ ...formData, origen: { ...formData.origen, codigo: e.target.value.toUpperCase().slice(0, 3) }});
                    clearError('origenCodigo');
                  }}
                  placeholder="MEX"
                  maxLength={3}
                  className={errors.origenCodigo ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {errors.origenCodigo && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.origenCodigo}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Ejemplo: MEX, CUN, GDL</p>
              </div>

              <div>
                <Label htmlFor="origenAeropuerto">Aeropuerto de Origen *</Label>
                <Input
                  id="origenAeropuerto"
                  value={formData.origen.aeropuerto}
                  onChange={(e) => {
                    setFormData({ ...formData, origen: { ...formData.origen, aeropuerto: e.target.value }});
                    clearError('origenAeropuerto');
                  }}
                  placeholder="Aeropuerto Internacional Benito Juárez"
                  className={errors.origenAeropuerto ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {errors.origenAeropuerto && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.origenAeropuerto}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Destino */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">🎯 Destino</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="destinoCiudad">Ciudad de Destino *</Label>
                <Input
                  id="destinoCiudad"
                  value={formData.destino.ciudad}
                  onChange={(e) => {
                    setFormData({ ...formData, destino: { ...formData.destino, ciudad: e.target.value }});
                    clearError('destinoCiudad');
                  }}
                  placeholder="Cancún"
                  className={errors.destinoCiudad ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {errors.destinoCiudad && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.destinoCiudad}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="destinoCodigo">Código IATA * (3 letras)</Label>
                <Input
                  id="destinoCodigo"
                  value={formData.destino.codigo}
                  onChange={(e) => {
                    setFormData({ ...formData, destino: { ...formData.destino, codigo: e.target.value.toUpperCase().slice(0, 3) }});
                    clearError('destinoCodigo');
                  }}
                  placeholder="CUN"
                  maxLength={3}
                  className={errors.destinoCodigo ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {errors.destinoCodigo && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.destinoCodigo}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Ejemplo: CUN, MTY, TIJ</p>
              </div>

              <div>
                <Label htmlFor="destinoAeropuerto">Aeropuerto de Destino *</Label>
                <Input
                  id="destinoAeropuerto"
                  value={formData.destino.aeropuerto}
                  onChange={(e) => {
                    setFormData({ ...formData, destino: { ...formData.destino, aeropuerto: e.target.value }});
                    clearError('destinoAeropuerto');
                  }}
                  placeholder="Aeropuerto Internacional de Cancún"
                  className={errors.destinoAeropuerto ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {errors.destinoAeropuerto && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.destinoAeropuerto}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">⏰ Horarios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fechaSalida">Fecha de Salida *</Label>
                <Input
                  id="fechaSalida"
                  type="date"
                  value={formData.fechaSalida}
                  onChange={(e) => {
                    setFormData({ ...formData, fechaSalida: e.target.value });
                    clearError('fechaSalida');
                  }}
                  className={errors.fechaSalida ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {errors.fechaSalida && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.fechaSalida}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="horaSalida">Hora de Salida *</Label>
                <Input
                  id="horaSalida"
                  type="time"
                  value={formData.horaSalida}
                  onChange={(e) => {
                    setFormData({ ...formData, horaSalida: e.target.value });
                    clearError('horaSalida');
                  }}
                  className={errors.horaSalida ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {errors.horaSalida && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.horaSalida}
                  </p>
                )}
              </div>
            </div>

            {/* ✨ DURACIÓN SIMPLIFICADA - Campos separados */}
            <div className="mt-4">
              <Label>Duración del vuelo *</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duracionHoras" className="text-sm">Horas</Label>
                  <Input
                    id="duracionHoras"
                    type="number"
                    min="0"
                    max="24"
                    value={duracionHoras}
                    onChange={(e) => {
                      setDuracionHoras(e.target.value);
                      clearError('duracion');
                    }}
                    placeholder="2"
                    className={errors.duracion ? 'border-red-500 focus:ring-red-500' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="duracionMinutos" className="text-sm">Minutos</Label>
                  <Input
                    id="duracionMinutos"
                    type="number"
                    min="0"
                    max="59"
                    value={duracionMinutos}
                    onChange={(e) => {
                      setDuracionMinutos(e.target.value);
                      clearError('duracion');
                    }}
                    placeholder="30"
                    className={errors.duracion ? 'border-red-500 focus:ring-red-500' : ''}
                  />
                </div>
              </div>
              {errors.duracion && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.duracion}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Ejemplo: 2 horas y 30 minutos. La fecha y hora de llegada se calculan automáticamente.
              </p>
            </div>

            {/* Fechas y Horas de Llegada */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg mt-4">
              <div>
                <Label htmlFor="fechaLlegada">Fecha de Llegada (calculada)</Label>
                <Input
                  id="fechaLlegada"
                  type="date"
                  value={formData.fechaLlegada}
                  readOnly
                  className="bg-white"
                />
              </div>

              <div>
                <Label htmlFor="horaLlegada">Hora de Llegada (calculada)</Label>
                <Input
                  id="horaLlegada"
                  type="time"
                  value={formData.horaLlegada}
                  readOnly
                  className="bg-white"
                />
              </div>
              <p className="text-xs text-blue-600 col-span-2">
                ℹ️ Estos campos se calculan automáticamente basándose en la fecha/hora de salida y la duración del vuelo.
              </p>
            </div>
          </div>

          {/* Precio y Capacidad */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">💰 Precio y Capacidad</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="precio">Precio (MXN) *</Label>
                <Input
                  id="precio"
                  type="number"
                  value={formData.precio || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, precio: safeParseFloat(e.target.value) });
                    clearError('precio');
                  }}
                  min="0"
                  step="0.01"
                  placeholder="1200"
                  className={errors.precio ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {errors.precio && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.precio}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="capacidadTotal">Capacidad Total *</Label>
                <Input
                  id="capacidadTotal"
                  type="number"
                  value={formData.capacidadTotal || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, capacidadTotal: safeParseInt(e.target.value) });
                    clearError('capacidadTotal');
                  }}
                  min="1"
                  max="500"
                  placeholder="180"
                  className={errors.capacidadTotal ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {errors.capacidadTotal && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.capacidadTotal}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* EQUIPAJE */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Luggage className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Políticas de Equipaje</h3>
            </div>

            {/* Equipaje de Mano */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-gray-900 mb-3">Equipaje de Mano</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="manoPermitido">Permitido</Label>
                  <select
                    id="manoPermitido"
                    value={formData.equipaje.mano.permitido ? 'si' : 'no'}
                    onChange={(e) => setFormData({
                      ...formData,
                      equipaje: {
                        ...formData.equipaje,
                        mano: { ...formData.equipaje.mano, permitido: e.target.value === 'si' }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="manoPeso">Peso Máximo (kg)</Label>
                  <Input
                    id="manoPeso"
                    type="number"
                    value={formData.equipaje.mano.peso || ''}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        equipaje: {
                          ...formData.equipaje,
                          mano: { ...formData.equipaje.mano, peso: safeParseFloat(e.target.value) }
                        }
                      });
                      clearError('equipajeMano');
                    }}
                    min="0"
                    max="25"
                    step="0.5"
                    placeholder="10"
                    className={errors.equipajeMano ? 'border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.equipajeMano && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.equipajeMano}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="manoDimensiones">Dimensiones</Label>
                  <Input
                    id="manoDimensiones"
                    value={formData.equipaje.mano.dimensiones}
                    onChange={(e) => setFormData({
                      ...formData,
                      equipaje: {
                        ...formData.equipaje,
                        mano: { ...formData.equipaje.mano, dimensiones: e.target.value }
                      }
                    })}
                    placeholder="55x40x20 cm"
                  />
                </div>
              </div>
            </div>

            {/* Equipaje Documentado */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Equipaje Documentado</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="docPermitido">Permitido</Label>
                  <select
                    id="docPermitido"
                    value={formData.equipaje.documentado.permitido ? 'si' : 'no'}
                    onChange={(e) => setFormData({
                      ...formData,
                      equipaje: {
                        ...formData.equipaje,
                        documentado: { ...formData.equipaje.documentado, permitido: e.target.value === 'si' }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="docPeso">Peso Máximo (kg)</Label>
                  <Input
                    id="docPeso"
                    type="number"
                    value={formData.equipaje.documentado.peso || ''}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        equipaje: {
                          ...formData.equipaje,
                          documentado: { ...formData.equipaje.documentado, peso: safeParseFloat(e.target.value) }
                        }
                      });
                      clearError('equipajeDocumentado');
                    }}
                    min="0"
                    max="32"
                    step="0.5"
                    placeholder="23"
                    className={errors.equipajeDocumentado ? 'border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.equipajeDocumentado && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.equipajeDocumentado}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="docPiezas">Piezas Incluidas</Label>
                  <Input
                    id="docPiezas"
                    type="number"
                    value={formData.equipaje.documentado.piezas || ''}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        equipaje: {
                          ...formData.equipaje,
                          documentado: { ...formData.equipaje.documentado, piezas: safeParseInt(e.target.value) }
                        }
                      });
                      clearError('equipajePiezas');
                    }}
                    min="0"
                    max="5"
                    placeholder="1"
                    className={errors.equipajePiezas ? 'border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.equipajePiezas && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.equipajePiezas}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="docPrecio">Precio Extra por Pieza (MXN)</Label>
                  <Input
                    id="docPrecio"
                    type="number"
                    value={formData.equipaje.documentado.precioExtra || ''}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        equipaje: {
                          ...formData.equipaje,
                          documentado: { ...formData.equipaje.documentado, precioExtra: safeParseFloat(e.target.value) }
                        }
                      });
                      clearError('equipajePrecio');
                    }}
                    min="0"
                    step="50"
                    placeholder="500"
                    className={errors.equipajePrecio ? 'border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.equipajePrecio && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.equipajePrecio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Estado y Tipo */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">📊 Estado y Tipo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estado">Estado *</Label>
                <select
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="programado">Programado</option>
                  <option value="en_vuelo">En Vuelo</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="retrasado">Retrasado</option>
                </select>
              </div>

              <div>
                <Label htmlFor="tipoVuelo">Tipo de Vuelo *</Label>
                <select
                  id="tipoVuelo"
                  value={formData.tipoVuelo}
                  onChange={(e) => setFormData({ ...formData, tipoVuelo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="directo">Directo</option>
                  <option value="1_escala">1 Escala</option>
                  <option value="2_escalas">2 Escalas</option>
                </select>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : mode === 'create' ? 'Crear Vuelo' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}