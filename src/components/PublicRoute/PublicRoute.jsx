import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectAuthStatus } from '../../redux/auth/selectors';
import { ROUTES } from '../../helpers/constants/routes';
import { useEffect } from 'react';
import { responseStatuses } from '../../helpers/constants/responseStatus';
import { ContentLoader } from '../Loader';

const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authStatus = useSelector(selectAuthStatus);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're sure user is authenticated (not loading)
    if (authStatus === responseStatuses.SUCCEEDED && isAuthenticated) {
      // Get the intended destination from state, or default to home
      const from = location.state?.from || ROUTES.MAIN;
      
      // Use React Router navigation
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authStatus, navigate, location.state?.from]);

  // If user is authenticated and auth is not loading, don't render children
  if (authStatus === responseStatuses.SUCCEEDED && isAuthenticated) {
    return null; // or a loading spinner
  }

  return children;
};

export default PublicRoute;
