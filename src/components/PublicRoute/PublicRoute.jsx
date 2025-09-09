import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectUser } from '../../redux/auth/selectors';
import { ROUTES } from '../../helpers/constants/routes';
import { useEffect } from 'react';

const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const location = useLocation();
  const navigate = useNavigate();

  console.log('PublicRoute - isAuthenticated:', isAuthenticated);
  console.log('PublicRoute - user:', user);
  console.log('PublicRoute - current path:', location.pathname);

  useEffect(() => {
    // If user is authenticated, redirect to home page
    if (isAuthenticated) {
      console.log('PublicRoute - redirecting authenticated user to home');
      // Get the intended destination from state, or default to home
      const from = location.state?.from?.pathname || ROUTES.MAIN;
      console.log('PublicRoute - navigating to:', from);
      
      // Try both methods to ensure redirect works
      navigate(from, { replace: true });
      
      // Fallback: force redirect with window.location
      setTimeout(() => {
        if (window.location.pathname === location.pathname) {
          console.log('PublicRoute - fallback redirect with window.location');
          window.location.href = from;
        }
      }, 100);
    }
  }, [isAuthenticated, navigate, location.state?.from?.pathname, location.pathname]);

  // If user is authenticated, don't render children
  if (isAuthenticated) {
    return null; // or a loading spinner
  }

  console.log('PublicRoute - allowing access to public route');
  return children;
};

export default PublicRoute;
