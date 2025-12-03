import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { UserPlus, LogIn } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import loginImage from '@/utils/login-image.png';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [direction, setDirection] = useState(0);

  const toggleTab = (tab: 'login' | 'register') => {
    setDirection(tab === 'register' ? 1 : -1);
    setActiveTab(tab);
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 }, 
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
      position: "absolute" as const
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
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950">
      
      {/* 1. FONDO INMERSIVO DARK */}
      <div className="absolute inset-0 z-0">
        <img 
          src={loginImage} 
          alt="Fondo AeroLambda" 
          className="w-full h-full object-cover"
        />
        {/* Overlay degradado para unificar con el tema Dark Glass */}
        <div className="absolute inset-0 bg-slate-950/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-blue-900/30" />
      </div>

      {/* 2. TARJETA CENTRAL */}
      <motion.div 
        className="relative z-10 w-full max-w-md mx-4"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }} 
            animate={{ scale: 1, rotate: 0 }} 
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="inline-flex w-16 h-16 items-center justify-center bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/40 mb-4"
          >
            <span className="text-4xl text-white font-bold leading-none pb-1">λ</span>
          </motion.div>
          <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-xl">
            AeroLambda
          </h1>
          <p className="text-blue-200 mt-2 text-base font-medium">
            Tu viaje comienza aquí.
          </p>
        </div>

        {/* Cuerpo de la tarjeta (GLASS OSCURO) */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden relative">
          
          {/* Pestañas */}
          <div className="flex p-1.5 bg-black/20 border-b border-white/5">
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

          {/* Área de Formularios */}
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
        
        <p className="text-center text-slate-400 text-xs mt-8 font-medium">
          © {new Date().getFullYear()} AeroLambda. Conectando destinos.
        </p>
      </motion.div>
    </div>
  );
}

// Botón de Pestaña Estilizado
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabButton({ label, isActive, onClick, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all duration-300 relative ${
        isActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="activeTabBg"
          className="absolute inset-0 bg-white/10 border border-white/10 shadow-sm rounded-xl"
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