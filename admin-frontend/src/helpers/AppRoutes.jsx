import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { useAuth } from './AuthContent';
import AdminDashboard from '../pages/admin/AdminDashboard';
import NotFound from '../pages/notfound/NotFound';
import AdminLoginForm from '../pages/auth/AdminLoginForm';
import ChangePassword from '../pages/changepassword/ChangePassword';

const AppRoutes = () => {
  const auth = useAuth();

  const isLoggedIn = !!auth.username;
  const isAdmin = isLoggedIn && auth.usertype === 'ADMIN';
  const mustChangePassword = isLoggedIn && auth.changePasswordNeeded;

  return (
    <Switch>
      {/* Admin Login */}
      <Route exact path='/login'>
        {isAdmin ? <Redirect to='/' /> : <AdminLoginForm />}
      </Route>

      {/* Password Change Required */}
      <Route exact path='/changepassword'>
        {isLoggedIn ? <ChangePassword /> : <Redirect to='/login' />}
      </Route>

      {/* Admin Dashboard - Root of this domain */}
      <Route exact path='/'>
        {isLoggedIn && mustChangePassword ? (
          <Redirect to='/changepassword' />
        ) : isAdmin ? (
          <AdminDashboard />
        ) : (
          <Redirect to='/login' />
        )}
      </Route>

      {/* Legacy /admin path redirect to / */}
      <Route exact path='/admin'>
        <Redirect to='/' />
      </Route>

      {/* 404 Route */}
      <Route path='*'>
        <NotFound />
      </Route>
    </Switch>
  );
};

export default AppRoutes;
