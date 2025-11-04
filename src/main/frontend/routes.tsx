import React from 'react';
import { createBrowserRouter, RouteObject } from 'react-router';
// Remove serverSideRoutes import - we don't need Flow routes for offline functionality
import MainView from './views/MainView';
import POIDetailView from './views/POIDetailView';

function build() {
    // Create only React routes - no Flow routes needed
    const reactRoutes: RouteObject[] = [
        {
            path: '/',
            element: <MainView />
        },
        {
            path: '/poi/:name',
            element: <POIDetailView />
        }
    ];

    // Use only React routes for full client-side rendering
    const routes = reactRoutes as RouteObject[];

    return {
        router: createBrowserRouter(routes, { basename: new URL(document.baseURI).pathname }),
        routes
    };
}

export const { router, routes } = build();
