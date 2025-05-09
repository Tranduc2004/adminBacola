import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  Chip,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUserDetailApi } from "../../utils/api";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";
import "./styles.css";

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchUserDetail = async () => {
      if (!id) {
        toast.error("Không tìm thấy ID người dùng");
        navigate("/users");
        return;
      }
      try {
        setLoading(true);
        const response = await fetchUserDetailApi(id);
        console.log("Response từ API:", response);

        if (response) {
          console.log("Dữ liệu user từ API:", response);
          setUser(response);
        } else {
          console.log("Response không có dữ liệu");
          setUser(null);
        }
      } catch (error) {
        console.error("Chi tiết lỗi:", error);
        console.error("Response error:", error.response?.data);
        toast.error("Không thể lấy thông tin người dùng");
        navigate("/users");
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetail();
  }, [id, navigate]);

  if (loading) {
    return (
      <Box sx={{ p: 3, color: "text.primary" }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3, color: "text.primary" }}>
        <Typography>Không tìm thấy người dùng</Typography>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return { color: "#b26a00", backgroundColor: "#fff3cd" };
      case "PROCESSING":
        return { color: "#1976d2", backgroundColor: "#e3f2fd" };
      case "SHIPPED":
        return { color: "#6f42c1", backgroundColor: "#ede7f6" };
      case "DELIVERED":
        return { color: "#388e3c", backgroundColor: "#e8f5e9" };
      case "CANCELLED":
        return { color: "#d32f2f", backgroundColor: "#ffebee" };
      default:
        return { color: "#757575", backgroundColor: "#f5f5f5" };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "PROCESSING":
        return "Đang xử lý";
      case "SHIPPED":
        return "Đang giao hàng";
      case "DELIVERED":
        return "Đã giao hàng";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  return (
    <div className="user-detail-container">
      {/* Header */}
      <div className="header">
        <h1>Chi tiết người dùng</h1>
        <div className="breadcrumbs">
          <Link to="/" className="breadcrumb-link">
            Trang chủ
          </Link>
          <span className="separator">~</span>
          <Link to="/users" className="breadcrumb-link">
            Người dùng
          </Link>
          <span className="separator">~</span>
          <span>Chi tiết người dùng</span>
        </div>
      </div>

      <Button
        variant="outlined"
        onClick={() => navigate("/users")}
        startIcon={<FaArrowLeft />}
        sx={{
          mb: 3,
          color: "primary.main",
          borderColor: "primary.main",
          "&:hover": {
            borderColor: "primary.dark",
            backgroundColor: "action.hover",
          },
        }}
      >
        Quay lại
      </Button>

      <div className="user-info-card">
        <h2>Thông tin người dùng</h2>
        <div className="info-grid">
          <div className="info-item">
            <div className="info-label">Tên</div>
            <div className="info-value">{user.name}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Email</div>
            <div className="info-value">{user.email}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Số điện thoại</div>
            <div className="info-value">{user.phone || "Chưa cập nhật"}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Vai trò</div>
            <div className="info-value">
              <Chip
                label={user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                size="small"
                sx={{
                  backgroundColor:
                    user.role === "admin" ? "info.lighter" : "primary.lighter",
                  color: user.role === "admin" ? "info.main" : "primary.main",
                  fontWeight: 600,
                }}
              />
            </div>
          </div>
          <div className="info-item">
            <div className="info-label">Trạng thái</div>
            <div className="info-value">
              <span
                className={`status-badge ${
                  user.isActive ? "status-active" : "status-inactive"
                }`}
              >
                {user.isActive ? "Hoạt động" : "Vô hiệu hóa"}
              </span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-label">Ngày tạo</div>
            <div className="info-value">
              {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="user-info-card">
        <h2>Lịch sử đơn hàng</h2>
        <TableContainer>
          <Table className="orders-table">
            <TableHead>
              <TableRow>
                <TableCell>Mã đơn hàng</TableCell>
                <TableCell>Ngày đặt</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell>Phương thức thanh toán</TableCell>
                <TableCell>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {user.orders && user.orders.length > 0 ? (
                user.orders.map((order) => {
                  // Ưu tiên sử dụng finalAmount từ API nếu có
                  let finalAmount = order.finalAmount;
                  let discountedTotal = order.totalAmount;
                  let hasDiscount = false;

                  // Nếu không có finalAmount, tính toán lại
                  if (typeof finalAmount !== "number") {
                    // Tính tổng tiền sản phẩm đã giảm giá
                    discountedTotal = 0;
                    if (order.items && order.items.length > 0) {
                      order.items.forEach((item) => {
                        const price = item.price || item.product?.price || 0;
                        const discount =
                          typeof item.discount === "number"
                            ? item.discount
                            : item.product?.discount || 0;
                        const finalPrice =
                          discount > 0 ? price * (1 - discount / 100) : price;
                        discountedTotal += finalPrice * item.quantity;
                      });
                      discountedTotal = Math.round(discountedTotal);
                    } else {
                      discountedTotal = order.totalAmount;
                    }

                    // Tính tổng cuối cùng sau khi áp voucher
                    finalAmount = discountedTotal;
                    if (order.discountAmount && order.discountAmount > 0) {
                      finalAmount = Math.round(
                        discountedTotal - order.discountAmount
                      );
                    }
                  }

                  // Xác định có giảm giá không
                  hasDiscount =
                    discountedTotal < order.totalAmount ||
                    (order.discountAmount && order.discountAmount > 0);

                  return (
                    <TableRow key={order._id}>
                      <TableCell>{order._id}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        {hasDiscount ? (
                          <>
                            <span
                              style={{
                                textDecoration: "line-through",
                                color: "#888",
                                marginRight: 4,
                              }}
                            >
                              {order.totalAmount.toLocaleString("vi-VN")}đ
                            </span>
                            <span style={{ color: "#ed174a", fontWeight: 600 }}>
                              {discountedTotal.toLocaleString("vi-VN")}đ
                            </span>
                            {order.discountAmount > 0 && (
                              <>
                                <br />
                                <span
                                  style={{ fontSize: "12px", color: "#666" }}
                                >
                                  Giảm voucher: -
                                  {order.discountAmount.toLocaleString("vi-VN")}
                                  đ
                                </span>
                                <br />
                                <span
                                  style={{ color: "#ed174a", fontWeight: 600 }}
                                >
                                  Tổng: {finalAmount.toLocaleString("vi-VN")}đ
                                </span>
                              </>
                            )}
                          </>
                        ) : (
                          <span>
                            {order.totalAmount.toLocaleString("vi-VN")}đ
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {order.paymentMethod === "COD"
                          ? "Thanh toán khi nhận hàng"
                          : "Momo"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(order.status)}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            ...getStatusColor(order.status),
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Chưa có đơn hàng nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default UserDetail;
