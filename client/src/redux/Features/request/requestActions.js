import API from "../../../services/API";
import {
  requestStart,
  requestSuccess,
  requestFail,
  updateRequestStatus,
} from "./requestSlice";

// Fetch incoming requests for donor
export const fetchIncomingRequests = () => async (dispatch) => {
  try {
    dispatch(requestStart());

    const { data } = await API.get("/request/incoming");

    if (data.success) {
      dispatch(requestSuccess(data.requests));
    } else {
      dispatch(requestFail("Failed to load requests"));
    }
  } catch (error) {
    dispatch(requestFail(error.message));
  }
};

// Accept request
export const acceptRequest = (id) => async (dispatch) => {
  try {
    await API.patch(`/request/accept/${id}`);
    dispatch(updateRequestStatus({ id, status: "accepted" }));
  } catch (error) {
    console.error(error);
  }
};

// Reject request
export const rejectRequest = (id) => async (dispatch) => {
  try {
    await API.patch(`/request/reject/${id}`);
    dispatch(updateRequestStatus({ id, status: "rejected" }));
  } catch (error) {
    console.error(error);
  }
};
