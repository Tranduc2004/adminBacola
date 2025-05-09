import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import moment from "moment";
import { getData, putData } from "../../../utils/api";
import { useTheme } from "../../../context/ThemeContext";
import { FaArrowLeft } from "react-icons/fa";
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Row,
  Col,
  Card,
  CardBody,
} from "reactstrap";
import "./styles.css";
const VoucherEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderValue: "",
    maxDiscountAmount: "",
    startDate: "",
    endDate: "",
    usageLimit: "1",
    applicableProducts: [],
    applicableCategories: [],
    isActive: true,
  });

  const fetchVoucher = useCallback(async () => {
    try {
      const response = await getData(`/api/vouchers/${id}`);
      const voucher = response.data;
      setFormData({
        ...voucher,
        name: voucher.name || "",
        description: voucher.description || "",
        discountType: voucher.discountType || "PERCENTAGE",
        discountValue: voucher.discountValue ?? "",
        minOrderValue: voucher.minOrderValue ?? "",
        maxDiscountAmount: voucher.maxDiscountAmount ?? "",
        startDate: voucher.startDate
          ? moment(voucher.startDate).format("YYYY-MM-DDTHH:mm")
          : "",
        endDate: voucher.endDate
          ? moment(voucher.endDate).format("YYYY-MM-DDTHH:mm")
          : "",
        usageLimit: voucher.usageLimit ?? "1",
        applicableProducts: Array.isArray(voucher.applicableProducts)
          ? voucher.applicableProducts.map((p) =>
              typeof p === "object" ? p._id : p
            )
          : [],
        applicableCategories: Array.isArray(voucher.applicableCategories)
          ? voucher.applicableCategories.map((c) =>
              typeof c === "object" ? c._id : c
            )
          : [],
        isActive:
          typeof voucher.isActive === "boolean" ? voucher.isActive : true,
      });
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin voucher:", error);
      toast.error("Không thể lấy thông tin voucher");
      navigate("/voucher/voucher-list");
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchVoucher();
    fetchProducts();
    fetchCategories();
  }, [id, fetchVoucher]);

  const fetchProducts = async () => {
    try {
      const response = await getData("/api/products");
      console.log("Products response:", response);
      if (Array.isArray(response)) {
        const formattedProducts = response.map((product) => ({
          value: product._id,
          label: product.name || "Sản phẩm không tên",
        }));
        setProducts(formattedProducts);
        console.log("Formatted products:", formattedProducts);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      toast.error("Không thể lấy danh sách sản phẩm");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getData("/api/categories");
      console.log("Categories response:", response);
      if (Array.isArray(response)) {
        const formattedCategories = response.map((category) => ({
          value: category._id,
          label: category.name || "Danh mục không tên",
        }));
        setCategories(formattedCategories);
        console.log("Formatted categories:", formattedCategories);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách danh mục:", error);
      toast.error("Không thể lấy danh sách danh mục");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (selectedOptions, { name }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOptions.map((option) => option.value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await putData(`/api/vouchers/${id}`, formData);
      toast.success("Cập nhật voucher thành công");
      navigate("/voucher/voucher-list");
    } catch (error) {
      console.error("Lỗi khi cập nhật voucher:", error);
      toast.error(error.message || "Không thể cập nhật voucher");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div
      className="voucher-edit-container"
      style={{
        backgroundColor: isDarkMode ? "#0f1824" : "#f5f5f5",
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        padding: "20px",
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
          Chỉnh sửa Voucher
        </h1>
        <div className="header">
          <div className="breadcrumbs">
            <Link to="/" className="breadcrumb-link">
              Trang chủ
            </Link>
            <span className="separator">~</span>
            <Link to="/voucher" className="breadcrumb-link">
              Voucher
            </Link>
            <span className="separator">~</span>
            <span>Chỉnh sửa voucher</span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="back-button-container">
        <button
          onClick={() => navigate("/voucher/voucher-list")}
          className="back-button"
          style={{
            color: isDarkMode ? "#fff" : "#1a1a1a",
            backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
          }}
        >
          <FaArrowLeft /> Quay lại danh sách
        </button>
      </div>

      <Card
        style={{
          backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
          border: "none",
          boxShadow: isDarkMode
            ? "0 2px 10px rgba(0, 0, 0, 0.2)"
            : "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label
                    for="code"
                    style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                  >
                    Mã voucher *
                  </Label>
                  <Input
                    type="text"
                    name="code"
                    id="code"
                    value={formData.code || ""}
                    onChange={handleChange}
                    required
                    disabled
                    style={{
                      backgroundColor: isDarkMode
                        ? "rgba(0, 0, 0, 0.2)"
                        : "#f5f5f5",
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                      border: "none",
                    }}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label
                    for="name"
                    style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                  >
                    Tên voucher *
                  </Label>
                  <Input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    required
                    style={{
                      backgroundColor: isDarkMode
                        ? "rgba(0, 0, 0, 0.2)"
                        : "#f5f5f5",
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                      border: "none",
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>

            <FormGroup>
              <Label
                for="description"
                style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
              >
                Mô tả
              </Label>
              <Input
                type="textarea"
                name="description"
                id="description"
                value={formData.description || ""}
                onChange={handleChange}
                style={{
                  backgroundColor: isDarkMode
                    ? "rgba(0, 0, 0, 0.2)"
                    : "#f5f5f5",
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                  border: "none",
                }}
              />
            </FormGroup>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label
                    for="discountType"
                    style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                  >
                    Loại giảm giá *
                  </Label>
                  <Input
                    type="select"
                    name="discountType"
                    id="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                    required
                    style={{
                      backgroundColor: isDarkMode
                        ? "rgba(0, 0, 0, 0.2)"
                        : "#f5f5f5",
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                      border: "none",
                    }}
                  >
                    <option value="PERCENTAGE">Phần trăm</option>
                    <option value="FIXED_AMOUNT">Số tiền cố định</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label
                    for="discountValue"
                    style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                  >
                    Giá trị giảm giá{" "}
                    {formData.discountType === "PERCENTAGE" ? "(%)" : "(VNĐ)"} *
                  </Label>
                  <Input
                    type="number"
                    name="discountValue"
                    id="discountValue"
                    value={
                      formData.discountValue === null
                        ? ""
                        : formData.discountValue
                    }
                    onChange={handleChange}
                    min="0"
                    required
                    style={{
                      backgroundColor: isDarkMode
                        ? "rgba(0, 0, 0, 0.2)"
                        : "#f5f5f5",
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                      border: "none",
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label
                    for="minOrderValue"
                    style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                  >
                    Đơn hàng tối thiểu (VNĐ)
                  </Label>
                  <Input
                    type="number"
                    name="minOrderValue"
                    id="minOrderValue"
                    value={
                      formData.minOrderValue === null
                        ? ""
                        : formData.minOrderValue
                    }
                    onChange={handleChange}
                    min="0"
                    style={{
                      backgroundColor: isDarkMode
                        ? "rgba(0, 0, 0, 0.2)"
                        : "#f5f5f5",
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                      border: "none",
                    }}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label
                    for="maxDiscountAmount"
                    style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                  >
                    Giảm giá tối đa (VNĐ)
                  </Label>
                  <Input
                    type="number"
                    name="maxDiscountAmount"
                    id="maxDiscountAmount"
                    value={
                      formData.maxDiscountAmount === null
                        ? ""
                        : formData.maxDiscountAmount
                    }
                    onChange={handleChange}
                    min="0"
                    disabled={formData.discountType === "FIXED_AMOUNT"}
                    style={{
                      backgroundColor: isDarkMode
                        ? "rgba(0, 0, 0, 0.2)"
                        : "#f5f5f5",
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                      border: "none",
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label
                    for="startDate"
                    style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                  >
                    Ngày bắt đầu *
                  </Label>
                  <Input
                    type="datetime-local"
                    name="startDate"
                    id="startDate"
                    value={formData.startDate || ""}
                    onChange={handleChange}
                    required
                    style={{
                      backgroundColor: isDarkMode
                        ? "rgba(0, 0, 0, 0.2)"
                        : "#f5f5f5",
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                      border: "none",
                    }}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label
                    for="endDate"
                    style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                  >
                    Ngày kết thúc *
                  </Label>
                  <Input
                    type="datetime-local"
                    name="endDate"
                    id="endDate"
                    value={formData.endDate || ""}
                    onChange={handleChange}
                    required
                    style={{
                      backgroundColor: isDarkMode
                        ? "rgba(0, 0, 0, 0.2)"
                        : "#f5f5f5",
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                      border: "none",
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label
                    for="usageLimit"
                    style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                  >
                    Số lần sử dụng tối đa *
                  </Label>
                  <Input
                    type="number"
                    name="usageLimit"
                    id="usageLimit"
                    value={
                      formData.usageLimit === null ? "" : formData.usageLimit
                    }
                    onChange={handleChange}
                    min="1"
                    required
                    style={{
                      backgroundColor: isDarkMode
                        ? "rgba(0, 0, 0, 0.2)"
                        : "#f5f5f5",
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                      border: "none",
                    }}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label
                    for="isActive"
                    style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                  >
                    Trạng thái
                  </Label>
                  <div>
                    <Input
                      type="checkbox"
                      name="isActive"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      style={{
                        marginRight: "10px",
                      }}
                    />{" "}
                    <Label
                      check
                      style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                    >
                      Đang hoạt động
                    </Label>
                  </div>
                </FormGroup>
              </Col>
            </Row>

            <FormGroup>
              <Label
                for="applicableProducts"
                style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
              >
                Sản phẩm áp dụng
              </Label>
              <Select
                isMulti
                name="applicableProducts"
                options={products}
                classNamePrefix="select"
                value={products.filter((p) =>
                  formData.applicableProducts.includes(p.value)
                )}
                onChange={(selected) =>
                  handleSelectChange(selected, { name: "applicableProducts" })
                }
                placeholder="Chọn sản phẩm..."
                noOptionsMessage={() => "Không có sản phẩm"}
                isClearable
                isSearchable
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: isDarkMode
                      ? "rgba(0, 0, 0, 0.2)"
                      : "#f5f5f5",
                    border: "none",
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: isDarkMode ? "#1a1a1a" : "#fff",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused
                      ? isDarkMode
                        ? "#2a2a2a"
                        : "#f0f0f0"
                      : isDarkMode
                      ? "#1a1a1a"
                      : "#fff",
                    color: isDarkMode ? "#fff" : "#1a1a1a",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: isDarkMode ? "#fff" : "#1a1a1a",
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: isDarkMode ? "#2a2a2a" : "#f0f0f0",
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: isDarkMode ? "#fff" : "#1a1a1a",
                  }),
                }}
              />
              {products.length === 0 && (
                <div
                  className="text-muted mt-1"
                  style={{ color: isDarkMode ? "#aaa" : "#666" }}
                >
                  Đang tải sản phẩm hoặc không có sản phẩm nào...
                </div>
              )}
            </FormGroup>

            <FormGroup>
              <Label
                for="applicableCategories"
                style={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
              >
                Danh mục áp dụng
              </Label>
              <Select
                isMulti
                name="applicableCategories"
                options={categories}
                classNamePrefix="select"
                value={categories.filter((c) =>
                  formData.applicableCategories.includes(c.value)
                )}
                onChange={(selected) =>
                  handleSelectChange(selected, { name: "applicableCategories" })
                }
                placeholder="Chọn danh mục..."
                noOptionsMessage={() => "Không có danh mục"}
                isClearable
                isSearchable
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: isDarkMode
                      ? "rgba(0, 0, 0, 0.2)"
                      : "#f5f5f5",
                    border: "none",
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: isDarkMode ? "#1a1a1a" : "#fff",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused
                      ? isDarkMode
                        ? "#2a2a2a"
                        : "#f0f0f0"
                      : isDarkMode
                      ? "#1a1a1a"
                      : "#fff",
                    color: isDarkMode ? "#fff" : "#1a1a1a",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: isDarkMode ? "#fff" : "#1a1a1a",
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: isDarkMode ? "#2a2a2a" : "#f0f0f0",
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: isDarkMode ? "#fff" : "#1a1a1a",
                  }),
                }}
              />
              {categories.length === 0 && (
                <div
                  className="text-muted mt-1"
                  style={{ color: isDarkMode ? "#aaa" : "#666" }}
                >
                  Đang tải danh mục hoặc không có danh mục nào...
                </div>
              )}
            </FormGroup>

            <div className="d-flex justify-content-end gap-2">
              <Button
                color="secondary"
                onClick={() => navigate("/voucher/voucher-list")}
                style={{
                  backgroundColor: isDarkMode
                    ? "rgba(0, 0, 0, 0.2)"
                    : "#f5f5f5",
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                  border: "none",
                }}
              >
                Hủy
              </Button>
              <Button
                color="primary"
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: "#0858f7",
                  color: "#fff",
                  border: "none",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Đang xử lý..." : "Cập nhật voucher"}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
};

export default VoucherEdit;
