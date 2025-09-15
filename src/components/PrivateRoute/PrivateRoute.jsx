import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectAuthStatus } from '../../redux/auth/selectors';
import { responseStatuses } from '../../helpers/constants/responseStatus';
import { ContentLoader } from '../Loader';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authStatus = useSelector(selectAuthStatus);
  const location = useLocation();

  // Show loader while auth is being determined
  if (authStatus === responseStatuses.LOADING) {
    return <ContentLoader variant="spinner" text="Checking authentication..." />;
  }

  // Only redirect if we're sure user is not authenticated (not loading)
  if (authStatus === responseStatuses.FAILED || (authStatus === responseStatuses.IDLE && !isAuthenticated)) {
    // Redirect to login while preserving current page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;


