import React, { useState, useEffect } from "react";
import { apiClient, checkToken } from "../../utils/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ContactInfo = () => {
  const navigate = useNavigate();
  // Initialize with empty strings to prevent null errors
  const [contactInfo, setContactInfo] = useState({
    address: "",
    location: "",
    phone: "",
    phoneNote: "",
    email: "",
    emailNote: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Kiểm tra token trước khi fetch data
    if (!checkToken()) {
      toast.error("Vui lòng đăng nhập để tiếp tục!");
      navigate("/login");
      return;
    }
    fetchContactInfo();
  }, [navigate]);

  const fetchContactInfo = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/api/about/contact-info");

      // Kiểm tra response và data
      if (response?.data) {
        const data = response.data;
        // Kiểm tra từng trường và gán giá trị mặc định nếu null/undefined
        setContactInfo({
          address: data.address || "",
          location: data.location || "",
          phone: data.phone || "",
          phoneNote: data.phoneNote || "",
          email: data.email || "",
          emailNote: data.emailNote || "",
        });
        setError(false);
      } else {
        // Nếu không có data, giữ nguyên giá trị mặc định
        console.log("Không có dữ liệu contact info, sử dụng giá trị mặc định");
        setError(false);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin liên hệ:", error);
      if (error.response?.status === 403) {
        toast.error("Bạn không có quyền truy cập trang này!");
        navigate("/login");
      } else {
        toast.error("Không thể lấy thông tin liên hệ!");
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra token trước khi submit
    if (!checkToken()) {
      toast.error("Vui lòng đăng nhập để tiếp tục!");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      await apiClient.put("/api/about/contact-info", contactInfo);
      toast.success("Cập nhật thông tin liên hệ thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      if (error.response?.status === 403) {
        toast.error("Bạn không có quyền cập nhật thông tin này!");
        navigate("/login");
      } else {
        toast.error("Có lỗi xảy ra khi cập nhật thông tin!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quản Lý Thông Tin Liên Hệ</h3>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-warning">
                  <p>Không thể kết nối đến API. Vui lòng kiểm tra:</p>
                  <ul>
                    <li>API có đang chạy trên cổng 4000 không?</li>
                    <li>
                      API endpoint "/api/about/contact-info" có tồn tại không?
                    </li>
                    <li>CORS đã được cấu hình đúng trên API server?</li>
                  </ul>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={fetchContactInfo}
                  >
                    Thử lại
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label>
                        Địa chỉ <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={contactInfo.address}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label>
                        Vị trí <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={contactInfo.location}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label>
                        Số điện thoại <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={contactInfo.phone}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label>
                        Ghi chú số điện thoại{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="phoneNote"
                        value={contactInfo.phoneNote}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label>
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={contactInfo.email}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label>
                        Ghi chú email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="emailNote"
                        value={contactInfo.emailNote}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? "Đang lưu..." : "Lưu Thay Đổi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
