import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { fetchDataFromApi, deleteData } from "../../utils/api";
import { toast } from "react-toastify";
import "./styles.css";
import Pagination from "@mui/material/Pagination";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { useTheme } from "../../context/ThemeContext";
import EditSliderDialog from "./EditSliderDialog";

const SliderList = () => {
  const { isDarkMode } = useTheme();
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    sliderId: null,
  });
  const [editDialog, setEditDialog] = useState({
    open: false,
    sliderId: null,
  });

  // Pagination states
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const data = await fetchDataFromApi("/api/sliders");
      setSliders(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      setLoading(false);
    } catch (err) {
      setError("Không thể tải danh sách slider");
      setLoading(false);
      console.error("Lỗi khi tải slider:", err);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Get items for current page
  const getCurrentItems = () => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sliders.slice(startIndex, endIndex);
  };

  const handleEditClick = (id) => {
    setEditDialog({
      open: true,
      sliderId: id,
    });
  };

  const handleDeleteClick = (id) => {
    setDeleteDialog({
      open: true,
      sliderId: id,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteData(`/api/sliders/${deleteDialog.sliderId}`);
      toast.success("Xóa slider thành công");
      fetchSliders();
    } catch (err) {
      console.error("Lỗi khi xóa slider:", err);
      toast.error("Không thể xóa slider");
    } finally {
      setDeleteDialog({
        open: false,
        sliderId: null,
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      sliderId: null,
    });
  };

  const handleEditClose = () => {
    setEditDialog({
      open: false,
      sliderId: null,
    });
  };

  const handleEditSuccess = () => {
    fetchSliders();
  };

  // Calculate display numbers
  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, sliders.length);

  if (loading) {
    return (
      <div className="loading" style={{ color: isDarkMode ? "#fff" : "#000" }}>
        Đang tải...
      </div>
    );
  }

  return (
    <>
      <div className="header">
        <h1>Quản lý Slider</h1>
        <div className="breadcrumbs">
          <Link to="/" className="breadcrumb-link">
            Trang chủ
          </Link>
          <span className="separator">~</span>
          <Link to="/sliders" className="breadcrumb-link">
            Slider
          </Link>
        </div>
      </div>

      <div className="category-table-container">
        <div className="table-header-section">
          <h3>Danh sách Slider</h3>
        </div>

        {error && (
          <div className="error-container">
            <p>{error}</p>
            <Button
              variant="outlined"
              onClick={fetchSliders}
              sx={{
                color: isDarkMode ? "#ef9a9a" : "#c62828",
                borderColor: isDarkMode ? "#ef9a9a" : "#c62828",
                "&:hover": {
                  borderColor: isDarkMode ? "#ff8a80" : "#d32f2f",
                  backgroundColor: isDarkMode
                    ? "rgba(239, 154, 154, 0.08)"
                    : "rgba(211, 47, 47, 0.04)",
                },
              }}
            >
              Thử lại
            </Button>
          </div>
        )}

        <div className="table-responsive">
          <table className="category-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>
                <th>STT</th>
                <th>Ảnh</th>
                <th>Tên</th>
                <th>Mô tả</th>
                <th>Thứ tự</th>
                <th>Trạng thái</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentItems().length > 0 ? (
                getCurrentItems().map((slider, index) => (
                  <tr key={slider._id || index}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td>{(page - 1) * itemsPerPage + index + 1}</td>
                    <td>
                      <div className="category-info">
                        <img
                          src={slider.image}
                          alt={slider.name}
                          style={{
                            maxWidth: "80px",
                            maxHeight: "50px",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    </td>
                    <td>{slider.name}</td>
                    <td>{slider.description}</td>
                    <td>{slider.order}</td>
                    <td>
                      <div
                        className={`status-badge ${
                          slider.isActive ? "active" : "inactive"
                        }`}
                      >
                        {slider.isActive ? "Hoạt động" : "Ẩn"}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          type="button"
                          onClick={() => handleEditClick(slider._id)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="delete-btn"
                          type="button"
                          onClick={() => handleDeleteClick(slider._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="no-data">
                    Không có dữ liệu slider
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="showing-info">
            {sliders.length > 0
              ? `showing ${startItem} to ${endItem} of ${sliders.length} results`
              : "No results to display"}
          </div>
          <div className="pagination">
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </div>
        </div>
      </div>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            backgroundColor: isDarkMode ? "#1a2035" : "#fff",
          },
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{ color: isDarkMode ? "#fff" : "#000" }}
        >
          Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            sx={{ color: isDarkMode ? "#fff" : "#000" }}
          >
            Bạn có chắc chắn muốn xóa slider này? Hành động này không thể hoàn
            tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            sx={{ color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : undefined }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            sx={{
              color: isDarkMode ? "#f48fb1" : "#d32f2f",
            }}
            autoFocus
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chỉnh sửa */}
      <EditSliderDialog
        open={editDialog.open}
        onClose={handleEditClose}
        sliderId={editDialog.sliderId}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default SliderList;
