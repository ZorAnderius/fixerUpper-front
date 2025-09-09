import { responseStatuses } from "../../helpers/constants/responseStatus";

const initialState = {
  user: null,
  isAuthenticated: false,
  status: responseStatuses.IDLE,
  error: null,
};

export default initialState;
