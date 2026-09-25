import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ApiHttpError } from '../../../shared/api/ApiHttpError';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login, isLoading } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    try {
      await login({ email, password });
    } catch (err) {
      if (ApiHttpError.isApiHttpError(err)) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Ocurrió un error al intentar iniciar sesión.');
      }
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden transition-colors duration-200">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-3 border border-amber-500/20">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">Iniciar Sesión</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Accede a tu cuenta permanente de AWS Architecture Quest.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2.5 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-page-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Correo Electrónico</label>
            <input
              id="login-page-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          <div>
            <label htmlFor="login-page-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Contraseña</label>
            <input
              id="login-page-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 active:scale-[0.98] mt-2"
          >
            {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          ¿No tienes una cuenta permanente?{' '}
          <Link to="/register" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline inline-flex items-center">
            <Sparkles className="w-3 h-3 mr-1" />
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
