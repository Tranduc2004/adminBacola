import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { postData } from "../../utils/api";
import { FaUpload } from "react-icons/fa";

const CategoryAdd = () => {
  const { isDarkMode } = useTheme();
  const [imageInputType, setImageInputType] = useState("url"); // 'url' or 'file'
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState({
    success: false,
    message: "",
  });

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

    // If this is the image URL field, update the preview
    if (event.target.name === "image" && imageInputType === "url") {
      setImagePreview(event.target.value);
    }
  };

  const handleImageTypeChange = (e) => {
    setImageInputType(e.target.value);
    // Clear image preview when switching between input types
    if (e.target.value === "file") {
      setFormData({
        ...formData,
        image: "", // Clear the URL when switching to file upload
      });
    } else {
      setImageFile(null); // Clear the file when switching to URL
      setImagePreview(formData.image); // Set preview to the current URL
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      // Cập nhật formData.image với tên file
      setFormData((prev) => ({
        ...prev,
        image: file.name,
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

  const addCategory = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitResult({ success: false, message: "" });

    try {
      let categoryData = { ...formData };

      // Validate form data
      if (!categoryData.name) {
        throw new Error("Vui lòng nhập tên danh mục");
      }
      if (!categoryData.color) {
        throw new Error("Vui lòng chọn màu cho danh mục");
      }
      if (!categoryData.image) {
        throw new Error("Vui lòng thêm ảnh cho danh mục");
      }

      // Đảm bảo màu được gửi đúng định dạng
      if (!categoryData.color.startsWith("#")) {
        categoryData.color = "#" + categoryData.color;
      }

      // Validate màu hex
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexColorRegex.test(categoryData.color)) {
        throw new Error(
          "Màu không hợp lệ. Vui lòng nhập mã màu hex (ví dụ: #FF0000)"
        );
      }

      // If image input type is file and a file is selected
      if (imageInputType === "file" && imageFile) {
        const base64Image = await fileToBase64(imageFile);
        categoryData.image = base64Image;
      }

      console.log("Dữ liệu gửi đi:", categoryData); // Log dữ liệu trước khi gửi

      // Send data to the server
      const response = await postData("/api/categories/", categoryData);
      console.log("Phản hồi từ server:", response); // Log phản hồi từ server

      // Reset form on success
      setFormData({
        name: "",
        image: "",
        color: "",
      });
      setImageFile(null);
      setImagePreview("");

      setSubmitResult({
        success: true,
        message: "Thêm danh mục thành công!",
      });
    } catch (error) {
      console.error("Lỗi khi thêm danh mục:", error);
      setSubmitResult({
        success: false,
        message: error.message || "Có lỗi xảy ra khi thêm danh mục",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: isDarkMode ? "#0f1824" : "#f5f5f5",
        minHeight: "100vh",
        width: "100%",
        position: "relative",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
          border: "none",
          p: 4,
          minHeight: "calc(100vh - 24px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="header">
          <h1>Category Add</h1>
          <div className="breadcrumbs">
            <Link to="/" className="breadcrumb-link">
              Home
            </Link>
            <span className="separator">~</span>
            <Link to="/category" className="breadcrumb-link">
              Category
            </Link>
            <span className="separator">~</span>
            <span>Category Add</span>
          </div>
        </div>
        <Stack spacing={4}>
          {/* Basic Information Section */}
          <Box sx={{ minHeight: "calc(100vh - 400px)" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                  fontWeight: 500,
                }}
              >
                Thêm danh mục
              </Typography>
              <Button
                sx={{
                  minWidth: 40,
                  height: 40,
                  borderRadius: 1,
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                  "&:hover": {
                    bgcolor: isDarkMode
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.05)",
                  },
                }}
              >
                •••
              </Button>
            </Box>

            <TextField
              fullWidth
              label="Tên danh mục"
              name="name"
              value={formData.name}
              onChange={changeInput}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                  height: "56px",
                  "& fieldset": {
                    border: "none",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.6)",
                },
                "& .MuiInputBase-input": {
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                },
              }}
            />

            {/* Image selection method */}
            <FormControl component="fieldset" sx={{ mb: 2, width: "100%" }}>
              <FormLabel
                component="legend"
                sx={{
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.6)",
                  mb: 1,
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
                    <Radio sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }} />
                  }
                  label="URL"
                  sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                />
                <FormControlLabel
                  value="file"
                  control={
                    <Radio sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }} />
                  }
                  label="Upload File"
                  sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                />
              </RadioGroup>
            </FormControl>

            {/* Conditional rendering based on image input type */}
            {imageInputType === "url" ? (
              <TextField
                fullWidth
                label="URL ảnh"
                name="image"
                value={formData.image}
                onChange={changeInput}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                    height: "56px",
                    "& fieldset": {
                      border: "none",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.6)",
                  },
                  "& .MuiInputBase-input": {
                    color: isDarkMode ? "#fff" : "#1a1a1a",
                  },
                }}
              />
            ) : (
              <Box sx={{ mb: 3 }}>
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
                      bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                      border: "none",
                      p: 2,
                      "&:hover": {
                        bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.3)" : "#e0e0e0",
                        border: "none",
                      },
                    }}
                  >
                    Chọn File Ảnh
                  </Button>
                </label>
                {imageFile && (
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                    }}
                  >
                    File đã chọn: {imageFile.name}
                  </Typography>
                )}
              </Box>
            )}

            {/* Image preview */}
            {imagePreview && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  border: "1px solid",
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.1)"
                    : "#e0e0e0",
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    color: isDarkMode ? "#fff" : "#1a1a1a",
                  }}
                >
                  Xem trước ảnh:
                </Typography>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    objectFit: "contain",
                  }}
                />
              </Box>
            )}

            <TextField
              fullWidth
              label="Mã màu"
              name="color"
              value={formData.color}
              onChange={changeInput}
              placeholder="Ví dụ: #FF0000"
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                  height: "56px",
                  "& fieldset": {
                    border: "none",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.6)",
                },
                "& .MuiInputBase-input": {
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                },
              }}
            />

            {/* Color preview */}
            {formData.color && (
              <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "4px",
                    bgcolor: formData.color,
                    mr: 2,
                    border: "1px solid",
                    borderColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.1)"
                      : "#e0e0e0",
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                >
                  Xem trước màu: {formData.color}
                </Typography>
              </Box>
            )}

            {/* Form submission results */}
            {submitResult.message && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  bgcolor: submitResult.success
                    ? "rgba(76, 175, 80, 0.1)"
                    : "rgba(244, 67, 54, 0.1)",
                  borderRadius: 1,
                  color: submitResult.success ? "#4caf50" : "#f44336",
                }}
              >
                {submitResult.message}
              </Box>
            )}

            <Button
              variant="contained"
              disabled={isSubmitting}
              sx={{
                px: 4,
                py: 1.5,
                bgcolor: "#0858f7",
                color: "#fff",
                "&:hover": {
                  bgcolor: "#0646c6",
                },
                "&:disabled": {
                  bgcolor: isDarkMode
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.12)",
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(0, 0, 0, 0.26)",
                },
                borderRadius: 1,
                textTransform: "uppercase",
                fontWeight: 500,
              }}
              onClick={addCategory}
            >
              {isSubmitting ? "Đang xử lý..." : "Thêm danh mục"}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default CategoryAdd;
