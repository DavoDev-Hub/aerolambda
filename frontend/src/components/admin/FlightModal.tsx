import { useEffect, useState } from 'react';
import { Luggage, X } from 'lucide-react';
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

export default function FlightModal({ isOpen, onClose, onSave, flight, mode }: FlightModalProps) {
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
      mano: {
        permitido: true,
        peso: 10,
        dimensiones: '55x40x20 cm'
      },
      documentado: {
        permitido: true,
        peso: 23,
        piezas: 1,
        precioExtra: 500
      }
    },
    capacidadTotal: 180,
    estado: 'programado',
    tipoVuelo: 'directo',
  });

  const [submitting, setSubmitting] = useState(false);

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
    } else {
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
    }
  }, [flight, mode, isOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.origen.codigo || !formData.destino.codigo) {
      alert('Por favor completa todos los campos de origen y destino');
      return;
    }

    if (formData.origen.codigo.length !== 3 || formData.destino.codigo.length !== 3) {
      alert('Los códigos IATA deben tener exactamente 3 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving flight:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Crear Nuevo Vuelo' : 'Editar Vuelo'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numeroVuelo">Número de Vuelo *</Label>
              <Input
                id="numeroVuelo"
                value={formData.numeroVuelo}
                onChange={(e) => setFormData({ ...formData, numeroVuelo: e.target.value.toUpperCase() })}
                placeholder="AL-2102"
                required
              />
            </div>

            <div>
              <Label htmlFor="aerolinea">Aerolínea *</Label>
              <Input
                id="aerolinea"
                value={formData.aerolinea}
                onChange={(e) => setFormData({ ...formData, aerolinea: e.target.value })}
                placeholder="AeroLambda"
                required
              />
            </div>
          </div>

          {/* ORIGEN - Inputs Manuales */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Origen</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="origenCiudad">Ciudad de Origen *</Label>
                <Input
                  id="origenCiudad"
                  value={formData.origen.ciudad}
                  onChange={(e) => setFormData({
                    ...formData,
                    origen: { ...formData.origen, ciudad: e.target.value }
                  })}
                  placeholder="Ciudad de México"
                  required
                />
              </div>

              <div>
                <Label htmlFor="origenCodigo">Código IATA * (3 letras)</Label>
                <Input
                  id="origenCodigo"
                  value={formData.origen.codigo}
                  onChange={(e) => setFormData({
                    ...formData,
                    origen: { ...formData.origen, codigo: e.target.value.toUpperCase() }
                  })}
                  placeholder="MEX"
                  maxLength={3}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Ejemplo: MEX, CUN, GDL</p>
              </div>

              <div className="md:col-span-1">
                <Label htmlFor="origenAeropuerto">Aeropuerto de Origen *</Label>
                <Input
                  id="origenAeropuerto"
                  value={formData.origen.aeropuerto}
                  onChange={(e) => setFormData({
                    ...formData,
                    origen: { ...formData.origen, aeropuerto: e.target.value }
                  })}
                  placeholder="Aeropuerto Internacional Benito Juárez"
                  required
                />
              </div>
            </div>
          </div>

          {/* DESTINO - Inputs Manuales */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Destino</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="destinoCiudad">Ciudad de Destino *</Label>
                <Input
                  id="destinoCiudad"
                  value={formData.destino.ciudad}
                  onChange={(e) => setFormData({
                    ...formData,
                    destino: { ...formData.destino, ciudad: e.target.value }
                  })}
                  placeholder="Cancún"
                  required
                />
              </div>

              <div>
                <Label htmlFor="destinoCodigo">Código IATA * (3 letras)</Label>
                <Input
                  id="destinoCodigo"
                  value={formData.destino.codigo}
                  onChange={(e) => setFormData({
                    ...formData,
                    destino: { ...formData.destino, codigo: e.target.value.toUpperCase() }
                  })}
                  placeholder="CUN"
                  maxLength={3}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Ejemplo: CUN, MTY, TIJ</p>
              </div>

              <div className="md:col-span-1">
                <Label htmlFor="destinoAeropuerto">Aeropuerto de Destino *</Label>
                <Input
                  id="destinoAeropuerto"
                  value={formData.destino.aeropuerto}
                  onChange={(e) => setFormData({
                    ...formData,
                    destino: { ...formData.destino, aeropuerto: e.target.value }
                  })}
                  placeholder="Aeropuerto Internacional de Cancún"
                  required
                />
              </div>
            </div>
          </div>

          {/* Fechas y Horas de Salida */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fechaSalida">Fecha de Salida *</Label>
              <Input
                id="fechaSalida"
                type="date"
                value={formData.fechaSalida}
                onChange={(e) => setFormData({ ...formData, fechaSalida: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <Label htmlFor="horaSalida">Hora de Salida *</Label>
              <Input
                id="horaSalida"
                type="time"
                value={formData.horaSalida}
                onChange={(e) => setFormData({ ...formData, horaSalida: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Duración */}
          <div>
            <Label htmlFor="duracion">Duración del vuelo *</Label>
            <Input
              id="duracion"
              value={formData.duracion}
              onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
              placeholder="Ej: 5h 30m, 2h, 45m"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato: "5h 30m" o "2h" o "45m". La fecha y hora de llegada se calculan automáticamente.
            </p>
          </div>

          {/* Fechas y Horas de Llegada */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
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

          {/* Precio y Capacidad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="precio">Precio (MXN) *</Label>
              <Input
                id="precio"
                type="number"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <Label htmlFor="capacidadTotal">Capacidad Total *</Label>
              <Input
                id="capacidadTotal"
                type="number"
                value={formData.capacidadTotal}
                onChange={(e) => setFormData({ ...formData, capacidadTotal: parseInt(e.target.value) })}
                min="1"
                max="200"
                required
              />
            </div>
          </div>

          {/* EQUIPAJE */}
          <div className="border-t border-gray-200 pt-6">
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
                    value={formData.equipaje.mano.peso}
                    onChange={(e) => setFormData({
                      ...formData,
                      equipaje: {
                        ...formData.equipaje,
                        mano: { ...formData.equipaje.mano, peso: parseFloat(e.target.value) }
                      }
                    })}
                    min="0"
                    max="25"
                    step="0.5"
                  />
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
                    value={formData.equipaje.documentado.peso}
                    onChange={(e) => setFormData({
                      ...formData,
                      equipaje: {
                        ...formData.equipaje,
                        documentado: { ...formData.equipaje.documentado, peso: parseFloat(e.target.value) }
                      }
                    })}
                    min="0"
                    max="32"
                    step="0.5"
                  />
                </div>

                <div>
                  <Label htmlFor="docPiezas">Piezas Incluidas</Label>
                  <Input
                    id="docPiezas"
                    type="number"
                    value={formData.equipaje.documentado.piezas}
                    onChange={(e) => setFormData({
                      ...formData,
                      equipaje: {
                        ...formData.equipaje,
                        documentado: { ...formData.equipaje.documentado, piezas: parseInt(e.target.value) }
                      }
                    })}
                    min="0"
                    max="5"
                  />
                </div>

                <div>
                  <Label htmlFor="docPrecio">Precio Extra por Pieza (MXN)</Label>
                  <Input
                    id="docPrecio"
                    type="number"
                    value={formData.equipaje.documentado.precioExtra}
                    onChange={(e) => setFormData({
                      ...formData,
                      equipaje: {
                        ...formData.equipaje,
                        documentado: { ...formData.equipaje.documentado, precioExtra: parseFloat(e.target.value) }
                      }
                    })}
                    min="0"
                    step="50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Estado y Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estado">Estado *</Label>
              <select
                id="estado"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                required
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
                required
              >
                <option value="directo">Directo</option>
                <option value="1_escala">1 Escala</option>
                <option value="2_escalas">2 Escalas</option>
              </select>
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
