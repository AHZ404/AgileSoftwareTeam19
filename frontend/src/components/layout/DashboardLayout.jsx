import React from "react";

const DashboardLayout = ({ sidebar, header, children }) => {
  return (
    <div className="container">
      {sidebar}
      <div className="main-content">
        <div className="header">{header}</div>
        <div className="content-wrapper">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
