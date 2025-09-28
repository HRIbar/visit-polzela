import React from 'react';
import { createBrowserRouter, RouteObject } from 'react-router';
import { serverSideRoutes } from 'Frontend/generated/flow/Flow';
import MainView from './views/MainView';
import POIDetailView from './views/POIDetailView';

function build() {
    // Create our React routes
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

    // Combine server-side routes with our React routes
    const routes = [...serverSideRoutes, ...reactRoutes] as RouteObject[];

    return {
        router: createBrowserRouter(routes, { basename: new URL(document.baseURI).pathname }),
        routes
    };
}

export const { router, routes } = build();
