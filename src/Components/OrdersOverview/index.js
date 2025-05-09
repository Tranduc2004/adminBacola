import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./styles.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const OrdersOverview = () => {
  const data = {
    labels: ["Pending", "Shipped", "Received", "Cancelled", "Refunded"],
    datasets: [
      {
        data: [547, 398, 605, 249, 176],
        backgroundColor: [
          "#be4bdb", // Pending - Purple
          "#0858f7", // Shipped - Blue
          "#2ecc71", // Received - Green
          "#ff4757", // Cancelled - Red
          "#ffd43b", // Refunded - Yellow
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    cutout: "70%",
  };

  const orderStatus = [
    { label: "Pending", count: 547, color: "#be4bdb" },
    { label: "Shipped", count: 398, color: "#0858f7" },
    { label: "Received", count: 605, color: "#2ecc71" },
    { label: "Cancelled", count: 249, color: "#ff4757" },
    { label: "Refunded", count: 176, color: "#ffd43b" },
  ];

  return (
    <div className="orders-overview">
      <div className="overview-header">
        <h3>Orders Overview</h3>
        <button className="more-btn">•••</button>
      </div>

      <div className="overview-content">
        <div className="chart-wrapper">
          <Doughnut data={data} options={options} />
        </div>

        <div className="status-list">
          {orderStatus.map((status, index) => (
            <div key={index} className="status-item">
              <div className="status-info">
                <span
                  className="status-dot"
                  style={{ backgroundColor: status.color }}
                ></span>
                <span className="status-label">{status.label}</span>
              </div>
              <span className="status-count">{status.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersOverview;
