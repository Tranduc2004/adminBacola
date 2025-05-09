import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postData } from "../../utils/api";
import { FaArrowLeft, FaUpload, FaLink } from "react-icons/fa";
import "./styles.css";
import { useTheme } from "../../context/ThemeContext";

const BrandAdd = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    description: "",
    website: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageSource, setImageSource] = useState("file"); // "file" hoặc "url"
  const [imageUrl, setImageUrl] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Tạo URL tạm thời để xem trước
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData({
          ...formData,
          logo: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Hàm chuyển đổi URL thành base64
  const urlToBase64 = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting URL to base64:", error);
      throw new Error("Không thể chuyển đổi URL thành base64");
    }
  };

  const handleImageUrlChange = async (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setPreviewImage(url);

    try {
      if (url) {
        const base64Data = await urlToBase64(url);
        setFormData({
          ...formData,
          logo: base64Data,
        });
      } else {
        setFormData({
          ...formData,
          logo: "",
        });
      }
    } catch (error) {
      setError(
        "Không thể tải hình ảnh từ URL này. Vui lòng kiểm tra lại URL hoặc thử URL khác."
      );
    }
  };

  const handleImageSourceChange = (source) => {
    setImageSource(source);
    setPreviewImage(null);
    setFormData({
      ...formData,
      logo: "",
    });
    setImageUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra dữ liệu
    if (!formData.name || !formData.logo) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Gửi dữ liệu lên server
      const response = await postData("/api/brands", formData);

      if (response) {
        // Chuyển hướng về trang danh sách thương hiệu
        navigate("/brands");
      }
    } catch (err) {
      setError("Không thể thêm thương hiệu. Vui lòng thử lại sau.");
      console.error("Lỗi khi thêm thương hiệu:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="brand-add-container"
      style={{
        backgroundColor: isDarkMode ? "#0f1824" : "#f5f5f5",
        minHeight: "100vh",
        width: "100%",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        className="header"
        style={{
          backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "20px",
          boxShadow: isDarkMode
            ? "0 2px 10px rgba(0, 0, 0, 0.2)"
            : "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1 style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
          Thêm thương hiệu mới
        </h1>
        <div className="breadcrumbs">
          <Link
            to="/"
            className="breadcrumb-link"
            style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
          >
            Trang chủ
          </Link>
          <span
            className="separator"
            style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
          >
            ~
          </span>
          <Link
            to="/brands"
            className="breadcrumb-link"
            style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
          >
            Thương hiệu
          </Link>
          <span
            className="separator"
            style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
          >
            ~
          </span>
          <span style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
            Thêm thương hiệu
          </span>
        </div>
      </div>

      {/* Back Button */}
      <div className="back-button-container">
        <Link
          to="/brands"
          className="back-button"
          style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
        >
          <FaArrowLeft /> Quay lại danh sách
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="error-message"
          style={{ color: isDarkMode ? "#ff4444" : "#d32f2f" }}
        >
          {error}
        </div>
      )}

      {/* Brand Form */}
      <div
        className="form-container"
        style={{
          backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: isDarkMode
            ? "0 2px 10px rgba(0, 0, 0, 0.2)"
            : "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <form onSubmit={handleSubmit} className="brand-form">
          <div className="form-group">
            <label
              htmlFor="name"
              style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
            >
              Tên thương hiệu *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên thương hiệu"
              required
              style={{
                backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                color: isDarkMode ? "#fff" : "#1a1a1a",
                border: "none",
                padding: "12px",
                borderRadius: "4px",
              }}
            />
          </div>

          <div className="form-group">
            <label
              htmlFor="logo"
              style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
            >
              Logo thương hiệu *
            </label>

            {/* Chọn nguồn ảnh */}
            <div className="image-source-selector">
              <button
                type="button"
                className={`source-button ${
                  imageSource === "file" ? "active" : ""
                }`}
                onClick={() => handleImageSourceChange("file")}
                style={{
                  backgroundColor: isDarkMode
                    ? "rgba(0, 0, 0, 0.2)"
                    : "#f5f5f5",
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  marginRight: "10px",
                }}
              >
                <FaUpload /> Tải lên file
              </button>
              <button
                type="button"
                className={`source-button ${
                  imageSource === "url" ? "active" : ""
                }`}
                onClick={() => handleImageSourceChange("url")}
                style={{
                  backgroundColor: isDarkMode
                    ? "rgba(0, 0, 0, 0.2)"
                    : "#f5f5f5",
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                }}
              >
                <FaLink /> Nhập URL
              </button>
            </div>

            {/* Form tải lên file */}
            {imageSource === "file" && (
              <div className="image-upload-container">
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="file-input"
                  style={{ display: "none" }}
                />
                <label
                  htmlFor="logo"
                  className="file-label"
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgba(0, 0, 0, 0.2)"
                      : "#f5f5f5",
                    color: isDarkMode ? "#fff" : "#1a1a1a",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "inline-block",
                  }}
                >
                  <FaUpload /> Chọn ảnh
                </label>
              </div>
            )}

            {/* Form nhập URL */}
            {imageSource === "url" && (
              <div className="image-url-container">
                <input
                  type="url"
                  id="logo-url"
                  name="logo-url"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/logo.png"
                  className="url-input"
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgba(0, 0, 0, 0.2)"
                      : "#f5f5f5",
                    color: isDarkMode ? "#fff" : "#1a1a1a",
                    border: "none",
                    padding: "12px",
                    borderRadius: "4px",
                    width: "100%",
                  }}
                />
              </div>
            )}

            {/* Xem trước ảnh */}
            {previewImage && (
              <div className="image-preview" style={{ marginTop: "20px" }}>
                <img
                  src={previewImage}
                  alt="Preview"
                  style={{ maxWidth: "200px", borderRadius: "4px" }}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label
              htmlFor="description"
              style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
            >
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả về thương hiệu"
              rows="4"
              style={{
                backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                color: isDarkMode ? "#fff" : "#1a1a1a",
                border: "none",
                padding: "12px",
                borderRadius: "4px",
                width: "100%",
              }}
            />
          </div>

          <div className="form-group">
            <label
              htmlFor="website"
              style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
            >
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              style={{
                backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                color: isDarkMode ? "#fff" : "#1a1a1a",
                border: "none",
                padding: "12px",
                borderRadius: "4px",
                width: "100%",
              }}
            />
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              style={{
                marginRight: "10px",
              }}
            />
            <label
              htmlFor="isActive"
              style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
            >
              Thương hiệu đang hoạt động
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/brands")}
              style={{
                backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                color: isDarkMode ? "#fff" : "#1a1a1a",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                marginRight: "10px",
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
              style={{
                backgroundColor: "#0858f7",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Đang xử lý..." : "Thêm thương hiệu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandAdd;
