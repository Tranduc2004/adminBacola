import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Pagination,
} from "@mui/material";
import { Visibility, Edit } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import { fetchAllOrdersApi, editData } from "../../utils/api";
import { useTheme } from "../../context/ThemeContext";
import { Link } from "react-router-dom";
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const { isDarkMode } = useTheme();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      toast.loading("Đang tải danh sách đơn hàng...");
      const response = await fetchAllOrdersApi();
      if (response.success) {
        toast.dismiss();
        setOrders(response.data);
      } else {
        toast.dismiss();
        toast.error("Không thể tải danh sách đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      toast.dismiss();
      toast.error("Có lỗi xảy ra khi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async () => {
    try {
      toast.loading("Đang cập nhật trạng thái...");
      const response = await editData(
        `/api/admin/orders/${selectedOrder._id}/status`,
        {
          status: newStatus,
          note: statusNote,
        }
      );
      if (response.success) {
        toast.dismiss();
        toast.success("Cập nhật trạng thái đơn hàng thành công");
        setOpenEditDialog(false);
        fetchOrders();
      } else {
        toast.dismiss();
        toast.error("Không thể cập nhật trạng thái đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      toast.dismiss();
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return { color: "#b26a00", backgroundColor: "#fff3cd" }; // vàng
      case "PROCESSING":
        return { color: "#1976d2", backgroundColor: "#e3f2fd" }; // xanh dương
      case "SHIPPED":
        return { color: "#6f42c1", backgroundColor: "#ede7f6" }; // tím
      case "DELIVERED":
        return { color: "#388e3c", backgroundColor: "#e8f5e9" }; // xanh lá
      case "CANCELLED":
        return { color: "#d32f2f", backgroundColor: "#ffebee" }; // đỏ
      default:
        return { color: "#757575", backgroundColor: "#f5f5f5" }; // xám
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Hàm tính tổng tiền đã giảm cho đơn hàng
  const getDiscountedTotal = (order) => {
    if (!order.items || order.items.length === 0) return order.totalAmount;
    let discountedTotal = 0;
    order.items.forEach((item) => {
      const price = item.price || item.product?.price || 0;
      const discount =
        typeof item.discount === "number"
          ? item.discount
          : item.product?.discount || 0;
      const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
      discountedTotal += finalPrice * item.quantity;
    });
    return Math.round(discountedTotal);
  };

  // Hàm tính giá cuối cùng sau khi áp dụng voucher
  const getFinalAmount = (order) => {
    const discountedTotal = getDiscountedTotal(order);
    if (order.discountAmount && order.discountAmount > 0) {
      return Math.round(discountedTotal - order.discountAmount);
    }
    return discountedTotal;
  };

  return (
    <div className="category-table-container">
      <div className="header">
        <h1>Danh sách đơn hàng</h1>
        <div className="breadcrumbs">
          <Link to="/" className="breadcrumb-link">
            Trang chủ
          </Link>
          <span className="separator">~</span>
          <Link to="/orders" className="breadcrumb-link">
            Đơn hàng
          </Link>
          <span className="separator">~</span>
          <span>Danh sách đơn hàng</span>
        </div>
      </div>
      <div className="table-header-section">
        <h3>Quản lý đơn hàng</h3>
      </div>
      <div className="table-responsive">
        <table className="category-table">
          <thead>
            <tr>
              <th>Mã đơn hàng</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>
                  {order.user?.name || "Không có thông tin"}
                  <br />
                  <span style={{ color: "#888", fontSize: 12 }}>
                    {order.user?.email}
                  </span>
                </td>
                <td>{formatDate(order.createdAt)}</td>
                <td>
                  {/* Hiển thị giá đã giảm nếu có sản phẩm giảm giá */}
                  {(() => {
                    const discounted = getDiscountedTotal(order);
                    const finalAmount = getFinalAmount(order);
                    return (
                      <>
                        {discounted < order.totalAmount && (
                          <span
                            style={{
                              textDecoration: "line-through",
                              color: "#888",
                              marginRight: 4,
                            }}
                          >
                            {order.totalAmount
                              ? order.totalAmount.toLocaleString("vi-VN")
                              : "0"}
                            đ
                          </span>
                        )}
                        {order.discountAmount > 0 ? (
                          <>
                            <span
                              style={{
                                color: "#ed174a",
                                fontWeight: 600,
                                marginRight: 4,
                              }}
                            >
                              {discounted.toLocaleString("vi-VN")}đ
                            </span>
                            <br />
                            <span style={{ fontSize: "12px", color: "#666" }}>
                              Giảm voucher: -
                              {order.discountAmount.toLocaleString("vi-VN")}đ
                            </span>
                            <br />
                            <span style={{ color: "#ed174a", fontWeight: 600 }}>
                              Tổng: {finalAmount.toLocaleString("vi-VN")}đ
                            </span>
                          </>
                        ) : (
                          <span style={{ color: "#ed174a", fontWeight: 600 }}>
                            {discounted.toLocaleString("vi-VN")}đ
                          </span>
                        )}
                      </>
                    );
                  })()}
                </td>
                <td>
                  <span
                    style={{
                      fontWeight: 600,
                      padding: "4px 8px",
                      borderRadius: "4px",
                      ...getStatusColor(order.status),
                    }}
                  >
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td>
                  <IconButton
                    onClick={() => {
                      setSelectedOrder(order);
                      setOpenDetailDialog(true);
                    }}
                    sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                    className="edit-btn"
                    title="Xem chi tiết"
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setSelectedOrder(order);
                      setNewStatus(order.status);
                      setStatusNote("");
                      setOpenEditDialog(true);
                    }}
                    sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                    className="delete-btn"
                    title="Cập nhật trạng thái"
                  >
                    <Edit />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <div className="showing-info">
          Hiển thị {orders.length > 0 ? 1 : 0}-{orders.length} trên{" "}
          {orders.length} kết quả
        </div>
        <div className="pagination">
          <Pagination count={1} page={1} onChange={() => {}} color="primary" />
        </div>
      </div>

      {/* Dialog xem chi tiết đơn hàng */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: isDarkMode ? "#0f1824" : "#fff",
            color: isDarkMode ? "#fff" : "#1a1a1a",
          },
        }}
      >
        <DialogTitle>Chi tiết đơn hàng</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Grid container spacing={2}>
                <Grid span={6}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                  >
                    Thông tin khách hàng
                  </Typography>
                  <Typography sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                    Tên: {selectedOrder.shippingAddress.fullName}
                  </Typography>
                  <Typography sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                    SĐT: {selectedOrder.shippingAddress.phone}
                  </Typography>
                  <Typography sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                    Địa chỉ: {selectedOrder.shippingAddress.address},{" "}
                    {selectedOrder.shippingAddress.ward},{" "}
                    {selectedOrder.shippingAddress.district},{" "}
                    {selectedOrder.shippingAddress.city}
                  </Typography>
                </Grid>
                <Grid span={6}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                  >
                    Thông tin đơn hàng
                  </Typography>
                  <Typography sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                    Phương thức thanh toán:{" "}
                    {selectedOrder.paymentMethod === "COD"
                      ? "Thanh toán khi nhận hàng"
                      : "Thanh toán MOMO"}
                  </Typography>
                  <Typography sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                    Tổng tiền:{" "}
                    {selectedOrder.totalAmount
                      ? selectedOrder.totalAmount.toLocaleString("vi-VN")
                      : "0"}
                    đ
                  </Typography>
                  <Typography
                    component="span"
                    sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                  >
                    Trạng thái:{" "}
                  </Typography>
                  <Chip
                    label={getStatusText(selectedOrder.status)}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      ...getStatusColor(selectedOrder.status),
                    }}
                  />
                </Grid>
              </Grid>

              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ mt: 2, color: isDarkMode ? "#fff" : "#1a1a1a" }}
              >
                Sản phẩm
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                      >
                        Tên sản phẩm
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                      >
                        Số lượng
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                      >
                        Đơn giá
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                      >
                        Thành tiền
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items.map((item) => {
                      const price = item.price || item.product?.price || 0;
                      const discount =
                        typeof item.discount === "number"
                          ? item.discount
                          : item.product?.discount || 0;
                      const finalPrice =
                        discount > 0 ? price * (1 - discount / 100) : price;
                      return (
                        <TableRow key={item._id}>
                          <TableCell
                            sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                          >
                            <Box display="flex" alignItems="center">
                              {item.product?.images?.[0] && (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  style={{
                                    width: 50,
                                    height: 50,
                                    marginRight: 10,
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                  }}
                                />
                              )}
                              {item.product?.name}
                            </Box>
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                          >
                            {item.quantity}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                          >
                            {discount > 0 ? (
                              <>
                                <span
                                  style={{
                                    textDecoration: "line-through",
                                    color: "#888",
                                    marginRight: 4,
                                  }}
                                >
                                  {price.toLocaleString("vi-VN")}đ
                                </span>
                                <span
                                  style={{ color: "#ed174a", fontWeight: 600 }}
                                >
                                  {finalPrice.toLocaleString("vi-VN")}đ
                                </span>
                              </>
                            ) : (
                              <span>{price.toLocaleString("vi-VN")}đ</span>
                            )}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                          >
                            {discount > 0 ? (
                              <>
                                <span
                                  style={{
                                    textDecoration: "line-through",
                                    color: "#888",
                                    marginRight: 4,
                                  }}
                                >
                                  {(price * item.quantity).toLocaleString(
                                    "vi-VN"
                                  )}
                                  đ
                                </span>
                                <span
                                  style={{ color: "#ed174a", fontWeight: 600 }}
                                >
                                  {(finalPrice * item.quantity).toLocaleString(
                                    "vi-VN"
                                  )}
                                  đ
                                </span>
                              </>
                            ) : (
                              <span>
                                {(price * item.quantity).toLocaleString(
                                  "vi-VN"
                                )}
                                đ
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDetailDialog(false)}
            sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog cập nhật trạng thái */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: isDarkMode ? "#0f1824" : "#fff",
            color: isDarkMode ? "#fff" : "#1a1a1a",
          },
        }}
      >
        <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
              Trạng thái
            </InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Trạng thái"
              sx={{
                color: isDarkMode ? "#fff" : "#1a1a1a",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.23)"
                    : "rgba(0, 0, 0, 0.23)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.5)"
                    : "rgba(0, 0, 0, 0.5)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDarkMode ? "#fff" : "#1a1a1a",
                },
              }}
            >
              <MenuItem value="PENDING">Chờ xác nhận</MenuItem>
              <MenuItem value="PROCESSING">Đang xử lý</MenuItem>
              <MenuItem value="SHIPPED">Đang giao hàng</MenuItem>
              <MenuItem value="DELIVERED">Đã giao hàng</MenuItem>
              <MenuItem value="CANCELLED">Đã hủy</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={3}
            margin="normal"
            label="Ghi chú"
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            sx={{
              "& .MuiInputLabel-root": {
                color: isDarkMode ? "#fff" : "#1a1a1a",
              },
              "& .MuiOutlinedInput-root": {
                color: isDarkMode ? "#fff" : "#1a1a1a",
                "& fieldset": {
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.23)"
                    : "rgba(0, 0, 0, 0.23)",
                },
                "&:hover fieldset": {
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.5)"
                    : "rgba(0, 0, 0, 0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: isDarkMode ? "#fff" : "#1a1a1a",
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenEditDialog(false)}
            sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            sx={{
              backgroundColor: "#0858f7",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#0646c6",
              },
            }}
          >
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Orders;
