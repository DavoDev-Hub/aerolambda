import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Plane } from 'lucide-react';
import loginImage from '@/utils/login-image.png'

export default function AuthPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Forms */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Plane className="h-7 w-7 text-primary-foreground" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">AeroLambda</h1>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login" className="text-base">
                  Iniciar sesión
                </TabsTrigger>
                <TabsTrigger value="register" className="text-base">
                  Crear cuenta
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Right side - Image/Gradient */}
      {/* Right side - Image/Gradient */}
  <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
    {/* Imagen de fondo */}
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url(${loginImage})` }}
    />

    {/* Overlays para oscurecer y dar gradient */}
    <div className="absolute inset-0 bg-black/10" />
    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />

    {/* Texto */}
    <div className="absolute bottom-0 left-0 right-0 p-12 text-primary-foreground">
      <h2 className="text-4xl font-bold mb-4">Vuela hacia tus sueños</h2>
      <p className="text-xl text-primary-foreground/90">
        Conectamos México con el mundo. Experiencias inolvidables comienzan aquí.
      </p>
    </div>
  </div>
    </div>
  );
}