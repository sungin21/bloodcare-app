import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchIncomingRequests,
  acceptRequest,
  rejectRequest,
} from "../redux/Features/request/requestActions";
import Layout from "../components/shared/Layout/Layout";

const DonorRequests = () => {
  const dispatch = useDispatch();
  const { incoming, loading } = useSelector((state) => state.requests);

  useEffect(() => {
    dispatch(fetchIncomingRequests());
  }, [dispatch]);

  return (
    <Layout>
      <div className="container mt-4">
        <h3>Incoming Blood Requests</h3>

        {loading && <p>Loading...</p>}

        {incoming.length === 0 ? (
          <p>No requests yet.</p>
        ) : (
          incoming.map((req) => (
            <div key={req._id} className="card p-3 mt-3 shadow-sm">
              <p>
                <strong>Requester:</strong> {req.requester.name} ({req.requester.email})
              </p>
              <p>
                <strong>Blood Group:</strong> {req.bloodGroup}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    req.status === "pending"
                      ? "text-warning"
                      : req.status === "accepted"
                      ? "text-success"
                      : "text-danger"
                  }
                >
                  {req.status}
                </span>
              </p>

              {req.status === "pending" && (
                <>
                  <button
                    className="btn btn-success me-2"
                    onClick={() => dispatch(acceptRequest(req._id))}
                  >
                    Accept
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => dispatch(rejectRequest(req._id))}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default DonorRequests;
