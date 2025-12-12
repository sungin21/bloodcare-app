// client/src/components/shared/Layout/Layout.js
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../../../styles/Layout.css";

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="layout-wrapper">
      <Sidebar isOpen={isOpen} />

      <div className={isOpen ? "main-content shift" : "main-content"}>
        <Header toggleSidebar={() => setIsOpen(!isOpen)} />

        <div className="content-area">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
