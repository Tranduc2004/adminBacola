import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import "./styles.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const RevenueChart = () => {
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AGU",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
  };

  const data = {
    labels: months,
    datasets: [
      {
        label: "Invested",
        data: [
          2800, 3200, 3400, 2900, 3100, 3500, 3000, 3200, 3400, 3300, 3000,
          3387.67,
        ],
        borderColor: "#0858f7",
        backgroundColor: "rgba(8, 88, 247, 0.1)",
        fill: true,
      },
      {
        label: "Earnings",
        data: [
          2400, 2800, 2900, 2300, 2600, 2800, 2600, 2800, 2900, 2800, 2500,
          2856.35,
        ],
        borderColor: "#2ecc71",
        backgroundColor: "rgba(46, 204, 113, 0.1)",
        fill: true,
      },
      {
        label: "Expenses",
        data: [
          1800, 2000, 2100, 1800, 1900, 2200, 1900, 2100, 2200, 2100, 1900,
          1994.12,
        ],
        borderColor: "#be4bdb",
        backgroundColor: "rgba(190, 75, 219, 0.1)",
        fill: true,
      },
    ],
  };

  return (
    <div className="revenue-chart">
      <div className="revenue-header">
        <h3>Revenue Report</h3>
        <select defaultValue="option">
          <option value="option">Select Option</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div className="revenue-metrics">
        <div className="metric">
          <div className="metric-icon invested">
            <i className="fas fa-shopping-bag"></i>
          </div>
          <div className="metric-info">
            <span>Invested</span>
            <h4>3,387.67K</h4>
          </div>
        </div>
        <div className="metric">
          <div className="metric-icon earnings">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="metric-info">
            <span>Earnings</span>
            <h4>2,856.35K</h4>
          </div>
        </div>
        <div className="metric">
          <div className="metric-icon expenses">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="metric-info">
            <span>Expenses</span>
            <h4>1,994.12K</h4>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

export default RevenueChart;
