import React, { useEffect } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { useAuth } from './AuthContent';
import ProfileSettingsPage from '../pages/account/ProfileSettingsPage';
import WalletPage from '../pages/account/WalletPage';
import PlaceholderPage from '../pages/account/PlaceholderPage';
import Profile from '../pages/profile/Profile';
import ChangePassword from '../pages/changepassword/ChangePassword';
import Portfolio from '../pages/portfolio/Portfolio';
import Polls from '../pages/polls/Polls';
import Notifications from '../pages/notifications/Notifications';
import Create from '../pages/create/Create';
import About from '../pages/about/About';
import Stats from '../pages/stats/Stats';
import LandingPage from '../pages/home/LandingPage';
import MarketDetails from '../pages/marketDetails/MarketDetails';
import User from '../pages/user/User';
import Style from '../pages/style/Style';
import NotFound from '../pages/notfound/NotFound';
import LoginForm from '../pages/auth/LoginForm';
import SignupFlow from '../pages/auth/SignupFlow';
import ChallengesHub from '../pages/challenges/ChallengesHub';
import ChallengeDetail from '../pages/challenges/ChallengeDetail';

const AppRoutes = () => {
  const auth = useAuth();

  const isLoggedIn = !!auth.username;
  const isRegularUser = isLoggedIn && auth.usertype !== 'ADMIN';
  const mustChangePassword = isLoggedIn && auth.changePasswordNeeded;

  return (
    <Switch>
      {/* Stylepage */}
      <Route exact path='/style' component={Style} />

      {/* Public Routes */}
      <Route exact path='/about'>
        {isLoggedIn && mustChangePassword ? (
          <Redirect to='/changepassword' />
        ) : (
          <About />
        )}
      </Route>
      <Route exact path='/markets/:marketId'>
        {isLoggedIn && mustChangePassword ? (
          <Redirect to='/changepassword' />
        ) : (
          <MarketDetails />
        )}
      </Route>
      {/* Markets is now part of the home page (LandingPage) at / */}
      <Route exact path='/challenges'>
        {isLoggedIn && mustChangePassword ? (
          <Redirect to='/changepassword' />
        ) : (
          <ChallengesHub />
        )}
      </Route>
      <Route exact path='/challenges/:id'>
        {isLoggedIn && mustChangePassword ? (
          <Redirect to='/changepassword' />
        ) : isLoggedIn ? (
          <ChallengeDetail />
        ) : (
          <Redirect to='/login' />
        )}
      </Route>
      <Route exact path='/polls'>
        {isLoggedIn && mustChangePassword ? (
          <Redirect to='/changepassword' />
        ) : (
          <Polls />
        )}
      </Route>
      <Route exact path='/user/:username'>
        {isLoggedIn && mustChangePassword ? (
          <Redirect to='/changepassword' />
        ) : (
          <User />
        )}
      </Route>
      <Route exact path='/stats'>
        {isLoggedIn && mustChangePassword ? (
          <Redirect to='/changepassword' />
        ) : (
          <Stats />
        )}
      </Route>

      {/* Private Routes for Regular Users Only */}
      <Route exact path='/changepassword'>
	{isLoggedIn ? <ChangePassword /> : <Redirect to='/' />}
      </Route>
      <Route exact path='/create'>
        {!isLoggedIn ? (
          <Redirect to='/' />
        ) : mustChangePassword ? (
          <Redirect to='/changepassword' />
        ) : isRegularUser ? (
          <Create />
        ) : (
          <Redirect to='/' />
        )}
      </Route>
      <Route exact path='/notifications'>
        {!isLoggedIn ? (
          <Redirect to='/' />
        ) : mustChangePassword ? (
          <Redirect to='/changepassword' />
        ) : isRegularUser ? (
          <Notifications />
        ) : (
          <Redirect to='/' />
        )}
      </Route>
      <Route exact path='/profile'>
        <Redirect to='/account/me' />
      </Route>
      <Route exact path='/account'>
        {isRegularUser ? <Redirect to='/account/me' /> : <Redirect to='/' />}
      </Route>
      <Route exact path='/account/me'>
        {isRegularUser ? <ProfileSettingsPage /> : <Redirect to='/' />}
      </Route>
      <Route exact path='/account/wallet'>
        {isRegularUser ? <WalletPage /> : <Redirect to='/' />}
      </Route>
      <Route exact path='/account/earn'>
        {isRegularUser ? <PlaceholderPage title="Earn Coins" /> : <Redirect to='/' />}
      </Route>
      <Route exact path='/account/xp'>
        {isRegularUser ? <PlaceholderPage title="XP Points" /> : <Redirect to='/' />}
      </Route>
      <Route exact path='/account/security'>
        {isRegularUser ? <ChangePassword /> : <Redirect to='/' />}
      </Route>
      <Route exact path='/portfolio'>
        {isRegularUser ? <Portfolio /> : <Redirect to='/' />}
      </Route>

      {/* Auth Routes */}
      <Route exact path='/login'>
        {isLoggedIn ? <Redirect to='/' /> : <LoginForm />}
      </Route>
      <Route exact path='/register'>
        {isLoggedIn ? <Redirect to='/' /> : <SignupFlow />}
      </Route>

      {/* Home Route */}
      {/* Unified Home Route - Always LandingPage */}
      <Route exact path='/'>
        {isLoggedIn && mustChangePassword ? (
          <Redirect to='/changepassword' />
        ) : (
          <LandingPage />
        )}
      </Route>

      {/* 404 Route - This should be the last route */}
      <Route path='*'>
        <NotFound />
      </Route>
    </Switch>
  );
};

export default AppRoutes;

