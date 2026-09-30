import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from '../routes';
import { useGuestSession } from '../features/auth/hooks/useGuestSession';
import { CatalogSkeleton } from '../features/catalog/components/CatalogSkeleton';
import { ApiHttpError } from '../shared/api/ApiHttpError';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de caché por defecto
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // No reintentar en errores 4xx de cliente (ej. 400 Bad Request, 401 Unauthorized, 404 Not Found)
        if (ApiHttpError.isApiHttpError(error)) {
          if (error.statusCode >= 400 && error.statusCode < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Backoff exponencial: 1s, 2s, 4s... máx 10s
    },
    mutations: {
      retry: false, // Las mutaciones no deben reintentarse automáticamente para evitar duplicidad
    }
  }
});

function AppContent() {
  // Inicializa la sesión de invitado de manera transparente si no hay sesión activa
  const { isInitialized } = useGuestSession();

  if (!isInitialized) {
    return (
      <div
        data-testid="app-bootstrapping-loader"
        className="min-h-screen bg-slate-100 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6"
      >
        <div className="w-full max-w-6xl mx-auto space-y-6">
          <CatalogSkeleton />
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
