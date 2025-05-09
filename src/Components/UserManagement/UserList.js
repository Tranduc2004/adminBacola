import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TablePagination,
  TextField,
  Chip,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Menu,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  fetchUsersApi,
  exportUsersExcelApi,
  toggleUserStatusApi,
  deleteUserApi,
  updateUserApi,
} from "../../utils/api";
import { toast } from "react-toastify";
import { FaEye, FaUserEdit, FaUserCheck } from "react-icons/fa";
import { FaFileExcel } from "react-icons/fa";
import { IoBan, IoReload } from "react-icons/io5";
import { useTheme as useAppTheme } from "../../context/ThemeContext";

const UserList = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useAppTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalActive: 0,
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [editDialog, setEditDialog] = useState({
    open: false,
    user: null,
    formData: {
      name: "",
      email: "",
      phone: "",
      role: "user",
    },
  });

  // Thêm state để lưu giá trị tìm kiếm tạm thời
  const [searchInput, setSearchInput] = useState("");

  // Tạo hàm debounce search
  const debouncedSearch = useCallback((value) => {
    setSearch(value);
    setPage(0);
  }, []);

  // Xử lý khi người dùng nhập
  const handleSearchInput = (event) => {
    const value = event.target.value;
    setSearchInput(value);

    // Clear timeout cũ nếu có
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }

    // Set timeout mới
    window.searchTimeout = setTimeout(() => {
      debouncedSearch(value);
    }, 500); // Đợi 500ms sau khi người dùng ngừng nhập
  };

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (window.searchTimeout) {
        clearTimeout(window.searchTimeout);
      }
    };
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, search, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchUsersApi(
        page + 1,
        search,
        roleFilter,
        statusFilter
      );
      if (response && response.data) {
        setUsers(response.data);
        setTotalUsers(response.pagination?.total || 0);
        // Tính toán thống kê
        const totalAdmins = response.data.filter(
          (user) => user.role === "admin"
        ).length;
        const totalActive = response.data.filter(
          (user) => user.isActive
        ).length;
        setStats({
          totalUsers: response.pagination?.total || 0,
          totalAdmins,
          totalActive,
        });
      } else {
        setUsers([]);
        setTotalUsers(0);
        setStats({ totalUsers: 0, totalAdmins: 0, totalActive: 0 });
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách users:", error);
      toast.error("Không thể lấy danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;

    setConfirmDialog({
      open: true,
      title: selectedUser.isActive
        ? "Vô hiệu hóa người dùng"
        : "Kích hoạt người dùng",
      message: `Bạn có chắc chắn muốn ${
        selectedUser.isActive ? "vô hiệu hóa" : "kích hoạt"
      } người dùng ${selectedUser.name}?`,
      onConfirm: async () => {
        try {
          await toggleUserStatusApi(selectedUser._id);
          toast.success(
            `Đã ${
              selectedUser.isActive ? "vô hiệu hóa" : "kích hoạt"
            } người dùng thành công`
          );
          fetchUsers();
        } catch (error) {
          console.error("Lỗi khi thay đổi trạng thái:", error);
          toast.error("Không thể thay đổi trạng thái người dùng");
        }
        handleMenuClose();
      },
    });
  };

  const handleDeleteUser = (user) => {
    if (!user) return;
    setSelectedUser(user);
    if (user.isActive) {
      setConfirmDialog({
        open: true,
        title: "Vô hiệu hóa người dùng",
        message: `Bạn có chắc chắn muốn vô hiệu hóa người dùng ${user.name}? Người dùng sẽ không thể đăng nhập và sử dụng hệ thống nữa.`,
        onConfirm: async () => {
          try {
            await deleteUserApi(user._id);
            toast.success("Đã vô hiệu hóa người dùng thành công");
            fetchUsers();
          } catch (error) {
            console.error("Lỗi khi vô hiệu hóa người dùng:", error);
            toast.error("Không thể vô hiệu hóa người dùng");
          }
          handleMenuClose();
        },
      });
    } else {
      setConfirmDialog({
        open: true,
        title: "Mở lại tài khoản",
        message: `Bạn có chắc chắn muốn mở lại tài khoản cho người dùng ${user.name}? Người dùng sẽ có thể đăng nhập và sử dụng hệ thống bình thường.`,
        onConfirm: async () => {
          try {
            await toggleUserStatusApi(user._id);
            toast.success("Đã mở lại tài khoản thành công");
            fetchUsers();
          } catch (error) {
            console.error("Lỗi khi mở lại tài khoản:", error);
            toast.error("Không thể mở lại tài khoản");
          }
          handleMenuClose();
        },
      });
    }
  };

  const handleEditUser = (user) => {
    if (!user) return;
    setEditDialog({
      open: true,
      user: user,
      formData: {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "user",
      },
    });
    setSelectedUser(user);
  };

  const handleEditDialogClose = () => {
    setEditDialog({
      open: false,
      user: null,
      formData: {
        name: "",
        email: "",
        phone: "",
        role: "user",
      },
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditDialog((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: value,
      },
    }));
  };

  const handleEditSubmit = async () => {
    try {
      await updateUserApi(editDialog.user._id, editDialog.formData);
      toast.success("Cập nhật thông tin người dùng thành công");
      fetchUsers();
      handleEditDialogClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      toast.error(
        error.response?.data?.message ||
          "Không thể cập nhật thông tin người dùng"
      );
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await exportUsersExcelApi();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Xuất file Excel thành công");
    } catch (error) {
      console.error("Lỗi khi xuất Excel:", error);
      toast.error("Không thể xuất file Excel");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    setPage(0);
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setSearchInput("");
    // Không gọi fetchUsers ở đây, useEffect sẽ tự động gọi khi state thay đổi
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, color: "text.primary" }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  return (
    <div className="product-table-container">
      <div
        className="table-header-section"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3>Quản lý người dùng</h3>
        <div style={{ display: "flex", gap: 12 }}>
          <Button
            variant="outlined"
            color="success"
            startIcon={<FaFileExcel />}
            onClick={handleExportExcel}
            sx={{ minWidth: 120, fontWeight: 600 }}
          >
            Xuất Excel
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleRefresh}
            startIcon={<IoReload />}
            sx={{ minWidth: 100, fontWeight: 600 }}
          >
            Làm mới
          </Button>
        </div>
      </div>

      <div className="table-filters mb-2">
        <div className="filter-group">
          <label>HIỂN THỊ</label>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
          >
            <option value={5}>5 Hàng</option>
            <option value={10}>10 Hàng</option>
            <option value={25}>25 Hàng</option>
          </select>
        </div>

        <div className="filter-group">
          <label>VAI TRÒ</label>
          <select value={roleFilter} onChange={handleRoleFilterChange}>
            <option value="all">Tất cả vai trò</option>
            <option value="user">Người dùng</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </div>

        <div className="filter-group">
          <label>TRẠNG THÁI</label>
          <select value={statusFilter} onChange={handleStatusFilterChange}>
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Vô hiệu hóa</option>
          </select>
        </div>

        <div className="filter-group">
          <label>TÌM KIẾM</label>
          <input
            type="text"
            placeholder="Tên / Email / Số điện thoại"
            className="search-input"
            value={searchInput}
            onChange={handleSearchInput}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="product-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>TÊN</th>
              <th>EMAIL</th>
              <th>SỐ ĐIỆN THOẠI</th>
              <th>VAI TRÒ</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td>#{user._id.substring(0, 6)}</td>
                  <td>
                    <div className="product-info">
                      <div>
                        <div className="product-name">{user.name}</div>
                        <div className="product-description">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone || "Chưa cập nhật"}</td>
                  <td>
                    <Chip
                      label={
                        user.role === "admin" ? "Quản trị viên" : "Người dùng"
                      }
                      size="small"
                      sx={{
                        color: user.role === "admin" ? "#7c3aed" : "#2563eb",
                        backgroundColor:
                          user.role === "admin" ? "#ede9fe" : "#dbeafe",
                        fontWeight: 600,
                        borderRadius: "8px",
                        px: 2,
                      }}
                    />
                  </td>
                  <td>
                    <Chip
                      label={user.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                      size="small"
                      sx={{
                        color: user.isActive ? "#16a34a" : "#dc2626",
                        backgroundColor: user.isActive ? "#bbf7d0" : "#fee2e2",
                        fontWeight: 600,
                        borderRadius: "8px",
                        px: 2,
                      }}
                    />
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="view-btn"
                        onClick={() => navigate(`/users/${user._id}`)}
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => handleEditUser(user)}
                        title="Chỉnh sửa"
                      >
                        <FaUserEdit />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteUser(user)}
                        title={
                          user.isActive ? "Vô hiệu hóa" : "Mở lại tài khoản"
                        }
                        style={{
                          border: "none",
                          outline: "none",
                          background: user.isActive ? "#fee2e2" : "#d1fae5",
                          borderRadius: 8,
                          padding: 8,
                          cursor: "pointer",
                          marginLeft: 4,
                          marginRight: 4,
                          transition: "background 0.2s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.background = user.isActive
                            ? "#fecaca"
                            : "#6ee7b7")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.background = user.isActive
                            ? "#fee2e2"
                            : "#d1fae5")
                        }
                      >
                        {user.isActive ? (
                          <IoBan style={{ color: "#dc2626", fontSize: 20 }} />
                        ) : (
                          <FaUserCheck
                            style={{ color: "#16a34a", fontSize: 20 }}
                          />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-products">
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="showing-info">
          Hiển thị {users.length > 0 ? page * rowsPerPage + 1 : 0}-
          {Math.min((page + 1) * rowsPerPage, totalUsers)} trên {totalUsers} kết
          quả
        </div>
        <div className="pagination">
          <TablePagination
            component="div"
            count={totalUsers}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} trên ${count}`
            }
          />
        </div>
      </div>

      {/* Menu tùy chọn */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 180,
            backgroundColor: isDarkMode ? "#1a2035" : "#fff",
            color: isDarkMode ? "#fff" : "text.primary",
          },
        }}
      >
        <MenuItem onClick={() => handleEditUser(selectedUser)}>
          <FaUserEdit style={{ marginRight: 8 }} />
          Chỉnh sửa
        </MenuItem>
        {selectedUser?.isActive ? (
          <MenuItem onClick={handleToggleStatus}>
            <IoBan style={{ marginRight: 8 }} />
            Vô hiệu hóa
          </MenuItem>
        ) : (
          <MenuItem onClick={handleToggleStatus}>
            <FaUserCheck style={{ marginRight: 8 }} />
            Kích hoạt
          </MenuItem>
        )}
        <MenuItem
          onClick={() => handleDeleteUser(selectedUser)}
          sx={{ color: "error.main" }}
        >
          <IoBan style={{ marginRight: 8 }} />
          Vô hiệu hóa
        </MenuItem>
      </Menu>

      {/* Dialog xác nhận */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        PaperProps={{
          style: {
            backgroundColor: isDarkMode ? "#1a2035" : "#fff",
          },
        }}
      >
        <DialogTitle sx={{ color: isDarkMode ? "#fff" : "#000" }}>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: isDarkMode ? "#fff" : "#000" }}>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            sx={{ color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : undefined }}
          >
            Hủy
          </Button>
          <Button
            onClick={() => {
              confirmDialog.onConfirm();
              setConfirmDialog({ ...confirmDialog, open: false });
            }}
            color="primary"
            variant="contained"
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chỉnh sửa thông tin */}
      <Dialog
        open={editDialog.open}
        onClose={handleEditDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: isDarkMode ? "#1a2035" : "#fff",
          },
        }}
      >
        <DialogTitle sx={{ color: isDarkMode ? "#fff" : "#000" }}>
          Chỉnh sửa thông tin người dùng
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên"
                  name="name"
                  value={editDialog.formData.name}
                  onChange={handleEditFormChange}
                  size="small"
                  sx={{
                    "& .MuiInputBase-root": {
                      backgroundColor: isDarkMode ? "#2a3042" : "#fff",
                    },
                    "& .MuiInputBase-input": {
                      color: isDarkMode ? "#fff" : "text.primary",
                    },
                    "& .MuiInputLabel-root": {
                      color: isDarkMode ? "#fff" : "text.primary",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={editDialog.formData.email}
                  onChange={handleEditFormChange}
                  size="small"
                  type="email"
                  sx={{
                    "& .MuiInputBase-root": {
                      backgroundColor: isDarkMode ? "#2a3042" : "#fff",
                    },
                    "& .MuiInputBase-input": {
                      color: isDarkMode ? "#fff" : "text.primary",
                    },
                    "& .MuiInputLabel-root": {
                      color: isDarkMode ? "#fff" : "text.primary",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  name="phone"
                  value={editDialog.formData.phone}
                  onChange={handleEditFormChange}
                  size="small"
                  sx={{
                    "& .MuiInputBase-root": {
                      backgroundColor: isDarkMode ? "#2a3042" : "#fff",
                    },
                    "& .MuiInputBase-input": {
                      color: isDarkMode ? "#fff" : "text.primary",
                    },
                    "& .MuiInputLabel-root": {
                      color: isDarkMode ? "#fff" : "text.primary",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel
                    sx={{ color: isDarkMode ? "#fff" : "text.primary" }}
                  >
                    Vai trò
                  </InputLabel>
                  <Select
                    name="role"
                    value={editDialog.formData.role}
                    onChange={handleEditFormChange}
                    label="Vai trò"
                    sx={{
                      backgroundColor: isDarkMode ? "#2a3042" : "#fff",
                      color: isDarkMode ? "#fff" : "text.primary",
                      "& .MuiSelect-icon": {
                        color: isDarkMode ? "#fff" : "text.primary",
                      },
                    }}
                  >
                    <MenuItem value="user">Người dùng</MenuItem>
                    <MenuItem value="admin">Quản trị viên</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleEditDialogClose}
            sx={{ color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : undefined }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            color="primary"
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserList;
