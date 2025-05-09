import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Pagination from "@mui/material/Pagination";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { useTheme } from "../../context/ThemeContext";
import { getData, deleteData } from "../../utils/api";

const PostsList = () => {
  const { isDarkMode } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    postId: null,
  });

  // Pagination states
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getData("/api/posts");
      setPosts(response);
      setTotalPages(Math.ceil(response.length / itemsPerPage));
      setLoading(false);
    } catch (error) {
      setError("Không thể tải danh sách bài viết");
      setLoading(false);
      console.error("Lỗi khi tải danh sách bài viết:", error);
      toast.error("Lỗi khi tải danh sách bài viết");
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Get items for current page
  const getCurrentItems = () => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return posts.slice(startIndex, endIndex);
  };

  const handleDeleteClick = (id) => {
    setDeleteDialog({
      open: true,
      postId: id,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteData(`/api/posts/${deleteDialog.postId}`);
      toast.success("Xóa bài viết thành công");
      fetchPosts();
    } catch (error) {
      console.error("Lỗi khi xóa bài viết:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi xóa bài viết"
      );
    } finally {
      setDeleteDialog({ open: false, postId: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, postId: null });
  };

  // Calculate display numbers
  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, posts.length);

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
        <h1>Quản lý bài viết</h1>
        <div className="breadcrumbs">
          <Link to="/" className="breadcrumb-link">
            Trang chủ
          </Link>
          <span className="separator">~</span>
          <Link to="/posts" className="breadcrumb-link">
            Bài viết
          </Link>
        </div>
      </div>

      <div className="category-table-container">
        <div className="table-header-section">
          <h3>Danh sách bài viết</h3>
        </div>

        {error && (
          <div className="error-container">
            <p>{error}</p>
            <Button
              variant="outlined"
              onClick={fetchPosts}
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
                <th>ID</th>
                <th>Hình ảnh</th>
                <th>Tiêu đề</th>
                <th>Tags</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentItems().length > 0 ? (
                getCurrentItems().map((post, index) => (
                  <tr key={post._id || index}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td>{post._id}</td>
                    <td>
                      <div className="category-info">
                        {post.image && (
                          <img
                            src={post.image}
                            alt={post.title}
                            style={{
                              maxWidth: "80px",
                              maxHeight: "50px",
                              objectFit: "contain",
                            }}
                          />
                        )}
                      </div>
                    </td>
                    <td>{post.title}</td>
                    <td>{post.tags.join(", ")}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          type="button"
                          onClick={() => {
                            window.location.href = `/posts/post-edit/${post._id}`;
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="delete-btn"
                          type="button"
                          onClick={() => handleDeleteClick(post._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="no-data">
                    Không có dữ liệu bài viết
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="showing-info">
            {posts.length > 0
              ? `showing ${startItem} to ${endItem} of ${posts.length} results`
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
            Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn
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
    </>
  );
};

export default PostsList;
