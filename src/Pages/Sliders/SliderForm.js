import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Switch,
  Paper,
} from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import { postData, editData, viewData } from "../../utils/api";
import { toast } from "react-toastify";
import { useTheme } from "../../context/ThemeContext";

const SliderForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isDarkMode } = useTheme();

  const [slider, setSlider] = useState({
    name: "",
    description: "",
    image: "",
    link: "",
    order: 0,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const data = await viewData("/api/sliders", id);
          setSlider(data);
        } catch (error) {
          console.error("Error fetching slider:", error);
          toast.error("Lỗi khi tải thông tin slider");
        }
      })();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSlider((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlider((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleActive = (e) => {
    setSlider((prev) => ({ ...prev, isActive: e.target.checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!slider.name || !slider.image) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      setLoading(false);
      return;
    }

    const dataToSubmit = { ...slider, order: Number(slider.order) };

    try {
      if (id) {
        await editData(`/api/sliders/${id}`, dataToSubmit);
        toast.success("Cập nhật slider thành công");
      } else {
        await postData("/api/sliders", dataToSubmit);
        toast.success("Thêm slider thành công");
      }
      navigate("/sliders");
    } catch (error) {
      console.error("Error submitting slider:", error);
      toast.error(id ? "Lỗi khi cập nhật slider" : "Lỗi khi thêm slider");
    } finally {
      setLoading(false);
    }
  };

  const paperStyle = {
    backgroundColor: isDarkMode ? "#1a2035" : "#fff",
    color: isDarkMode ? "#fff" : "#000",
    boxShadow: isDarkMode
      ? "0 4px 20px 0 rgba(0, 0, 0, 0.5)"
      : "0 4px 20px 0 rgba(0, 0, 0, 0.1)",
    p: 3,
  };

  const textFieldStyle = {
    "& .MuiInputLabel-root": {
      color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : undefined,
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: isDarkMode ? "rgba(255, 255, 255, 0.23)" : undefined,
      },
      "&:hover fieldset": {
        borderColor: isDarkMode ? "rgba(255, 255, 255, 0.4)" : undefined,
      },
      "&.Mui-focused fieldset": {
        borderColor: isDarkMode ? "#90caf9" : undefined,
      },
    },
    "& .MuiInputBase-input": {
      color: isDarkMode ? "#fff" : undefined,
    },
  };

  const switchStyle = {
    "& .MuiSwitch-track": {
      backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : undefined,
    },
  };

  const formLabelStyle = {
    color: isDarkMode ? "#fff" : undefined,
  };

  return (
    <Box sx={{ color: isDarkMode ? "#fff" : "#000" }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, color: isDarkMode ? "#fff" : "#000" }}
      >
        {id ? "Chỉnh sửa Slider" : "Thêm Slider Mới"}
        <div className="breadcrumbs">
          <Link to="/" className="breadcrumb-link">
            Trang chủ
          </Link>
          <span className="separator">~</span>
          <Link to="/sliders" className="breadcrumb-link">
            Slider
          </Link>
          <span className="separator">~</span>
          <span>{id ? "Chỉnh sửa Slider" : "Thêm Slider Mới"}</span>
        </div>
      </Typography>

      <Paper sx={paperStyle}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Tên slider"
              name="name"
              value={slider.name}
              onChange={handleChange}
              required
              fullWidth
              sx={textFieldStyle}
            />

            <TextField
              label="Mô tả"
              name="description"
              value={slider.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              sx={textFieldStyle}
            />

            <TextField
              label="Đường dẫn"
              name="link"
              value={slider.link}
              onChange={handleChange}
              fullWidth
              sx={textFieldStyle}
            />

            <TextField
              label="Thứ tự"
              name="order"
              type="number"
              value={slider.order}
              onChange={handleChange}
              fullWidth
              sx={textFieldStyle}
            />

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                p: 2,
                border: `1px dashed ${isDarkMode ? "#555" : "#ccc"}`,
                borderRadius: 2,
                bgcolor: isDarkMode ? "#1e1e1e" : "#f9f9f9",
              }}
            >
              <Typography variant="subtitle1">Chọn ảnh:</Typography>

              <Button
                variant="outlined"
                component="label"
                sx={{
                  alignSelf: "flex-start",
                  borderColor: isDarkMode ? "#90caf9" : "#1976d2",
                  color: isDarkMode ? "#90caf9" : "#1976d2",
                  "&:hover": {
                    backgroundColor: isDarkMode
                      ? "rgba(144,202,249,0.1)"
                      : "rgba(25,118,210,0.1)",
                  },
                }}
              >
                Tải ảnh từ máy
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>

              <TextField
                label="Hoặc dán URL ảnh"
                variant="outlined"
                value={slider.image}
                onChange={(e) =>
                  setSlider({ ...slider, image: e.target.value })
                }
                fullWidth
              />

              {slider.image && (
                <Box
                  component="img"
                  src={slider.image}
                  alt="Preview"
                  sx={{
                    mt: 1,
                    width: "100%",
                    maxWidth: 300,
                    height: "auto",
                    borderRadius: 2,
                    border: `1px solid ${isDarkMode ? "#444" : "#ccc"}`,
                    objectFit: "cover",
                  }}
                />
              )}
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={slider.isActive}
                  onChange={handleToggleActive}
                  sx={switchStyle}
                />
              }
              label="Hoạt động"
              sx={formLabelStyle}
            />

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => navigate("/sliders")}
                disabled={loading}
                sx={{
                  color: isDarkMode ? "#fff" : undefined,
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.5)"
                    : undefined,
                  "&:hover": {
                    borderColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.8)"
                      : undefined,
                    backgroundColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.05)"
                      : undefined,
                  },
                }}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{
                  backgroundColor: loading
                    ? undefined
                    : isDarkMode
                    ? "#00aaff"
                    : undefined,
                  "&:hover": {
                    backgroundColor: loading
                      ? undefined
                      : isDarkMode
                      ? "#0088cc"
                      : undefined,
                  },
                }}
              >
                {id ? "Cập nhật" : "Thêm"}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default SliderForm;
