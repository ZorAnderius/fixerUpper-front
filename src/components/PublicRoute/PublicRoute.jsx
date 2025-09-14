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


  useEffect(() => {
    // If user is authenticated, redirect to home page
    if (isAuthenticated) {
      // Get the intended destination from state, or default to home
      const from = location.state?.from?.pathname || ROUTES.MAIN;
      
      // Use React Router navigation
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state?.from?.pathname]);

  // If user is authenticated, don't render children
  if (isAuthenticated) {
    return null; // or a loading spinner
  }

  return children;
};

export default PublicRoute;
