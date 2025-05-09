import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { getData, putData } from "../../utils/api";
import { FaUpload } from "react-icons/fa";
import { toast } from "react-hot-toast";

const PostEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [imageInputType, setImageInputType] = useState("url");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
    tags: "",
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const post = await getData(`/api/posts/${id}`);
        setFormData({
          title: post.title,
          content: post.content,
          image: post.image,
          tags: post.tags.join(", "),
        });
        setImagePreview(post.image);
        setIsLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin bài viết:", error);
        toast.error("Không thể tải thông tin bài viết");
        navigate("/posts");
      }
    };

    fetchPost();
  }, [id, navigate]);

  const changeInput = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    if (event.target.name === "image" && imageInputType === "url") {
      setImagePreview(event.target.value);
    }
  };

  const handleImageTypeChange = (e) => {
    setImageInputType(e.target.value);
    if (e.target.value === "file") {
      setFormData({
        ...formData,
        image: "",
      });
    } else {
      setImageFile(null);
      setImagePreview(formData.image);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const updatePost = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      let postDataToSend = { ...formData };

      if (!postDataToSend.title) {
        throw new Error("Vui lòng nhập tiêu đề bài viết");
      }
      if (!postDataToSend.content) {
        throw new Error("Vui lòng nhập nội dung bài viết");
      }

      if (imageInputType === "file" && imageFile) {
        const base64Image = await fileToBase64(imageFile);
        postDataToSend.image = base64Image;
      }

      postDataToSend.tags = postDataToSend.tags
        .split(",")
        .map((tag) => tag.trim());

      await putData(`/api/posts/${id}`, postDataToSend);

      toast.success("Cập nhật bài viết thành công!");

      setTimeout(() => {
        navigate("/posts");
      }, 2000);
    } catch (error) {
      console.error("Lỗi khi cập nhật bài viết:", error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật bài viết");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: isDarkMode ? "#0f1824" : "#f5f5f5",
        minHeight: "100vh",
        width: "100%",
        position: "relative",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
          border: "none",
          p: 4,
          minHeight: "calc(100vh - 24px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="header">
          <h1>Sửa bài viết</h1>
          <div className="breadcrumbs">
            <Link to="/" className="breadcrumb-link">
              Home
            </Link>
            <span className="separator">~</span>
            <Link to="/posts" className="breadcrumb-link">
              Bài viết
            </Link>
            <span className="separator">~</span>
            <span>Sửa bài viết</span>
          </div>
        </div>

        <Stack spacing={4}>
          <Box sx={{ minHeight: "calc(100vh - 400px)" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                  fontWeight: 500,
                }}
              >
                Thông tin bài viết
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Tiêu đề"
              name="title"
              value={formData.title}
              onChange={changeInput}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                  height: "56px",
                  "& fieldset": {
                    border: "none",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.6)",
                },
                "& .MuiInputBase-input": {
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                },
              }}
            />

            <TextField
              fullWidth
              label="Nội dung"
              name="content"
              value={formData.content}
              onChange={changeInput}
              multiline
              rows={4}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                  "& fieldset": {
                    border: "none",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.6)",
                },
                "& .MuiInputBase-input": {
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                },
              }}
            />

            <FormControl component="fieldset" sx={{ mb: 2, width: "100%" }}>
              <FormLabel
                component="legend"
                sx={{
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.6)",
                  mb: 1,
                }}
              >
                Phương thức chọn ảnh
              </FormLabel>
              <RadioGroup
                row
                name="imageInputType"
                value={imageInputType}
                onChange={handleImageTypeChange}
              >
                <FormControlLabel
                  value="url"
                  control={
                    <Radio sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }} />
                  }
                  label="URL"
                  sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                />
                <FormControlLabel
                  value="file"
                  control={
                    <Radio sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }} />
                  }
                  label="Upload File"
                  sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                />
              </RadioGroup>
            </FormControl>

            {imageInputType === "url" ? (
              <TextField
                fullWidth
                label="Image URL"
                name="image"
                value={formData.image}
                onChange={changeInput}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                    height: "56px",
                    "& fieldset": {
                      border: "none",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.6)",
                  },
                  "& .MuiInputBase-input": {
                    color: isDarkMode ? "#fff" : "#1a1a1a",
                  },
                }}
              />
            ) : (
              <Box sx={{ mb: 3 }}>
                <input
                  type="file"
                  id="imageFile"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <label htmlFor="imageFile">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<FaUpload />}
                    sx={{
                      bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                      border: "none",
                      p: 2,
                      "&:hover": {
                        bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.3)" : "#e0e0e0",
                        border: "none",
                      },
                    }}
                  >
                    Chọn File Ảnh
                  </Button>
                </label>
                {imageFile && (
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                    }}
                  >
                    File đã chọn: {imageFile.name}
                  </Typography>
                )}
              </Box>
            )}

            {imagePreview && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  border: "1px solid",
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.1)"
                    : "#e0e0e0",
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    color: isDarkMode ? "#fff" : "#1a1a1a",
                  }}
                >
                  Xem trước ảnh:
                </Typography>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    objectFit: "contain",
                  }}
                />
              </Box>
            )}

            <TextField
              fullWidth
              label="Tags (cách nhau bằng dấu phẩy)"
              name="tags"
              value={formData.tags}
              onChange={changeInput}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                  height: "56px",
                  "& fieldset": {
                    border: "none",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.6)",
                },
                "& .MuiInputBase-input": {
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                },
              }}
            />

            <Button
              variant="contained"
              disabled={isSubmitting}
              sx={{
                px: 4,
                py: 1.5,
                bgcolor: "#0858f7",
                color: "#fff",
                "&:hover": {
                  bgcolor: "#0646c6",
                },
                "&:disabled": {
                  bgcolor: isDarkMode
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.12)",
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(0, 0, 0, 0.26)",
                },
                borderRadius: 1,
                textTransform: "uppercase",
                fontWeight: 500,
              }}
              onClick={updatePost}
            >
              {isSubmitting ? "Đang xử lý..." : "Cập nhật bài viết"}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default PostEdit;
