import React from 'react';
import { createBrowserRouter, RouteObject } from 'react-router';
import MainView from './views/MainView';
import POIDetailView from './views/POIDetailView';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainView />
  },
  {
    path: '/poi/:name',
    element: <POIDetailView />
  }
];

export const router = createBrowserRouter(routes);
export { routes };
