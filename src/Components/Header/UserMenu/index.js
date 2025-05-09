import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoLogOutOutline } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { logoutAdmin } from "../../../utils/api";
import { toast } from "react-toastify";
import {
  Avatar,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from "@mui/material";

const UserMenu = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || "{}");

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      // Gọi API logout
      await logoutAdmin();

      handleClose();
      toast.success("Đăng xuất thành công");

      // Chuyển hướng về trang login
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.warning("Đã đăng xuất nhưng có lỗi xảy ra");
      navigate("/login");
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        className="user-menu-button"
        style={{ textTransform: "none" }}
      >
        <Avatar
          alt={adminInfo?.fullName || "Admin"}
          src="/static/images/avatar/1.jpg"
          sx={{ width: 32, height: 32 }}
        />
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={() => navigate("/profile")}>
          <ListItemIcon>
            <CgProfile />
          </ListItemIcon>
          Hồ sơ của tôi
        </MenuItem>
        <MenuItem onClick={() => navigate("/settings")}>
          <ListItemIcon>
            <IoSettingsOutline />
          </ListItemIcon>
          Cài đặt
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <IoLogOutOutline />
          </ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
