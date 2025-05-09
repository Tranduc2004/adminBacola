import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { fetchDataFromApi, deleteData } from "../../utils/api";
import { Link } from "react-router-dom";
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

const BrandList = () => {
  const { isDarkMode } = useTheme();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    brandId: null,
  });

  // Pagination states
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await fetchDataFromApi("/api/brands");
      setBrands(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      setLoading(false);
    } catch (err) {
      setError("Không thể tải danh sách thương hiệu");
      setLoading(false);
      console.error("Lỗi khi tải thương hiệu:", err);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Get items for current page
  const getCurrentItems = () => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return brands.slice(startIndex, endIndex);
  };

  const handleDeleteClick = (id) => {
    setDeleteDialog({
      open: true,
      brandId: id,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteData(`/api/brands/${deleteDialog.brandId}`);
      toast.success("Xóa thương hiệu thành công");
      fetchBrands();
    } catch (err) {
      console.error("Lỗi khi xóa thương hiệu:", err);
      toast.error("Không thể xóa thương hiệu");
    } finally {
      setDeleteDialog({
        open: false,
        brandId: null,
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      brandId: null,
    });
  };

  // Calculate display numbers
  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, brands.length);

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
        <h1>Quản lý Thương hiệu</h1>
        <div className="breadcrumbs">
          <Link to="/" className="breadcrumb-link">
            Trang chủ
          </Link>
          <span className="separator">~</span>
          <Link to="/brands" className="breadcrumb-link">
            Thương hiệu
          </Link>
        </div>
      </div>

      <div className="category-table-container">
        <div className="table-header-section">
          <h3>Danh sách Thương hiệu</h3>
        </div>

        {error && (
          <div className="error-container">
            <p>{error}</p>
            <Button
              variant="outlined"
              onClick={fetchBrands}
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
                <th>UID</th>
                <th>Logo</th>
                <th>Tên thương hiệu</th>
                <th>Website</th>
                <th>Trạng thái</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentItems().length > 0 ? (
                getCurrentItems().map((brand, index) => (
                  <tr key={brand._id || index}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td>{brand._id}</td>
                    <td>
                      <div className="category-info">
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          style={{
                            maxWidth: "80px",
                            maxHeight: "50px",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    </td>
                    <td>{brand.name}</td>
                    <td>
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: isDarkMode ? "#90caf9" : "#1976d2",
                          textDecoration: "none",
                        }}
                      >
                        {brand.website}
                      </a>
                    </td>
                    <td>
                      <div
                        className={`status-badge ${
                          brand.isActive ? "active" : "inactive"
                        }`}
                      >
                        {brand.isActive ? "Hoạt động" : "Không hoạt động"}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          type="button"
                          onClick={() => {
                            window.location.href = `/brands/brand-edit/${brand._id}`;
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="delete-btn"
                          type="button"
                          onClick={() => handleDeleteClick(brand._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="no-data">
                    Không có dữ liệu thương hiệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="showing-info">
            {brands.length > 0
              ? `showing ${startItem} to ${endItem} of ${brands.length} results`
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
            Bạn có chắc chắn muốn xóa thương hiệu này? Hành động này không thể
            hoàn tác.
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
    </>
  );
};

export default BrandList;
