import React, { useState } from "react";

const OTPModal = ({ isOpen, onClose, onVerify }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Verify Your Email</h3>

        {!sent ? (
          <>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
            <button
              style={styles.button}
              onClick={() => {
                setSent(true);
                onVerify("send", email);
              }}
            >
              Send OTP
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={styles.input}
            />

            <button
              style={styles.button}
              onClick={() => onVerify("verify", email, otp)}
            >
              Verify OTP
            </button>
          </>
        )}

        <button style={styles.close} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "350px",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "crimson",
    color: "#fff",
    border: "none",
    marginTop: "10px",
  },
  close: {
    marginTop: "10px",
    background: "#444",
    color: "#fff",
    padding: "8px",
    width: "100%",
    border: "none",
  },
};

export default OTPModal;
