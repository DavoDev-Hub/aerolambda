import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
import { Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from "@/config/api";

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Requerido';
    if (!formData.lastName.trim()) newErrors.lastName = 'Requerido';
    if (!formData.email) newErrors.email = 'Requerido';
    if (!formData.password) newErrors.password = 'Requerido';
    else if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'No coinciden';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'Debes aceptar los términos';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.firstName, apellido: formData.lastName,
          email: formData.email, telefono: formData.phone, password: formData.password,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.usuario));
        if (onSuccess) onSuccess(); else navigate('/');
      }
    } catch (err) {
      const error = err as Error;
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {apiError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-sm text-red-200">{apiError}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-slate-300">Nombre</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input id="firstName" placeholder="Juan" className="pl-9 h-10 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
          </div>
          {errors.firstName && <p className="text-xs text-red-400">{errors.firstName}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-slate-300">Apellido</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input id="lastName" placeholder="Pérez" className="pl-9 h-10 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email" className="text-slate-300">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input id="register-email" type="email" placeholder="tu@email.com" className="pl-9 h-10 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </div>
        {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-slate-300">Teléfono</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input id="phone" type="tel" placeholder="55 1234 5678" className="pl-9 h-10 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="register-password" className="text-slate-300">Contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input id="register-password" type="password" placeholder="••••••" className="pl-9 h-10 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>
          {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-slate-300">Confirmar</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input id="confirmPassword" type="password" placeholder="••••••" className="pl-9 h-10 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-start space-x-2">
          <Checkbox id="acceptTerms" checked={formData.acceptTerms} onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked as boolean })} className="mt-1 border-white/30 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
          <label htmlFor="acceptTerms" className="text-xs text-slate-400 cursor-pointer">Acepto los <span className="text-blue-400 hover:underline">términos y condiciones</span></label>
        </div>
        {errors.acceptTerms && <p className="text-xs text-red-400">{errors.acceptTerms}</p>}
      </div>

      <Button type="submit" className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 border-0" disabled={isSubmitting}>
        {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>
    </form>
  );
}