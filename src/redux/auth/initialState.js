import { responseStatuses } from "../../helpers/constants/responseStatus";

const initialState = {
  user: null,
  isAuthenticated: false,
  status: responseStatuses.IDLE, // Start with IDLE to prevent infinite loading
  error: null,
};

export default initialState;
