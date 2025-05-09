import React from "react";
import { FaEdit, FaTrash, FaUpload } from "react-icons/fa";
import "./styles.css";
import Pagination from "@mui/material/Pagination";
import { fetchDataFromApi, deleteData } from "../../utils/api";
import { editData } from "../../utils/api";
import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "react-toastify";

const CategoryList = () => {
  const { isDarkMode } = useTheme();
  const [open, setOpen] = useState(false);
  const [catData, setCatData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [imageInputType, setImageInputType] = useState("url");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: null,
  });

  // Phân trang
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    color: "",
  });

  const changeInput = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    fetchDataFromApi("/api/categories")
      .then((res) => {
        const data = Array.isArray(res) ? res : [];
        setCatData(data);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
        console.log("Loaded categories:", res);
      })
      .catch((err) => {
        console.error("Error loading categories:", err);
      });
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Lấy các mục cho trang hiện tại
  const getCurrentItems = () => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return catData.slice(startIndex, endIndex);
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setFormData({
      name: "",
      image: "",
      color: "",
    });
    setImageFile(null);
    setImagePreview("");
    setImageInputType("url");
  };

  const editCategory = (id) => {
    setOpen(true);
    setEditId(id);
    fetchDataFromApi(`/api/categories/${id}`)
      .then((res) => {
        if (res) {
          console.log("Category data loaded:", res);
          // Cập nhật form data
          setFormData({
            name: res.name || "",
            image: res.image || "",
            color: res.color || "",
          });

          // Cập nhật preview ảnh
          setImagePreview(res.image || "");

          // Xác định loại input ảnh dựa vào URL
          if (
            res.image &&
            (res.image.startsWith("http://") ||
              res.image.startsWith("https://"))
          ) {
            setImageInputType("url");
          } else {
            setImageInputType("file");
          }

          // Reset file input
          setImageFile(null);
        }
      })
      .catch((err) => {
        console.error("Error fetching category:", err);
        alert("Không thể tải thông tin danh mục");
      });
  };

  const handleImageTypeChange = (e) => {
    const newType = e.target.value;
    setImageInputType(newType);

    // Khi chuyển đổi giữa các chế độ, giữ lại dữ liệu phù hợp
    if (newType === "url") {
      // Nếu chuyển sang URL, giữ lại URL cũ nếu có
      setFormData((prev) => ({
        ...prev,
        image: imagePreview || prev.image,
      }));
    } else {
      // Nếu chuyển sang file, xóa URL
      setImageFile(null);
      setFormData((prev) => ({
        ...prev,
        image: "",
      }));
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({
      ...prev,
      image: url,
    }));
    setImagePreview(url);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Tạo URL xem trước
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setFormData((prev) => ({
        ...prev,
        image: previewUrl,
      }));
    }
  };

  // Convert image file to base64 for Cloudinary upload
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form with data:", formData);
    console.log("Editing category ID:", editId);

    if (!editId) {
      console.error("Missing editId");
      return;
    }

    if (!formData.name) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      let updatedData = { ...formData };

      if (imageInputType === "file" && imageFile) {
        const base64Image = await fileToBase64(imageFile);
        updatedData.image = base64Image;
      }

      const response = await editData(`/api/categories/${editId}`, updatedData);
      console.log("Update response:", response);

      if (response) {
        toast.success("Cập nhật danh mục thành công!");
        loadCategories();
        handleClose();
      }
    } catch (error) {
      console.error(
        "Error updating category:",
        error.response?.data || error.message
      );
      toast.error("Không thể cập nhật danh mục. Vui lòng thử lại.");
    }
  };

  const handleDelete = (id) => {
    setDeleteDialog({
      open: true,
      id: id,
    });
  };

  const handleDeleteConfirm = () => {
    deleteData(`/api/categories/${deleteDialog.id}`)
      .then((res) => {
        console.log("Kết quả xoá:", res);
        if (res.success) {
          toast.success("Xóa danh mục thành công!");
          loadCategories();
        } else {
          toast.error("Xóa thất bại");
        }
      })
      .catch((err) => {
        console.error("Lỗi khi xoá:", err);
        toast.error("Đã xảy ra lỗi khi xóa");
      })
      .finally(() => {
        setDeleteDialog({ open: false, id: null });
      });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, id: null });
  };

  // Tính toán số hiển thị
  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, catData.length);

  return (
    <>
      <div className="header">
        <h1>Category List</h1>
        <div className="breadcrumbs">
          <Link to="/" className="breadcrumb-link">
            Home
          </Link>
          <span className="separator">~</span>
          <Link to="/category" className="breadcrumb-link">
            Category
          </Link>
          <span className="separator">~</span>
          <span>Category List</span>
        </div>
      </div>
      <div className="category-table-container">
        <div className="table-header-section">
          <h3>Category List</h3>
        </div>

        <div className="table-responsive">
          <table className="category-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>
                <th>UID</th>
                <th>Ảnh</th>
                <th>Tên Danh Mục</th>
                <th>Color</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentItems().map((item, index) => {
                return (
                  <tr key={item._id || index}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td>{item._id}</td>
                    <td>
                      <div className="category-info">
                        <img src={item.image} alt="Ảnh Danh Mục" />
                        <div>
                          <div className="category-name"></div>
                          <div className="category-color"></div>
                        </div>
                      </div>
                    </td>
                    <td>{item.name}</td>
                    <td>
                      <div
                        className="color-display mr-2"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      {item.color}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => editCategory(item._id)}
                          type="button"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="delete-btn"
                          type="button"
                          onClick={() => handleDelete(item._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="showing-info">
            {catData.length > 0
              ? `showing ${startItem} to ${endItem} of ${catData.length} results`
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

      <Dialog
        className="editModal"
        open={open}
        onClose={handleClose}
        maxWidth="md"
        PaperProps={{
          style: {
            backgroundColor: isDarkMode ? "#1a2035" : "#fff",
          },
        }}
      >
        <DialogTitle sx={{ color: isDarkMode ? "#fff" : "#000" }}>
          Chỉnh sửa
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <DialogContentText sx={{ color: isDarkMode ? "#fff" : "#000" }}>
              Chỉnh sửa danh mục sản phẩm
            </DialogContentText>
            <TextField
              autoFocus
              required
              margin="dense"
              id="name"
              name="name"
              label="Category Name"
              type="text"
              value={formData.name}
              fullWidth
              onChange={changeInput}
              sx={{
                "& .MuiInputLabel-root": {
                  color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : undefined,
                },
                "& .MuiInputBase-input": {
                  color: isDarkMode ? "#fff" : undefined,
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.23)"
                      : undefined,
                  },
                  "&:hover fieldset": {
                    borderColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.23)"
                      : undefined,
                  },
                },
              }}
            />

            {/* Image upload options */}
            <FormControl component="fieldset" className="mt-3 mb-2">
              <FormLabel
                component="legend"
                sx={{
                  color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : undefined,
                }}
              >
                Phương thức chọn ảnh
              </FormLabel>
              <RadioGroup
                row
                name="imageInputType"
                value={imageInputType}
                onChange={handleImageTypeChange}
              >
                <FormControlLabel
                  value="url"
                  control={
                    <Radio
                      sx={{
                        color: isDarkMode
                          ? "rgba(255, 255, 255, 0.7)"
                          : undefined,
                        "&.Mui-checked": {
                          color: isDarkMode ? "#90caf9" : undefined,
                        },
                      }}
                    />
                  }
                  label="URL"
                  sx={{ color: isDarkMode ? "#fff" : undefined }}
                />
                <FormControlLabel
                  value="file"
                  control={
                    <Radio
                      sx={{
                        color: isDarkMode
                          ? "rgba(255, 255, 255, 0.7)"
                          : undefined,
                        "&.Mui-checked": {
                          color: isDarkMode ? "#90caf9" : undefined,
                        },
                      }}
                    />
                  }
                  label="Upload File"
                  sx={{ color: isDarkMode ? "#fff" : undefined }}
                />
              </RadioGroup>
            </FormControl>

            {/* Show different input based on selection */}
            {imageInputType === "url" ? (
              <TextField
                required={imageInputType === "url"}
                margin="dense"
                id="image"
                name="image"
                label="Category Image URL"
                type="text"
                value={formData.image}
                fullWidth
                onChange={handleUrlChange}
                sx={{
                  "& .MuiInputLabel-root": {
                    color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : undefined,
                  },
                  "& .MuiInputBase-input": {
                    color: isDarkMode ? "#fff" : undefined,
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: isDarkMode
                        ? "rgba(255, 255, 255, 0.23)"
                        : undefined,
                    },
                    "&:hover fieldset": {
                      borderColor: isDarkMode
                        ? "rgba(255, 255, 255, 0.23)"
                        : undefined,
                    },
                  },
                }}
              />
            ) : (
              <div className="file-upload-container mt-2 mb-2">
                <input
                  type="file"
                  id="imageFile"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <label htmlFor="imageFile">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<FaUpload />}
                    sx={{
                      color: isDarkMode ? "#fff" : undefined,
                      borderColor: isDarkMode
                        ? "rgba(255, 255, 255, 0.23)"
                        : undefined,
                      "&:hover": {
                        borderColor: isDarkMode
                          ? "rgba(255, 255, 255, 0.23)"
                          : undefined,
                        backgroundColor: isDarkMode
                          ? "rgba(255, 255, 255, 0.08)"
                          : undefined,
                      },
                    }}
                  >
                    Chọn File Ảnh
                  </Button>
                </label>
                {imageFile && (
                  <span
                    className="ml-2"
                    style={{ color: isDarkMode ? "#fff" : undefined }}
                  >
                    {imageFile.name}
                  </span>
                )}
              </div>
            )}

            {/* Image preview */}
            {imagePreview && (
              <div className="image-preview mt-2 mb-2">
                <p style={{ color: isDarkMode ? "#fff" : undefined }}>
                  Xem trước:
                </p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: "200px" }}
                />
              </div>
            )}

            <TextField
              required
              margin="dense"
              id="color"
              name="color"
              label="Category Color"
              type="text"
              value={formData.color}
              fullWidth
              onChange={changeInput}
              sx={{
                "& .MuiInputLabel-root": {
                  color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : undefined,
                },
                "& .MuiInputBase-input": {
                  color: isDarkMode ? "#fff" : undefined,
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.23)"
                      : undefined,
                  },
                  "&:hover fieldset": {
                    borderColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.23)"
                      : undefined,
                  },
                },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleClose}
              variant="outlined"
              type="button"
              sx={{
                color: isDarkMode ? "#fff" : undefined,
                borderColor: isDarkMode
                  ? "rgba(255, 255, 255, 0.23)"
                  : undefined,
                "&:hover": {
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.23)"
                    : undefined,
                  backgroundColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.08)"
                    : undefined,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="outlined"
              sx={{
                color: isDarkMode ? "#90caf9" : undefined,
                borderColor: isDarkMode ? "#90caf9" : undefined,
                "&:hover": {
                  borderColor: isDarkMode ? "#90caf9" : undefined,
                  backgroundColor: isDarkMode
                    ? "rgba(144, 202, 249, 0.08)"
                    : undefined,
                },
              }}
            >
              Lưu
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
            Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn
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

export default CategoryList;
