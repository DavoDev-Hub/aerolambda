import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, LogIn } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import loginImage from '@/utils/login-image.png';
import { Variants } from 'framer-motion';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [direction, setDirection] = useState(0);

  const toggleTab = (tab: 'login' | 'register') => {
    setDirection(tab === 'register' ? 1 : -1);
    setActiveTab(tab);
  };

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] // cubic-bezier equivalente a "easeOut"
    }
  }
};

  // Variantes para deslizar el contenido de los formularios
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
      position: "absolute" as const // Importante para evitar saltos de layout
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      position: "relative" as const
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 20 : -20,
      opacity: 0,
      position: "absolute" as const
    })
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gray-900">
      
      {/* 1. FONDO INMERSIVO */}
      <div className="absolute inset-0 z-0">
        <img 
          src={loginImage} 
          alt="Fondo AeroLambda" 
          className="w-full h-full object-cover scale-105"
        />
        {/* Capas de superposición para legibilidad */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-black/40" />
      </div>

      {/* 2. TARJETA CENTRAL (Glassmorphism) */}
      <motion.div 
        className="relative z-10 w-full max-w-md mx-4"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header de la tarjeta */}
        <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }} 
              animate={{ scale: 1, rotate: 0 }} 
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="inline-flex w-16 h-16 items-center justify-center bg-primary rounded-2xl shadow-lg shadow-blue-500/30 mb-4"
            >
              {/* Usamos texto con fuente monoespaciada o sans para que se vea técnico */}
              <span className="text-4xl text-white font-bold leading-none pb-1">λ</span>
            </motion.div>
          <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">
            AeroLambda
          </h1>
          <p className="text-blue-100 mt-2 text-base font-medium drop-shadow-md">
            Tu viaje comienza aquí.
          </p>
        </div>

        {/* Cuerpo de la tarjeta */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden relative">
          
          {/* Pestañas de Navegación Personalizadas */}
          <div className="flex p-2 bg-gray-100/80 rounded-t-3xl border-b border-gray-200/50">
            <TabButton 
              isActive={activeTab === 'login'} 
              onClick={() => toggleTab('login')}
              label="Iniciar Sesión"
              icon={<LogIn className="w-4 h-4" />}
            />
            <TabButton 
              isActive={activeTab === 'register'} 
              onClick={() => toggleTab('register')}
              label="Crear Cuenta"
              icon={<UserPlus className="w-4 h-4" />}
            />
          </div>

          {/* Área de Formularios Animados */}
          <div className="p-6 md:p-8 relative min-h-[420px]"> 
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              {activeTab === 'login' ? (
                <motion.div
                  key="login"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                  className="w-full"
                >
                   <LoginForm />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                  className="w-full"
                >
                   <RegisterForm />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Footer Copyright */}
        <p className="text-center text-white/60 text-xs mt-8 font-medium">
          © {new Date().getFullYear()} AeroLambda. Conectando destinos.
        </p>
      </motion.div>
    </div>
  );
}

// Subcomponente para los botones de las pestañas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabButton({ label, isActive, onClick, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 relative ${
        isActive ? "text-primary" : "text-gray-500 hover:text-gray-700 hover:bg-white/40"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="activeTabBg"
          className="absolute inset-0 bg-white shadow-sm border border-gray-100 rounded-2xl"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {icon} {label}
      </span>
    </button>
  );
}