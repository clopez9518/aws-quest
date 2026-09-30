import { useState } from 'react';
import { X, Sparkles, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap';
import { ApiHttpError } from '../../../shared/api/ApiHttpError';
import { PasswordRequirementsList } from './PasswordRequirementsList';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register, login, isLoading, user } = useAuth();
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    try {
      if (mode === 'register') {
        await register({ name, email, password });
      } else {
        await login({ email, password });
      }
      onClose();
    } catch (err) {
      if (ApiHttpError.isApiHttpError(err)) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Ocurrió un error inesperado al procesar la solicitud.');
      }
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      data-testid="auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-xl shadow-elevation-modal p-6 relative overflow-hidden outline-none"
      >
        {/* Glow de acento Stitch */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF9900]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Botón de Cierre */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#FF9900]"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header del Modal */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#FF9900]/10 text-[#FF9900] mb-3 border border-[#FF9900]/30 shadow-glow-amber/20">
            <Sparkles className="w-6 h-6 fill-current" />
          </div>
          <h2 id="auth-modal-title" className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {mode === 'register' ? 'Conserva tu progreso' : 'Bienvenido de nuevo'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
            {mode === 'register'
              ? `Crea una cuenta permanente para sincronizar tus ${user?.totalXP ?? 0} XP y récords históricos.`
              : 'Inicia sesión para continuar con tu ruta de aprendizaje de AWS.'}
          </p>
        </div>

        {/* Tabs de Selección */}
        <div className="flex rounded bg-slate-100 dark:bg-[#0B0F19] p-1 border border-slate-200 dark:border-[#374151] mb-5">
          <button
            type="button"
            data-testid="auth-tab-register"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              mode === 'register' ? 'bg-[#FF9900] text-[#0B0F19] font-bold shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Crear Cuenta</span>
          </button>
          <button
            type="button"
            data-testid="auth-tab-login"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              mode === 'login' ? 'bg-[#FF9900] text-[#0B0F19] font-bold shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </button>
        </div>

        {/* Mensaje de Error */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80 flex items-start space-x-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500 dark:text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label htmlFor="auth-modal-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nombre Completo</label>
              <input
                id="auth-modal-name"
                data-testid="auth-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Carlos López"
                className="w-full px-3.5 py-2 rounded bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-[#374151] text-slate-900 dark:text-slate-100 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-all"
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-modal-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Correo Electrónico</label>
            <input
              id="auth-modal-email"
              data-testid="auth-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              className="w-full px-3.5 py-2 rounded bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-[#374151] text-slate-900 dark:text-slate-100 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-all"
            />
          </div>

          <div>
            <label htmlFor="auth-modal-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Contraseña</label>
            <input
              id="auth-modal-password"
              data-testid="auth-password-input"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full px-3.5 py-2 rounded bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-[#374151] text-slate-900 dark:text-slate-100 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-all"
            />
            {mode === 'register' && <PasswordRequirementsList password={password} />}
          </div>

          <button
            type="submit"
            data-testid={mode === 'register' ? 'auth-submit-register' : 'auth-submit-login'}
            disabled={isLoading}
            className="w-full py-2.5 rounded bg-[#FF9900] hover:bg-[#FFAC1C] active:bg-[#E68A00] text-[#0B0F19] font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-[0.98] mt-2"
          >
            {isLoading ? 'Procesando...' : mode === 'register' ? 'Crear Cuenta y Migrar XP' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

