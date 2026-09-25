import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from '../routes';
import { useGuestSession } from '../features/auth/hooks/useGuestSession';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de caché por defecto
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

function AppContent() {
  // Inicializa la sesión de invitado de manera transparente si no hay sesión activa
  useGuestSession();

  return <RouterProvider router={router} />;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
