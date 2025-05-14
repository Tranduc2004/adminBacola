import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  InputAdornment,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { apiClient } from "../../utils/api";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const Feedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const theme = useTheme();

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await apiClient.get("/api/about/feedback");
      setFeedbacks(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đánh giá:", error);
      toast.error("Không thể lấy danh sách đánh giá!");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await apiClient.put(`/api/about/feedback/${id}`, { status: newStatus });
      toast.success("Cập nhật trạng thái thành công!");
      fetchFeedbacks();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái!");
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      try {
        await apiClient.delete(`/api/about/feedback/${id}`);
        toast.success("Xóa đánh giá thành công!");
        fetchFeedbacks();
        setSelectedFeedback(null);
      } catch (error) {
        toast.error("Có lỗi xảy ra khi xóa đánh giá!");
        console.error("Lỗi khi xóa đánh giá:", error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "read":
        return "info";
      case "replied":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "read":
        return "Đã đọc";
      case "replied":
        return "Đã phản hồi";
      default:
        return status;
    }
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      feedback.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || feedback.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: theme.palette.background.default,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Quản Lý Đánh Giá
          </Typography>
          <IconButton onClick={fetchFeedbacks} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* Bộ lọc và tìm kiếm */}
        <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">Tất cả trạng thái</MenuItem>
            <MenuItem value="pending">Chờ xử lý</MenuItem>
            <MenuItem value="read">Đã đọc</MenuItem>
            <MenuItem value="replied">Đã phản hồi</MenuItem>
          </Select>
        </Box>

        <Box sx={{ display: "flex", gap: 3 }}>
          {/* Danh sách đánh giá */}
          <Box sx={{ flex: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Người gửi</TableCell>
                    <TableCell>Tiêu đề</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Thời gian</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredFeedbacks.map((feedback) => (
                    <TableRow
                      key={feedback._id}
                      selected={selectedFeedback?._id === feedback._id}
                      onClick={() => setSelectedFeedback(feedback)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="subtitle2">
                          {feedback.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {feedback.email}
                        </Typography>
                      </TableCell>
                      <TableCell>{feedback.subject}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(feedback.status)}
                          color={getStatusColor(feedback.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(feedback.createdAt),
                          "HH:mm dd/MM/yyyy",
                          {
                            locale: vi,
                          }
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(feedback._id);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Chi tiết đánh giá */}
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardHeader
                title="Chi Tiết Đánh Giá"
                titleTypographyProps={{ variant: "h6" }}
              />
              <Divider />
              <CardContent>
                {selectedFeedback ? (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Người gửi
                      </Typography>
                      <Typography variant="body1">
                        {selectedFeedback.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedFeedback.email}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Tiêu đề
                      </Typography>
                      <Typography variant="body1">
                        {selectedFeedback.subject}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Nội dung
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ whiteSpace: "pre-wrap" }}
                      >
                        {selectedFeedback.message}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Thời gian gửi
                      </Typography>
                      <Typography variant="body1">
                        {format(
                          new Date(selectedFeedback.createdAt),
                          "HH:mm dd/MM/yyyy",
                          { locale: vi }
                        )}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Trạng thái
                      </Typography>
                      <Select
                        fullWidth
                        size="small"
                        value={selectedFeedback.status}
                        onChange={(e) =>
                          handleStatusChange(
                            selectedFeedback._id,
                            e.target.value
                          )
                        }
                      >
                        <MenuItem value="pending">Chờ xử lý</MenuItem>
                        <MenuItem value="read">Đã đọc</MenuItem>
                        <MenuItem value="replied">Đã phản hồi</MenuItem>
                      </Select>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: 200,
                      color: "text.secondary",
                    }}
                  >
                    <Typography>Chọn một đánh giá để xem chi tiết</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Feedbacks;
