import React from "react";
import "./styles.css";

const DashboardBox = ({ title, value, change, icon, color }) => {
  return (
    <div className={`dashboard-box ${color}`}>
      <div className="box-content">
        <div className="box-info">
          <h3 className="box-title">{title}</h3>
          <div className="box-value">{value}</div>
          {change && (
            <div className="box-change">
              {change > 0 ? "+" : ""}
              {change}% Last Month
            </div>
          )}
        </div>
        <div className="box-icon">{icon}</div>
      </div>
    </div>
  );
};

export default DashboardBox;
