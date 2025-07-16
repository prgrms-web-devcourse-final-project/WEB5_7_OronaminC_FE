import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import LoadingFallback from '../components/LoadingFallback';
import MainLayout from '../layouts/MainLayout';

const Home = lazy(() => import('../pages/Home'));
const NotFound = lazy(() => import('../pages/NotFound'));
const CreateRoom = lazy(() => import('../pages/CreateRoom'));
const PresentationRoom = lazy(() => import('../pages/PresentationRoom'));
const MyPage = lazy(() => import('../pages/MyPage'));
const PresentationReport = lazy(() => import('../pages/PresentationReport'));
const OAuthCallback = lazy(() => import('../pages/OAuthCallback'));

export const routes: RouteObject[] = [
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Home />
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
        path: '/room/:roomId',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PresentationRoom />
          </Suspense>
        ),
      },
      {
        path: '/room/:roomId/report',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PresentationReport />
          </Suspense>
        ),
      },
      {
        path: '/mypage',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <MyPage />
          </Suspense>
        ),
      },
      {
        path: '/oauth/callback',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <OAuthCallback />
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
    ]
  }
];
