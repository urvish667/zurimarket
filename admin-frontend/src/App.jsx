import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { AuthProvider, useAuth } from './helpers/AuthContent';
import Footer from './components/footer/Footer';
import AppRoutes from './helpers/AppRoutes';
import '../index.css';
import TopNavbar from './components/header/TopNavbar';

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
  const isAuthPage = ['/login'].includes(location.pathname);

  if (isAuthPage) {
    return (
      <div className='App bg-[#0b0f0e] min-h-screen text-on-surface font-body font-satoshi antialiased'>
        <AppRoutes />
      </div>
    );
  }

  // Unified Layout for the app without Sidebar
  return (
    <div className='App bg-[#0b0f0e] min-h-screen text-on-surface font-body font-satoshi antialiased flex flex-col'>
      <TopNavbar />
      <div className='flex flex-grow overflow-hidden'>
        <main className={`flex-grow overflow-y-auto`}>
          <div className='max-w-[1440px] mx-auto w-full'>
            <AppRoutes />
          </div>
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
