import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import moment from "moment";
import { getData, deleteData } from "../../../utils/api";
import Pagination from "@mui/material/Pagination";
import "moment/locale/vi";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

moment.locale("vi");

const VoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const fetchVouchers = async () => {
    try {
      const response = await getData("/api/vouchers");
      setVouchers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách voucher:", error);
      toast.error("Không thể lấy danh sách voucher");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleDelete = async () => {
    try {
      await deleteData(`/api/vouchers/${selectedVoucher._id}`);
      toast.success("Xóa voucher thành công");
      setDeleteModal(false);
      fetchVouchers();
    } catch (error) {
      console.error("Lỗi khi xóa voucher:", error);
      toast.error(error.message || "Không thể xóa voucher");
    }
  };

  const formatDate = (date) => {
    return moment(date).format("DD/MM/YYYY HH:mm");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getDiscountText = (voucher) => {
    if (voucher.discountType === "PERCENTAGE") {
      return `${voucher.discountValue}% (Tối đa ${formatCurrency(
        voucher.maxDiscountAmount
      )})`;
    }
    return formatCurrency(voucher.discountValue);
  };

  // Filter + search + pagination
  const filteredVouchers = vouchers.filter((voucher) => {
    const matchesSearch =
      !search ||
      voucher.code.toLowerCase().includes(search.toLowerCase()) ||
      voucher.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && voucher.isActive) ||
      (statusFilter === "inactive" && !voucher.isActive);
    return matchesSearch && matchesStatus;
  });

  const indexOfLast = page * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentVouchers = filteredVouchers.slice(indexOfFirst, indexOfLast);
  const pageCount = Math.ceil(filteredVouchers.length / rowsPerPage);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="product-table-container">
      <div className="header">
        <h1>Danh sách sản phẩm</h1>
        <div className="breadcrumbs">
          <Link to="/" className="breadcrumb-link">
            Trang chủ
          </Link>
          <span className="separator">~</span>
          <Link to="/voucher" className="breadcrumb-link">
            Voucher
          </Link>
        </div>
      </div>
      <div className="table-header-section">
        <h3>Quản lý Voucher</h3>
        <div className="table-filters">
          <div className="filter-group">
            <label>HIỂN THỊ</label>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={10}>10 Hàng</option>
              <option value={20}>20 Hàng</option>
              <option value={50}>50 Hàng</option>
            </select>
          </div>
          <div className="filter-group">
            <label>TRẠNG THÁI</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã tắt</option>
            </select>
          </div>
          <div className="filter-group">
            <label>TÌM KIẾM</label>
            <input
              type="text"
              placeholder="Mã / Tên voucher"
              className="search-input"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>
      <div className="table-responsive">
        <table className="product-table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tên</th>
              <th>Loại giảm giá</th>
              <th>Giá trị giảm</th>
              <th>Đơn hàng tối thiểu</th>
              <th>Thời gian</th>
              <th>Số lần sử dụng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentVouchers.length > 0 ? (
              currentVouchers.map((voucher) => (
                <tr key={voucher._id}>
                  <td>{voucher.code}</td>
                  <td>{voucher.name}</td>
                  <td>
                    {voucher.discountType === "PERCENTAGE"
                      ? "Phần trăm"
                      : "Số tiền cố định"}
                  </td>
                  <td>{getDiscountText(voucher)}</td>
                  <td>{formatCurrency(voucher.minOrderValue)}</td>
                  <td>
                    {formatDate(voucher.startDate)} -{" "}
                    {formatDate(voucher.endDate)}
                  </td>
                  <td>
                    {voucher.usedCount}/{voucher.usageLimit}
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        color: voucher.isActive ? "#16a34a" : "#dc2626",
                        background: voucher.isActive ? "#bbf7d0" : "#fee2e2",
                        fontWeight: 600,
                        borderRadius: 8,
                        padding: "2px 12px",
                        display: "inline-block",
                      }}
                    >
                      {voucher.isActive ? "Đang hoạt động" : "Đã tắt"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() =>
                          navigate(`/voucher/voucher-edit/${voucher._id}`)
                        }
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => {
                          setSelectedVoucher(voucher);
                          setDeleteModal(true);
                        }}
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-products">
                  Không tìm thấy voucher nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <div className="showing-info">
          Hiển thị {filteredVouchers.length > 0 ? indexOfFirst + 1 : 0}-
          {Math.min(indexOfLast, filteredVouchers.length)} trên{" "}
          {filteredVouchers.length} kết quả
        </div>
        <div className="pagination">
          <Pagination
            count={pageCount}
            page={page}
            color="primary"
            onChange={(e, value) => setPage(value)}
          />
        </div>
      </div>
      {/* Modal xác nhận xóa */}
      <div>
        <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
          <ModalHeader toggle={() => setDeleteModal(false)}>
            Xác nhận xóa
          </ModalHeader>
          <ModalBody>
            Bạn có chắc chắn muốn xóa voucher {selectedVoucher?.code}?
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setDeleteModal(false)}>
              Hủy
            </Button>
            <Button color="danger" onClick={handleDelete}>
              Xóa
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

export default VoucherList;
