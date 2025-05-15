import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  Divider,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import { apiClient, checkToken } from "../../utils/api";
import { useNavigate } from "react-router-dom";

const FooterEdit = () => {
  const [footer, setFooter] = useState({
    topInfo: [
      { icon: "", text: "" },
      { icon: "", text: "" },
      { icon: "", text: "" },
      { icon: "", text: "" },
    ],
    categories: [
      {
        title: "",
        items: [""],
      },
    ],
    contactInfo: {
      phone: "",
      workingHours: "",
    },
    appDownload: {
      title: "",
      subtitle: "",
      googlePlayLink: "",
      appStoreLink: "",
    },
    socialMedia: {
      facebook: "",
      twitter: "",
      instagram: "",
    },
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchFooter();
  }, []);

  const fetchFooter = async () => {
    try {
      const response = await apiClient.get("/api/footer");
      if (response.data.success) {
        if (response.data.data) {
          setFooter(response.data.data);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu footer:", error);
      toast.error("Không thể lấy dữ liệu footer");
    }
  };

  const handleTopInfoChange = (index, field, value) => {
    const newTopInfo = [...footer.topInfo];
    newTopInfo[index][field] = value;
    setFooter({ ...footer, topInfo: newTopInfo });
  };

  const handleCategoryChange = (index, field, value) => {
    const newCategories = [...footer.categories];
    if (field === "title") {
      newCategories[index].title = value;
    } else {
      newCategories[index].items = value.split(",").map((item) => item.trim());
    }
    setFooter({ ...footer, categories: newCategories });
  };

  const addCategory = () => {
    setFooter({
      ...footer,
      categories: [
        ...footer.categories,
        {
          title: "",
          items: [""],
        },
      ],
    });
  };

  const removeCategory = (index) => {
    const newCategories = footer.categories.filter((_, i) => i !== index);
    setFooter({ ...footer, categories: newCategories });
  };

  const handleContactInfoChange = (field, value) => {
    setFooter({
      ...footer,
      contactInfo: { ...footer.contactInfo, [field]: value },
    });
  };

  const handleAppDownloadChange = (field, value) => {
    setFooter({
      ...footer,
      appDownload: { ...footer.appDownload, [field]: value },
    });
  };

  const handleSocialMediaChange = (field, value) => {
    setFooter({
      ...footer,
      socialMedia: { ...footer.socialMedia, [field]: value },
    });
  };

  const handleSubmit = async () => {
    try {
      if (!checkToken()) {
        toast.error("Vui lòng đăng nhập lại");
        return;
      }

      if (footer._id) {
        // Cập nhật footer hiện có
        await apiClient.put(`/api/footer/${footer._id}`, footer);
        toast.success("Cập nhật footer thành công");
      } else {
        // Tạo footer mới
        await apiClient.post("/api/footer", footer);
        toast.success("Tạo footer thành công");
      }
      fetchFooter();
    } catch (error) {
      console.error("Lỗi khi lưu footer:", error);
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
      } else {
        toast.error("Không thể lưu footer");
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate("/footer")}
        >
          Quay lại xem footer
        </Button>
      </Box>
      <Typography variant="h4" gutterBottom>
        Chỉnh sửa Footer
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Thông tin cơ bản
          </Typography>
          <Grid container spacing={2}>
            {footer.topInfo.map((info, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <TextField
                  fullWidth
                  label={`Icon ${index + 1}`}
                  value={info.icon}
                  onChange={(e) =>
                    handleTopInfoChange(index, "icon", e.target.value)
                  }
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label={`Nội dung ${index + 1}`}
                  value={info.text}
                  onChange={(e) =>
                    handleTopInfoChange(index, "text", e.target.value)
                  }
                  margin="normal"
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6">Danh mục</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addCategory}
            >
              Thêm danh mục
            </Button>
          </Box>
          <List>
            {footer.categories.map((category, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Tiêu đề danh mục"
                        value={category.title}
                        onChange={(e) =>
                          handleCategoryChange(index, "title", e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Các mục (phân cách bằng dấu phẩy)"
                        value={category.items.join(", ")}
                        onChange={(e) =>
                          handleCategoryChange(index, "items", e.target.value)
                        }
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => removeCategory(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < footer.categories.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Thông tin liên hệ
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={footer.contactInfo.phone}
                onChange={(e) =>
                  handleContactInfoChange("phone", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giờ làm việc"
                value={footer.contactInfo.workingHours}
                onChange={(e) =>
                  handleContactInfoChange("workingHours", e.target.value)
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Thông tin ứng dụng
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tiêu đề"
                value={footer.appDownload.title}
                onChange={(e) =>
                  handleAppDownloadChange("title", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phụ đề"
                value={footer.appDownload.subtitle}
                onChange={(e) =>
                  handleAppDownloadChange("subtitle", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Link Google Play"
                value={footer.appDownload.googlePlayLink}
                onChange={(e) =>
                  handleAppDownloadChange("googlePlayLink", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Link App Store"
                value={footer.appDownload.appStoreLink}
                onChange={(e) =>
                  handleAppDownloadChange("appStoreLink", e.target.value)
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Mạng xã hội
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Facebook"
                value={footer.socialMedia.facebook}
                onChange={(e) =>
                  handleSocialMediaChange("facebook", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Twitter"
                value={footer.socialMedia.twitter}
                onChange={(e) =>
                  handleSocialMediaChange("twitter", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Instagram"
                value={footer.socialMedia.instagram}
                onChange={(e) =>
                  handleSocialMediaChange("instagram", e.target.value)
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubmit}
        >
          Lưu thay đổi
        </Button>
      </Box>
    </Box>
  );
};

export default FooterEdit;
