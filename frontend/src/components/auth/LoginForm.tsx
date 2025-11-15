import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
import { Mail, Lock, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      if (data.success) {
        // Guardar token y datos del usuario
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.usuario));

        // ✅ REDIRECCIÓN SEGÚN ROL
        const userRole = data.data.usuario.rol;

        if (onSuccess) {
          onSuccess();
        } else {
          // Redirigir según el rol
          if (userRole === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }
      } else {
        throw new Error(data.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      const error = err as Error;
      console.error('Login error:', error);
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {apiError && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{apiError}</p>
        </div>
      )}

      {/* Indicador de cuenta admin */}
      {formData.email && (formData.email.includes('admin') || formData.email.includes('administrador')) && (
        <div className="p-3 rounded-md bg-blue-50 border border-blue-200 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          <p className="text-sm text-blue-700 font-medium">
            Iniciando sesión como administrador
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground font-medium">
          Correo electrónico
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            className={`pl-10 h-12 ${errors.email ? 'border-destructive' : ''}`}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {errors.email && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
          )}
        </div>
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground font-medium">
          Contraseña
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className={`pl-10 h-12 ${errors.password ? 'border-destructive' : ''}`}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          {errors.password && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
          )}
        </div>
        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={formData.remember}
            onCheckedChange={(checked) => setFormData({ ...formData, remember: checked as boolean })}
          />
          <label
            htmlFor="remember"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground cursor-pointer"
          >
            Recordarme
          </label>
        </div>
      </div>

      <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isSubmitting}>
        {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>
    </form>
  );
}