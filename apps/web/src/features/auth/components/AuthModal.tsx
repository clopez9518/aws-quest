import { useState } from 'react';
import { X, Sparkles, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap';
import { ApiHttpError } from '../../../shared/api/ApiHttpError';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden transition-colors duration-200"
      >
        {/* Glow de acento */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Botón de Cierre */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header del Modal */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-3 border border-amber-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 id="auth-modal-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {mode === 'register' ? 'Conserva tu progreso' : 'Bienvenido de nuevo'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            {mode === 'register'
              ? `Crea una cuenta permanente para sincronizar tus ${user?.totalXP ?? 0} XP y récords históricos.`
              : 'Inicia sesión para continuar con tu ruta de aprendizaje de AWS.'}
          </p>
        </div>

        {/* Tabs de Selección */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950/60 p-1 border border-slate-200 dark:border-slate-800 mb-5">
          <button
            type="button"
            data-testid="auth-tab-register"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              mode === 'register' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
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
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              mode === 'login' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </button>
        </div>

        {/* Mensaje de Error */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
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
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
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
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          <div>
            <label htmlFor="auth-modal-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Contraseña</label>
            <input
              id="auth-modal-password"
              data-testid="auth-password-input"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          <button
            type="submit"
            data-testid={mode === 'register' ? 'auth-submit-register' : 'auth-submit-login'}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 active:scale-[0.98] mt-2"
          >
            {isLoading ? 'Procesando...' : mode === 'register' ? 'Crear Cuenta y Migrar XP' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
