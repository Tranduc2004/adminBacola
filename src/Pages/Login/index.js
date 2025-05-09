import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaUser } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import logo from "../../assets/images/logo.webp";
import { loginAdmin, setAuthToken } from "../../utils/api";
import { toast } from "react-toastify";
import { Box, Button } from "@mui/material";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Kiểm tra nếu đã đăng nhập thì chuyển hướng về dashboard
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await loginAdmin(formData);
      console.log("Login successful:", response);

      // Lưu thông tin admin vào localStorage
      setAuthToken(response.token);

      // Lưu thông tin admin đầy đủ
      localStorage.setItem("admin_info", JSON.stringify(response.admin));

      toast.success("Đăng nhập thành công!");

      // Chuyển hướng về trang trước đó hoặc dashboard
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Xử lý đăng nhập bằng Google
    toast.info("Tính năng đang được phát triển");
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="text-center mb-4">
          <img src={logo} alt="logo" className="login-logo mb-2" />
          <h4>Đăng nhập vào Hotash</h4>
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

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <Box sx={{ textAlign: "left", mb: 2 }}>
            <Button
              component={Link}
              to="/forgot-password"
              color="primary"
              size="small"
              sx={{ pl: 0 }}
            >
              Quên mật khẩu?
            </Button>
          </Box>

          <div className="divider">
            <span>hoặc</span>
          </div>
          <button
            type="button"
            className="btn btn-google w-100"
            onClick={handleGoogleLogin}
          >
            <FcGoogle className="google-icon" />
            Đăng nhập với Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
