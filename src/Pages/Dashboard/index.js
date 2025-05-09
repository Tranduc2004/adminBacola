import React, { useEffect, useState } from "react";
import DashboardBox from "../../Components/DashboardBox";
import ProductTable from "../../Components/ProductTable";
import RevenueChart from "../../Components/RevenueChart";
import OrdersOverview from "../../Components/OrdersOverview";
import {
  FaUsers,
  FaShoppingCart,
  FaMoneyBillWave,
  FaStar,
} from "react-icons/fa";
import axios from "axios";
import "./styles.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalReviews: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const response = await axios.get(
          "http://localhost:4000/api/admin/dashboard-stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStats(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy thống kê:", error);
      }
    };

    fetchStats();
  }, []);

  const dashboardData = [
    {
      title: "Tổng số người dùng",
      value: stats.totalUsers.toString(),
      change: 95,
      icon: <FaUsers />,
      color: "green",
    },
    {
      title: "Tổng số đơn hàng",
      value: stats.totalOrders.toString(),
      change: 30,
      icon: <FaShoppingCart />,
      color: "purple",
    },
    {
      title: "Tổng doanh thu",
      value: new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(stats.totalRevenue),
      change: 25,
      icon: <FaMoneyBillWave />,
      color: "blue",
    },
    {
      title: "Tổng số đánh giá",
      value: stats.totalReviews.toString(),
      change: 45,
      icon: <FaStar />,
      color: "yellow",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
      </div>

      <div className="dashboard-grid">
        {dashboardData.map((item, index) => (
          <DashboardBox
            key={index}
            title={item.title}
            value={item.value}
            change={item.change}
            icon={item.icon}
            color={item.color}
          />
        ))}
      </div>

      <ProductTable />
      <div className="dashboard-charts">
        <RevenueChart />
        <OrdersOverview />
      </div>
    </div>
  );
};

export default Dashboard;
