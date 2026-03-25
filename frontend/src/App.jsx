import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { AuthProvider, useAuth } from './helpers/AuthContent';
import Footer from './components/footer/Footer';
import AppRoutes from './helpers/AppRoutes';
import '../index.css';
import Sidebar from './components/sidebar/Sidebar';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-primary-background text-white'>
      <h1 className='text-4xl font-bold mb-4'>Oops! Something went wrong.</h1>
      <p className='text-xl mb-8'>
        We're sorry for the inconvenience. Please try again.
      </p>
      <pre className='mb-8 p-4 bg-gray-800 rounded'>{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className='px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
      >
        Try again
      </button>
    </div>
  );
}

function AppLayout() {
  const auth = useAuth();
  const location = useLocation();
  const isLoggedIn = !!auth.username;
  const isLandingPage = location.pathname === '/' && !isLoggedIn;
  const isAuthPage = ['/login', '/register', '/admin/login'].includes(location.pathname);

  if (isLandingPage || isAuthPage) {
    return (
      <div className='App bg-background min-h-screen text-on-background'>
        <AppRoutes />
      </div>
    );
  }

  // Standard logged-in or global layout
  return (
    <div className='App bg-primary-background min-h-screen text-white flex flex-col md:flex-row'>
      <Sidebar />
      <div className='flex flex-col flex-grow w-full'>
        <main className='flex-grow p-4 sm:p-6 overflow-y-auto w-full'>
          <AppRoutes />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state of your app so the error doesn't happen again
      }}
    >
      <AuthProvider>
        <Router>
          <AppLayout />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
