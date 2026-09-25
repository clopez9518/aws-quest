import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import { RootErrorBoundary } from './RootErrorBoundary';
import { NotFoundPage } from './NotFoundPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { CatalogPage } from '../features/catalog/pages/CatalogPage';
import { ChallengePage } from '../features/challenge/pages/ChallengePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RootErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/catalog" replace />
      },
      {
        path: 'catalog',
        element: <CatalogPage />
      },
      {
        path: 'challenges/:id',
        element: <ChallengePage />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'register',
        element: <RegisterPage />
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);
