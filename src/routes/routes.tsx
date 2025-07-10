import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import LoadingFallback from '../components/LoadingFallback';

const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const NotFound = lazy(() => import('../pages/NotFound'));
const CreateRoom = lazy(() => import('../pages/CreateRoom'));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Home />
      </Suspense>
    ),
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/create-room',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <CreateRoom />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <NotFound />
      </Suspense>
    ),
  },
];
