import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/flight/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import { User, Mail, Phone, Lock, Save } from 'lucide-react';

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
    // Verificar si está logueado
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Cargar datos del usuario
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
      // Actualizar localStorage
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
  // Validaciones
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

        <div className="grid gap-6">
          {/* Información Personal */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="apellido">Apellido</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="apellido"
                      value={formData.apellido}
                      onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <div className="relative mt-2">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              {isEditing && (
                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="w-full mt-4"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              )}
            </div>
          </Card>

          {/* Cambiar Contraseña */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Cambiar Contraseña</h2>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="currentPassword">Contraseña actual</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
                <Button 
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="w-full mt-4"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}