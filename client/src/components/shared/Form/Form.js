import React, { useState } from "react";
import InputType from "./InputType";
import { Link } from "react-router-dom";
import { handleLogin, handleRegister } from "../../../services/authService";

const Form = ({ formType, submitBtn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("donar");
  const [name, setName] = useState("");
  const [organisationName, setOrganisationName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        if (formType === "login")
          return handleLogin(e, email, password, role);
        else if (formType === "register")
          return handleRegister(
            e,
            name,
            role,
            email,
            password,
            phone,
            organisationName,
            address,
            hospitalName,
            website
          );
      }}
    >
      {/* ROLE SELECTION */}
      <div className="flex items-center justify-between gap-3 bg-red-50 p-3 rounded-md">
        {["donar", "admin", "hospital", "organisation"].map((r) => (
          <label key={r} className="flex items-center gap-2 text-gray-700">
            <input
              type="radio"
              name="role"
              value={r}
              checked={role === r}
              onChange={(e) => setRole(e.target.value)}
              className="accent-red-600"
            />
            <span className="capitalize">{r}</span>
          </label>
        ))}
      </div>

      {/* FORM FIELDS */}
      {formType === "login" && (
        <>
          <InputType
            labelText="Email"
            inputType="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <InputType
            labelText="Password"
            inputType="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </>
      )}

      {formType === "register" && (
        <>
          {(role === "admin" || role === "donar") && (
            <InputType
              labelText="Name"
              inputType="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          {role === "organisation" && (
            <InputType
              labelText="Organisation Name"
              inputType="text"
              value={organisationName}
              onChange={(e) => setOrganisationName(e.target.value)}
            />
          )}

          {role === "hospital" && (
            <InputType
              labelText="Hospital Name"
              inputType="text"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
            />
          )}

          <InputType
            labelText="Email"
            inputType="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <InputType
            labelText="Password"
            inputType="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <InputType
            labelText="Website"
            inputType="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          <InputType
            labelText="Address"
            inputType="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <InputType
            labelText="Phone"
            inputType="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </>
      )}

      {/* BOTTOM ROW */}
      <div className="flex items-center justify-between pt-2">
        {formType === "login" ? (
          <p className="text-gray-600 text-sm">
            Not registered yet?{" "}
            <Link to="/register" className="text-red-600 font-medium">
              Register here
            </Link>
          </p>
        ) : (
          <p className="text-gray-600 text-sm">
            Already a user?{" "}
            <Link to="/login" className="text-red-600 font-medium">
              Login here
            </Link>
          </p>
        )}

        <button
          className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition font-semibold"
          type="submit"
        >
          {submitBtn}
        </button>
      </div>
    </form>
  );
};

export default Form;
