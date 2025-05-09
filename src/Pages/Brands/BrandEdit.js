import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchDataFromApi, editData } from "../../utils/api";
import { FaArrowLeft, FaUpload, FaLink } from "react-icons/fa";
import "./styles.css";
import { useTheme } from "../../context/ThemeContext";

const BrandEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    description: "",
    website: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageSource, setImageSource] = useState("file"); // "file" hoặc "url"
  const [imageUrl, setImageUrl] = useState("");

  const fetchBrandData = useCallback(async () => {
    try {
      const response = await fetchDataFromApi(`/api/brands/${id}`);
      setFormData({
        name: response.name || "",
        logo: response.logo || "",
        description: response.description || "",
        website: response.website || "",
        isActive: response.isActive !== undefined ? response.isActive : true,
      });
      setPreviewImage(response.logo || null);
      setImageUrl(response.logo || "");
      // Xác định nguồn ảnh dựa trên URL
      if (
        response.logo &&
        (response.logo.startsWith("http://") ||
          response.logo.startsWith("https://"))
      ) {
        setImageSource("url");
      } else {
        setImageSource("file");
      }
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin thương hiệu:", error);
      toast.error("Không thể lấy thông tin thương hiệu");
      navigate("/brands");
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchBrandData();
  }, [fetchBrandData]);

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

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setPreviewImage(url);
    setFormData({
      ...formData,
      logo: url,
    });
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

    if (!formData.name || !formData.logo) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await editData(`/api/brands/${id}`, formData);

      if (response) {
        toast.success("Cập nhật thương hiệu thành công!");
        navigate("/brands");
      }
    } catch (err) {
      const errorMessage =
        "Không thể cập nhật thương hiệu. Vui lòng thử lại sau.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Lỗi khi cập nhật thương hiệu:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="loading-container"
        style={{
          bgcolor: isDarkMode ? "#0f1824" : "#f5f5f5",
          minHeight: "100vh",
          width: "100%",
          position: "relative",
        }}
      >
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div
      className="brand-edit-container"
      style={{
        bgcolor: isDarkMode ? "#0f1824" : "#f5f5f5",
        minHeight: "100vh",
        width: "100%",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        className="header"
        style={{
          bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "20px",
          boxShadow: isDarkMode
            ? "0 2px 10px rgba(0, 0, 0, 0.2)"
            : "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1>Chỉnh sửa thương hiệu</h1>
        <div className="breadcrumbs">
          <Link to="/" className="breadcrumb-link">
            Trang chủ
          </Link>
          <span className="separator">~</span>
          <Link to="/brands" className="breadcrumb-link">
            Thương hiệu
          </Link>
          <span className="separator">~</span>
          <span>Chỉnh sửa thương hiệu</span>
        </div>
      </div>

      {/* Back Button */}
      <div className="back-button-container">
        <Link to="/brands" className="back-button">
          <FaArrowLeft /> Quay lại danh sách
        </Link>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Brand Form */}
      <div
        className="form-container"
        style={{
          bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
        }}
      >
        <form onSubmit={handleSubmit} className="brand-form">
          <div className="form-group">
            <label htmlFor="name">Tên thương hiệu *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên thương hiệu"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="logo">Logo thương hiệu *</label>

            {/* Chọn nguồn ảnh */}
            <div className="image-source-selector">
              <button
                type="button"
                className={`source-button ${
                  imageSource === "file" ? "active" : ""
                }`}
                onClick={() => handleImageSourceChange("file")}
              >
                <FaUpload /> Tải lên file
              </button>
              <button
                type="button"
                className={`source-button ${
                  imageSource === "url" ? "active" : ""
                }`}
                onClick={() => handleImageSourceChange("url")}
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
                />
                <label htmlFor="logo" className="file-label">
                  <FaUpload /> Chọn ảnh mới
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
                />
              </div>
            )}

            {/* Xem trước ảnh */}
            {previewImage && (
              <div className="image-preview">
                <img src={previewImage} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả về thương hiệu"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="website">Website</label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <label htmlFor="isActive">Thương hiệu đang hoạt động</label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/brands")}
            >
              Hủy
            </button>
            <button type="submit" className="submit-button" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandEdit;
