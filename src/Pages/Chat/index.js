import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  IconButton,
  Paper,
  CircularProgress,
  Badge,
  InputAdornment,
  Tooltip,
  Fade,
} from "@mui/material";
import {
  Send as SendIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import { getData, postData, apiClient } from "../../utils/api";

// Hàm giải mã JWT để lấy adminId
function getAdminIdFromToken() {
  const token = localStorage.getItem("admin_token");
  if (!token) {
    return null;
  }
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const id = payload.id || payload._id;
    if (!id) {
      return null;
    }
    return id;
  } catch (error) {
    return null;
  }
}

const Chat = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const { isDarkMode } = useCustomTheme();
  const adminId = getAdminIdFromToken();
  const [unreadMessages, setUnreadMessages] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Kiểm tra token và chuyển hướng nếu cần
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      navigate("/login");
      return;
    }

    // Kiểm tra token có hợp lệ không
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (!payload.id && !payload._id) {
        toast.error("Token không hợp lệ. Vui lòng đăng nhập lại.");
        navigate("/login");
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra token:", error);
      toast.error("Token không hợp lệ. Vui lòng đăng nhập lại.");
      navigate("/login");
    }
  }, [navigate]);

  // Kiểm tra adminId khi component mount
  useEffect(() => {
    if (!adminId) {
      toast.error("Không thể xác thực người dùng. Vui lòng đăng nhập lại.");
      navigate("/login");
    }
  }, [adminId, navigate]);

  // Lấy toàn bộ user (chỉ lấy user thường)
  const fetchUsers = async () => {
    try {
      const response = await getData(
        "/api/messages/admin/all-users?role=user&status=active&page=1&limit=1000"
      );
      if (response && response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách user:", error);
      toast.error("Không thể lấy danh sách người dùng");
    }
  };

  // Lấy tin nhắn với user được chọn
  const fetchMessages = useCallback(
    async (userId) => {
      if (!adminId) {
        return;
      }

      try {
        setLoading(true);
        const response = await getData("/api/messages/admin");
        if (response.success) {
          const filteredMessages = response.data.filter((msg) => {
            const senderId =
              msg.sender && msg.sender._id
                ? String(msg.sender._id)
                : String(msg.sender);
            const receiverId =
              msg.receiver && msg.receiver._id
                ? String(msg.receiver._id)
                : String(msg.receiver);
            const isAdminToUser =
              (senderId === String(adminId) && receiverId === String(userId)) ||
              (receiverId === String(adminId) && senderId === String(userId));

            return isAdminToUser;
          });
          setMessages(filteredMessages);
        }
      } catch (error) {
        toast.error("Không thể lấy tin nhắn");
      } finally {
        setLoading(false);
      }
    },
    [adminId]
  ); // Add adminId as dependency here

  // Gửi tin nhắn mới
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const response = await postData("/api/messages/admin/send", {
        receiverId: selectedUser._id,
        content: newMessage,
      });

      if (response.success) {
        // Thêm tin nhắn mới vào danh sách
        const newMsg = {
          ...response.data,
          senderType: "Admin",
          receiverType: "user",
        };
        setMessages((prev) => [...prev, newMsg]);
        setNewMessage("");
        // Cập nhật lại tin nhắn mới nhất
        fetchMessages(selectedUser._id);
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      toast.error("Không thể gửi tin nhắn");
    }
  };

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Hàm lấy số tin nhắn chưa đọc
  const fetchUnreadMessages = async () => {
    try {
      const response = await apiClient.get("/api/messages/admin/unread");
      if (response.data.success) {
        setUnreadMessages(response.data.data);
        // Lưu vào localStorage để hiển thị ở NavLinks
        localStorage.setItem(
          "unread_messages",
          JSON.stringify(response.data.data)
        );
      }
    } catch (error) {
      console.error("Lỗi khi lấy số tin nhắn chưa đọc:", error);
    }
  };

  // Hàm đánh dấu tin nhắn đã đọc
  const markMessagesAsRead = async (userId) => {
    try {
      await apiClient.put(`/api/messages/read/${userId}`);
      // Cập nhật state unreadMessages
      setUnreadMessages((prev) => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
      // Cập nhật localStorage
      localStorage.setItem("unread_messages", JSON.stringify(unreadMessages));
    } catch (error) {
      console.error("Lỗi khi đánh dấu tin nhắn đã đọc:", error);
    }
  };

  // Cập nhật useEffect để gọi fetchUnreadMessages
  useEffect(() => {
    fetchUsers();
    fetchUnreadMessages();
    // Thiết lập interval để cập nhật số tin nhắn chưa đọc mỗi 30 giây
    const interval = setInterval(fetchUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cập nhật hàm handleUserSelect
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    markMessagesAsRead(user._id);
  };

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser, fetchMessages]); // Add fetchMessages to dependencies

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      sx={{
        display: "flex",
        height: "calc(100vh - 100px)",
        backgroundColor: isDarkMode ? "#0f1824" : "#f5f5f5",
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: 3,
      }}
    >
      {/* Sidebar */}
      <Paper
        elevation={0}
        sx={{
          width: 320,
          borderRight: 1,
          borderColor: "divider",
          backgroundColor: isDarkMode ? "#1a2634" : "#fff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            backgroundColor: isDarkMode ? "#1a2634" : "#fff",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: isDarkMode ? "#fff" : "#1a1a1a",
              fontWeight: 600,
              mb: 1,
            }}
          >
            Tin nhắn
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm người dùng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: isDarkMode ? "#aaa" : "#666" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: isDarkMode ? "#2c3e50" : "#f5f5f5",
                "& fieldset": {
                  borderColor: "transparent",
                },
                "&:hover fieldset": {
                  borderColor: isDarkMode ? "#fff" : "#1a1a1a",
                },
                "&.Mui-focused fieldset": {
                  borderColor: isDarkMode ? "#fff" : "#1a1a1a",
                },
              },
            }}
          />
        </Box>

        {/* User List */}
        <List
          sx={{
            flex: 1,
            overflow: "auto",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: isDarkMode ? "#2c3e50" : "#ccc",
              borderRadius: "3px",
            },
          }}
        >
          {filteredUsers.map((user) => (
            <ListItem
              key={user._id}
              selected={selectedUser?._id === user._id}
              onClick={() => handleUserSelect(user)}
              sx={{
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: isDarkMode ? "#2c3e50" : "#f5f5f5",
                },
                "&.Mui-selected": {
                  backgroundColor: isDarkMode ? "#2c3e50" : "#e3f2fd",
                },
              }}
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  badgeContent={
                    unreadMessages[user._id] > 0 ? (
                      <Box
                        sx={{
                          backgroundColor: "#ff4444",
                          color: "#fff",
                          borderRadius: "50%",
                          width: 20,
                          height: 20,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                        }}
                      >
                        {unreadMessages[user._id]}
                      </Box>
                    ) : null
                  }
                >
                  <Avatar
                    sx={{
                      bgcolor: isDarkMode ? "#2c3e50" : "#e3f2fd",
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                    }}
                  >
                    {(user.name && user.name[0]) || "U"}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                    }}
                  >
                    {user.name}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDarkMode ? "#aaa" : "#666",
                      fontSize: "0.875rem",
                    }}
                  >
                    {user.email}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Chat Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: isDarkMode ? "#0f1824" : "#fff",
        }}
      >
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: "divider",
                backgroundColor: isDarkMode ? "#1a2634" : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: isDarkMode ? "#2c3e50" : "#e3f2fd",
                    color: isDarkMode ? "#fff" : "#1a1a1a",
                  }}
                >
                  {(selectedUser.name && selectedUser.name[0]) || "U"}
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                      fontWeight: 600,
                    }}
                  >
                    {selectedUser.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: isDarkMode ? "#aaa" : "#666" }}
                  >
                    {selectedUser.email}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Tooltip title="Làm mới" TransitionComponent={Fade}>
                  <IconButton
                    onClick={() => fetchMessages(selectedUser._id)}
                    sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Tùy chọn" TransitionComponent={Fade}>
                  <IconButton sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                overflow: "auto",
                p: 2,
                backgroundColor: isDarkMode ? "#0f1824" : "#f5f5f5",
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: isDarkMode ? "#2c3e50" : "#ccc",
                  borderRadius: "3px",
                },
              }}
            >
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : messages.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    color: isDarkMode ? "#aaa" : "#888",
                    mt: 4,
                  }}
                >
                  <Typography>
                    Chưa có tin nhắn nào với người dùng này.
                  </Typography>
                </Box>
              ) : (
                messages
                  .slice()
                  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                  .map((message) => (
                    <Box
                      key={message._id}
                      sx={{
                        display: "flex",
                        justifyContent:
                          message.senderType === "Admin" ||
                          (message.sender && message.sender._id === adminId)
                            ? "flex-end"
                            : "flex-start",
                        mb: 2,
                      }}
                    >
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          maxWidth: "70%",
                          backgroundColor:
                            message.senderType === "Admin" ||
                            (message.sender && message.sender._id === adminId)
                              ? isDarkMode
                                ? "#2c3e50"
                                : "#e3f2fd"
                              : isDarkMode
                              ? "#1a2634"
                              : "#fff",
                          color: isDarkMode ? "#fff" : "#1a1a1a",
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body1">
                          {message.content}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mt: 1,
                            color: isDarkMode ? "#aaa" : "#666",
                          }}
                        >
                          {new Date(message.createdAt).toLocaleString("vi-VN")}
                        </Typography>
                      </Paper>
                    </Box>
                  ))
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Box
              sx={{
                p: 2,
                borderTop: 1,
                borderColor: "divider",
                backgroundColor: isDarkMode ? "#1a2634" : "#fff",
              }}
            >
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: isDarkMode ? "#2c3e50" : "#f5f5f5",
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                      "& fieldset": {
                        borderColor: "transparent",
                      },
                      "&:hover fieldset": {
                        borderColor: isDarkMode ? "#fff" : "#1a1a1a",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: isDarkMode ? "#fff" : "#1a1a1a",
                      },
                    },
                  }}
                />
                <IconButton
                  onClick={sendMessage}
                  sx={{
                    backgroundColor: "#0858f7",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#0646c6",
                    },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              color: isDarkMode ? "#fff" : "#1a1a1a",
            }}
          >
            <Typography variant="h6">
              Chọn một người dùng để bắt đầu chat
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Chat;
