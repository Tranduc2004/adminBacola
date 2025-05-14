import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TbLayoutDashboard } from "react-icons/tb";
import { FaRegUser } from "react-icons/fa";
import { BiPackage } from "react-icons/bi";
import { RiBillLine } from "react-icons/ri";
import { BsCart3, BsChevronDown } from "react-icons/bs";
import { BiSolidCategory } from "react-icons/bi";
import { logoutAdmin } from "../../utils/api";
import { useSidebar } from "../../context/SidebarContext";
import { IoBag } from "react-icons/io5";
import { MdBrandingWatermark } from "react-icons/md";
import { getNewOrdersCount } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { IoChatboxEllipses } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";

const MenuItem = ({
  icon: Icon,
  text,
  badge,
  children,
  isDropdown,
  onClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (isDropdown) {
    return (
      <div className="menu-dropdown">
        <div className="menu-item">
          <div
            className="d-flex align-items-center justify-content-between py-2 px-3"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="d-flex align-items-center">
              <Icon className="menu-icon" />
              <span className="ml-3">{text}</span>
            </div>
            <BsChevronDown
              className={`menu-dropdown-icon ${isOpen ? "open" : ""}`}
            />
          </div>
        </div>
        {isOpen && <div className="submenu">{children}</div>}
      </div>
    );
  }

  return (
    <Link to={`/${text.toLowerCase()}`} className="menu-item" onClick={onClick}>
      <div className="d-flex align-items-center justify-content-between py-2 px-3">
        <div className="d-flex align-items-center">
          <Icon className="menu-icon" />
          <span className="ml-3">{text}</span>
        </div>
        {badge && (
          <span className={`badge badge-${badge.type}`}>{badge.text}</span>
        )}
      </div>
    </Link>
  );
};

const SubMenuItem = ({ text, prefix }) => (
  <Link
    to={`/${prefix}/${text.toLowerCase().replace(/\s+/g, "-")}`}
    className="submenu-item"
  >
    <span>{text}</span>
  </Link>
);

const MenuSection = ({ title, children }) => (
  <div className="menu-section mb-4">
    <h6 className="menu-title px-3 mb-3">{title}</h6>
    <div className="menu-items">{children}</div>
  </div>
);

const Sidebar = () => {
  const { isSidebarOpen } = useSidebar();
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const fetchNewOrdersCount = async () => {
    try {
      const response = await getNewOrdersCount();
      setNewOrdersCount(response.count);
    } catch (error) {
      console.error("Error fetching new orders count:", error);
    }
  };

  useEffect(() => {
    fetchNewOrdersCount();
    // Cập nhật mỗi 5 phút
    const interval = setInterval(fetchNewOrdersCount, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleOrdersClick = () => {
    setNewOrdersCount(0); // Reset số đơn hàng mới khi click vào menu Orders
  };
  const handleLogout = async () => {
    try {
      // Xóa token và thông tin admin từ localStorage
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_info");

      // Gọi API logout
      await logoutAdmin();

      handleClose();
      toast.success("Đăng xuất thành công");

      // Chuyển hướng về trang login
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Ngay cả khi có lỗi, vẫn xóa thông tin và chuyển về login
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_info");
      toast.warning("Đã đăng xuất nhưng có lỗi xảy ra");
      navigate("/login");
    }
  };
  return (
    <div className={`sidebar ${isSidebarOpen ? "" : "collapsed"}`}>
      <MenuSection title="MAIN PAGES">
        <MenuItem icon={TbLayoutDashboard} text="Dashboard" />
        <MenuItem icon={IoBag} text="Products" isDropdown>
          <SubMenuItem text="Product List" prefix="products" />
          <SubMenuItem text="Product Upload" prefix="products" />
        </MenuItem>

        <MenuItem icon={BiSolidCategory} text="Category" isDropdown>
          <SubMenuItem text="Category List" prefix="category" />
          <SubMenuItem text="Category Add" prefix="category" />
        </MenuItem>

        <MenuItem icon={MdBrandingWatermark} text="Brands" isDropdown>
          <SubMenuItem text="Brand List" prefix="brands" />
          <SubMenuItem text="Brand Add" prefix="brands" />
        </MenuItem>
        <MenuItem icon={BiPackage} text="Sliders" isDropdown>
          <SubMenuItem text="Slider List" prefix="sliders" />
          <SubMenuItem text="Slider Add" prefix="sliders" />
        </MenuItem>
        <MenuItem icon={MdBrandingWatermark} text="Voucher" isDropdown>
          <SubMenuItem text="Voucher List" prefix="voucher" />
          <SubMenuItem text="Voucher Add" prefix="voucher" />
        </MenuItem>
        <MenuItem
          icon={FaRegUser}
          text="Users"
          badge={{ type: "hot", text: "HOT" }}
        />
        <MenuItem icon={RiBillLine} text="Posts" isDropdown>
          <SubMenuItem text="Posts List" prefix="posts" />
          <SubMenuItem text="Posts Add" prefix="posts" />
        </MenuItem>
        <MenuItem
          icon={BsCart3}
          text="Orders"
          badge={
            newOrdersCount > 0
              ? { type: "count", text: newOrdersCount.toString() }
              : null
          }
          onClick={handleOrdersClick}
        />
        <MenuItem icon={IoChatboxEllipses} text="Chat" />
        <MenuItem icon={IoChatboxEllipses} text="Contact-Info" />
        <MenuItem icon={IoChatboxEllipses} text="Feedbacks" />
        <MenuItem icon={TbLayoutDashboard} text="Footer" />
      </MenuSection>
      <MenuItem icon={TbLayoutDashboard} text="Register" />
      <div className="sidebar-wrapper">
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lock-icon"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0110 0v4"></path>
            </svg>
            LOGOUT
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
