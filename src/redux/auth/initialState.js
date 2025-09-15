import { responseStatuses } from "../../helpers/constants/responseStatus";

const initialState = {
  user: null,
  isAuthenticated: false,
  status: responseStatuses.LOADING, // Start with loading to prevent premature redirects
  error: null,
};

export default initialState;
