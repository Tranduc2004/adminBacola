import React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Settings from "@mui/icons-material/Settings";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import { FaBell } from "react-icons/fa";

const NotificationsMenu = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="dropdownWrapper">
      <Button
        className="rounded-circle mr-3"
        onClick={handleClick}
        sx={{
          padding: "8px",
          position: "relative",
        }}
      >
        <Badge
          badgeContent={34}
          color="primary"
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: "#0d6efd",
              color: "white",
              fontSize: "10px",
              minWidth: "18px",
              height: "18px",
              top: "-8px",
              right: "-8px",
            },
          }}
        >
          <FaBell style={{ fontSize: "16px" }} />
        </Badge>
      </Button>
      <Menu
        anchorEl={anchorEl}
        className="notifications"
        id="notifications"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          sx: {
            width: "320px",
            maxWidth: "100%",
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiMenuItem-root": {
              whiteSpace: "normal",
              padding: "10px 15px",
            },
            "& .view-all": {
              backgroundColor: "#e7f0ff",
              color: "#0d6efd",
              margin: "8px 15px",
              borderRadius: "4px",
              fontWeight: "500",
              justifyContent: "center",
              "&:hover": {
                backgroundColor: "#0d6efd",
                color: "#fff",
              },
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <div
          style={{
            padding: "10px 15px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h6 style={{ margin: 0 }}>Notifications (34)</h6>
          <Button size="small" style={{ minWidth: "auto", padding: "4px" }}>
            <Settings fontSize="small" />
          </Button>
        </div>
        <Divider />
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          <NotificationItem
            avatar="https://mironcoder-hotash.netlify.app/images/avatar/01.webp"
            name="Mahmudul"
            action="added to his favorite list"
            target="Leather Belt Steve Madden"
            time="few seconds ago!"
          />
          <NotificationItem
            avatar="https://mironcoder-hotash.netlify.app/images/avatar/02.webp"
            name="Labonno"
            action="leave her comment to"
            target="Dressen Breathable Female Dress"
            time="25 minutes ago!"
          />
          <NotificationItem
            avatar="https://mironcoder-hotash.netlify.app/images/avatar/03.webp"
            name="Tahmina"
            action="announce to 50% discount"
            target="New Exclusive Long Kurti"
            time="12 hours ago!"
          />
        </div>
        <Divider />
        <MenuItem className="view-all">VIEW ALL NOTIFICATIONS</MenuItem>
      </Menu>
    </div>
  );
};

const NotificationItem = ({ avatar, name, action, target, time }) => (
  <MenuItem style={{ padding: 0 }}>
    <div
      style={{
        display: "flex",
        gap: "12px",
        width: "100%",
        padding: "8px 15px",
      }}
    >
      <Avatar src={avatar} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "8px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              wordWrap: "break-word",
              wordBreak: "break-word",
              flex: 1,
              minWidth: 0,
            }}
          >
            <strong>{name}</strong> {action} <strong>{target}</strong>
          </p>
          <Button style={{ minWidth: "auto", padding: 0 }}>
            <Settings fontSize="small" />
          </Button>
        </div>
        <small style={{ color: "#0d6efd" }}>{time}</small>
      </div>
    </div>
  </MenuItem>
);

export default NotificationsMenu;
