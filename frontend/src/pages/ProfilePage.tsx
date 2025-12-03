import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/flight/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import { User, Mail, Phone, Lock, Save, Edit2 } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        telefono: user.telefono || '',
      });
    }
  }, [navigate]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const currentUser = JSON.parse(userStr);
          const updatedUser = {
            ...currentUser,
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: formData.telefono,
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        alert('Perfil actualizado exitosamente');
        setIsEditing(false);
      } else {
        alert(data.message || 'Error al actualizar perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Todos los campos de contraseña son requeridos');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/cambiar-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          passwordActual: passwordData.currentPassword,
          passwordNuevo: passwordData.newPassword,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Contraseña actualizada exitosamente');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        alert(data.message || 'Error al cambiar contraseña');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden">
      
      {/* Decoración de fondo */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-600/10 blur-[100px] pointer-events-none rounded-full transform -translate-y-1/2"></div>
      
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 relative z-10">
        
        <div className="flex items-center gap-4 mb-8">
          <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/30 text-2xl font-bold text-white">
            {formData.nombre.charAt(0)}{formData.apellido.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
            <p className="text-slate-400">Gestiona tu información personal y seguridad</p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Información Personal */}
          <Card className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                Información Personal
              </h2>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                className="border-white/10 text-white hover:bg-white/10 hover:border-white/30"
              >
                {isEditing ? 'Cancelar' : <><Edit2 className="w-4 h-4 mr-2" /> Editar</>}
              </Button>
            </div>

            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nombre" className="text-slate-300">Nombre</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10 bg-slate-900/50 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="apellido" className="text-slate-300">Apellido</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <Input
                      id="apellido"
                      value={formData.apellido}
                      onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10 bg-slate-900/50 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-slate-300">Correo electrónico</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={true} // Email usually not editable directly
                    className="pl-10 bg-slate-900/30 border-white/5 text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="telefono" className="text-slate-300">Teléfono</Label>
                <div className="relative mt-2">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10 bg-slate-900/50 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20 disabled:opacity-50"
                  />
                </div>
              </div>

              {isEditing && (
                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="w-full md:w-auto mt-4 bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-900/20"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              )}
            </div>
          </Card>

          {/* Cambiar Contraseña */}
          <Card className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-8 pb-4 border-b border-white/10 flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" />
              Seguridad
            </h2>
            
            <div className="grid gap-6 max-w-lg">
              <div>
                <Label htmlFor="currentPassword" className="text-slate-300">Contraseña actual</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="pl-10 bg-slate-900/50 border-white/10 text-white focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword" className="text-slate-300">Nueva contraseña</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="pl-10 bg-slate-900/50 border-white/10 text-white focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-slate-300">Confirmar nueva contraseña</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="pl-10 bg-slate-900/50 border-white/10 text-white focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <Button 
                onClick={handleChangePassword}
                disabled={loading}
                className="w-full mt-4 bg-white/10 text-white hover:bg-white/20 border border-white/10"
              >
                {loading ? 'Actualizando...' : 'Actualizar contraseña'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}