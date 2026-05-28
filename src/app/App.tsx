import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import * as Tooltip from '@radix-ui/react-tooltip';
import { LandingPage } from '../pages/landing/LandingPage';
import { ToastHost } from '../shared/ui/ToastHost';

const EditorPage = lazy(() =>
  import('../pages/editor/EditorPage').then((module) => ({ default: module.EditorPage })),
);

export function App() {
  return (
    <Tooltip.Provider delayDuration={300}>
      <BrowserRouter>
        <Routes>
          <Route element={<LandingPage />} path="/" />
          <Route
            element={
              <Suspense fallback={<div className="app-loading">Opening rack workspace...</div>}>
                <EditorPage />
              </Suspense>
            }
            path="/editor"
          />
        </Routes>
        <ToastHost />
      </BrowserRouter>
    </Tooltip.Provider>
  );
}
