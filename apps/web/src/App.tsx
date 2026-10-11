import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

import { DashboardPage } from './pages/Dashboard';
import { ProjectsPage } from './pages/Projects';
import { ProjectDetailsPage } from './pages/ProjectDetails';
import { PipelinesPage } from './pages/Pipelines';
import { DeploymentsPage } from './pages/Deployments';
import { LogsPage } from './pages/Logs';
import { MonitoringPage } from './pages/Monitoring';
import { InfrastructurePage } from './pages/Infrastructure';
import { TeamPage } from './pages/Team';
import { SettingsPage } from './pages/Settings';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { NotFoundPage } from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected SaaS Layout Routes */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailsPage />} />
              <Route path="/pipelines" element={<PipelinesPage />} />
              <Route path="/deployments" element={<DeploymentsPage />} />
              <Route path="/logs" element={<LogsPage />} />
              <Route path="/monitoring" element={<MonitoringPage />} />
              <Route path="/infrastructure" element={<InfrastructurePage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};
