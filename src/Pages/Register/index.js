import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

import {} from "react-icons/fa";
import { setAuthToken } from "../../utils/api";
import { toast } from "react-toastify";
import logo from "../../assets/images/logo.webp";

// Import apiClient từ file api.js
import { apiClient } from "../../utils/api";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFirstAdmin, setIsFirstAdmin] = useState(false);

  // This is the fixed useEffect in your Register.js component

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setLoading(true);

        // Kiểm tra token trước khi gọi API
        const token = localStorage.getItem("admin_token");
        if (!token) {
          console.log("Không tìm thấy token, chuyển hướng về trang đăng nhập");
          toast.error("Bạn cần đăng nhập để tạo admin mới!");
          navigate("/login");
          return;
        }

        // Thiết lập token trong header của apiClient
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        console.log(
          "Token đã được thiết lập trong header:",
          token.substring(0, 10) + "..."
        );

        // First, check if this is the first admin setup
        const firstAdminResponse = await apiClient.get(
          "/api/admin/check-first"
        );
        const firstAdminData = firstAdminResponse.data;
        setIsFirstAdmin(firstAdminData.isFirst);

        // Nếu không phải admin đầu tiên, kiểm tra quyền superadmin
        if (!firstAdminData.isFirst) {
          try {
            // Kiểm tra thông tin admin hiện tại
            const response = await apiClient.get("/api/admin/me");
            console.log("Thông tin admin:", response.data);

            // Kiểm tra xem có phải superadmin không
            if (response.data.role !== "superadmin") {
              toast.error("Bạn không có quyền tạo admin mới!");
              navigate("/dashboard");
              return;
            }

            console.log("Superadmin đã đăng nhập thành công");
          } catch (error) {
            console.error(
              "Lỗi kiểm tra quyền:",
              error.response?.data || error.message
            );

            // Only redirect on 401 errors
            if (error.response?.status === 401) {
              toast.error("Phiên làm việc đã hết hạn, vui lòng đăng nhập lại!");
              navigate("/login");
              return;
            }

            toast.error("Có lỗi xảy ra khi kiểm tra quyền!");
          }
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast.error("Có lỗi xảy ra khi kiểm tra trạng thái!");
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      agreeToTerms: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra mật khẩu khớp nhau
    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu không khớp!");
      return;
    }

    // Kiểm tra đồng ý với điều khoản
    if (!formData.agreeToTerms) {
      toast.error("Bạn phải đồng ý với điều khoản và điều kiện!");
      return;
    }

    try {
      setLoading(true);
      const registerData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
      };

      // Sử dụng apiClient thay vì registerAdmin
      const response = await apiClient.post(
        "/api/admin/register",
        registerData
      );

      if (isFirstAdmin) {
        // Nếu là admin đầu tiên, chuyển đến trang chính
        toast.success("Đăng ký Superadmin thành công!");
        // Lưu token nếu server trả về
        if (response.data.token) {
          setAuthToken(response.data.token);
        }
        navigate("/dashboard");
      } else {
        // Nếu tạo admin thông thường
        toast.success("Tạo tài khoản admin mới thành công!");
        resetForm(); // Reset form để có thể tạo admin khác
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message;
      if (errorMessage === "Username hoặc email đã được sử dụng") {
        toast.error("Tên đăng nhập hoặc email đã tồn tại!");
      } else {
        toast.error(errorMessage || "Có lỗi xảy ra khi đăng ký!");
      }
    } finally {
      setLoading(false);
    }
  };

  // Nếu đang kiểm tra trạng thái, hiển thị loading
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-left">
        <h1>
          BEST UX/UI FASHION
          <br />
          ECOMMERCE DASHBOARD
          <br />& ADMIN PANEL
        </h1>
        <p>
          Elit lusto dolore libero recusandae dolor dolores explicabo ullam cum
          facilis aperiam alias odio quam excepturi molestiae omnis inventore.
          Repudiandae officia placeat amet consectetur dicta dolorem quo
        </p>
        <Link to="/" className="btn btn-light">
          GO TO HOME
        </Link>
      </div>

      <div className="register-box">
        <div className="text-center mb-4">
          <img src={logo} alt="logo" className="register-logo mb-2" />
          <h4>Đăng ký tài khoản admin mới</h4>
          {isFirstAdmin ? (
            <div className="alert alert-info mt-3">
              Đây sẽ là tài khoản Superadmin đầu tiên của hệ thống
            </div>
          ) : (
            <div className="alert alert-info mt-3">
              Bạn đang tạo tài khoản admin mới
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <div className="input-group">
              <span className="input-icon">
                <FaUser />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập tên đăng nhập"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group mb-3">
            <div className="input-group">
              <span className="input-icon">
                <FaUser />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập họ tên đầy đủ"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group mb-3">
            <div className="input-group">
              <span className="input-icon">
                <FaEnvelope />
              </span>
              <input
                type="email"
                className="form-control"
                placeholder="Nhập email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group mb-3">
            <div className="input-group">
              <span className="input-icon">
                <FaLock />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Nhập mật khẩu"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-group mb-3">
            <div className="input-group">
              <span className="input-icon">
                <FaLock />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-control"
                placeholder="Xác nhận mật khẩu"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              required
            />
            <label className="form-check-label" htmlFor="agreeToTerms">
              Tôi đồng ý với tất cả các Điều khoản & Điều kiện
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loading}
          >
            {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
