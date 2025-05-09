import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { editData, fetchDataFromApi } from "../../utils/api";
import { useTheme } from "../../context/ThemeContext";
import { FaUpload, FaLink } from "react-icons/fa";

const EditSliderDialog = ({ open, onClose, sliderId, onSuccess }) => {
  const { isDarkMode } = useTheme();
  const [sliderData, setSliderData] = useState({
    name: "",
    description: "",
    image: "",
    order: "",
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSource, setImageSource] = useState("file");
  const [imageUrl, setImageUrl] = useState("");

  const fetchSliderData = useCallback(async () => {
    try {
      const data = await fetchDataFromApi(`/api/sliders/${sliderId}`);
      console.log("Fetched slider data:", data);

      // Cập nhật dữ liệu slider
      setSliderData({
        name: data.name || "",
        description: data.description || "",
        image: data.image || "",
        order: data.order?.toString() || "",
        isActive: data.isActive !== undefined ? data.isActive : true,
      });

      // Cập nhật URL ảnh và xác định nguồn ảnh
      setImageUrl(data.image || "");
      if (
        data.image &&
        (data.image.startsWith("http://") || data.image.startsWith("https://"))
      ) {
        setImageSource("url");
      } else {
        setImageSource("file");
      }
    } catch (error) {
      console.error("Error fetching slider:", error);
      setErrorMessage("Không thể tải dữ liệu slider");
      toast.error("Không thể tải dữ liệu slider");
    }
  }, [sliderId]);

  useEffect(() => {
    if (sliderId) fetchSliderData();
  }, [sliderId, fetchSliderData]);

  useEffect(() => {
    if (open) {
      setSelectedFile(null);
      setImageUrl("");
    }
  }, [open]);

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setSliderData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Tạo URL xem trước cho file
      const previewUrl = URL.createObjectURL(file);
      setSliderData((prev) => ({
        ...prev,
        image: previewUrl,
      }));
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setSliderData((prev) => ({
      ...prev,
      image: url,
    }));
  };

  const handleImageSourceChange = (source) => {
    setImageSource(source);
    setSelectedFile(null);
    if (source === "url") {
      // Khi chuyển sang URL, giữ lại URL cũ nếu có
      setImageUrl(sliderData.image || "");
    } else {
      // Khi chuyển sang file, xóa URL
      setImageUrl("");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (!sliderData.name || (!selectedFile && !sliderData.image)) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin bắt buộc");
      setIsLoading(false);
      return;
    }

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("name", sliderData.name);
        formData.append("description", sliderData.description);
        formData.append("order", sliderData.order);
        formData.append("isActive", sliderData.isActive);
        formData.append("image", selectedFile);

        const response = await fetch(`/api/sliders/${sliderId}`, {
          method: "PUT",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();

        if (data && data._id) {
          toast.success("Cập nhật slider thành công!");
          onSuccess?.();
          onClose();
          return;
        }

        throw new Error(data.message || "Không thể cập nhật slider");
      } else {
        const updatedData = {
          name: sliderData.name,
          description: sliderData.description,
          order: Number(sliderData.order) || 0,
          isActive: sliderData.isActive,
          image: imageUrl || sliderData.image,
        };

        const response = await editData(
          `/api/sliders/${sliderId}`,
          updatedData
        );

        if (response && (response._id || response.id)) {
          toast.success("Cập nhật slider thành công!");
          onSuccess?.();
          onClose();
          return;
        }

        throw new Error("Không thể cập nhật slider");
      }
    } catch (error) {
      console.error("Error updating slider:", error);
      toast.error(
        error.message || "Không thể cập nhật slider. Vui lòng thử lại."
      );
      setErrorMessage(
        error.message || "Không thể cập nhật slider. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const dialogStyle = {
    "& .MuiDialog-paper": {
      backgroundColor: isDarkMode ? "#1a2035" : "#fff",
      color: isDarkMode ? "#fff" : "#000",
    },
  };

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
      "& fieldset": {
        borderColor: isDarkMode
          ? "rgba(255, 255, 255, 0.2)"
          : "rgba(0, 0, 0, 0.23)",
      },
      "&:hover fieldset": {
        borderColor: isDarkMode
          ? "rgba(255, 255, 255, 0.3)"
          : "rgba(0, 0, 0, 0.23)",
      },
    },
    "& .MuiInputLabel-root": {
      color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
    },
    "& .MuiOutlinedInput-input": {
      color: isDarkMode ? "#fff" : "#000",
    },
  };

  const previewImage = selectedFile
    ? URL.createObjectURL(selectedFile)
    : sliderData.image;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={dialogStyle}
    >
      <DialogTitle sx={{ color: isDarkMode ? "#fff" : "#000" }}>
        {sliderId ? "Chỉnh Sửa Slider" : "Thêm Slider Mới"}
      </DialogTitle>

      <form onSubmit={handleFormSubmit}>
        <DialogContent>
          {errorMessage && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {errorMessage}
            </Typography>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                name="name"
                label="Tên Slider"
                value={sliderData.name}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                sx={inputStyle}
                error={!sliderData.name}
                helperText={!sliderData.name ? "Tên slider là bắt buộc" : ""}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="description"
                label="Mô Tả"
                value={sliderData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                sx={inputStyle}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                name="order"
                label="Thứ Tự"
                type="number"
                value={sliderData.order}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                InputProps={{ inputProps: { min: 0 } }}
                sx={inputStyle}
                error={sliderData.order === ""}
                helperText={sliderData.order === "" ? "Thứ tự là bắt buộc" : ""}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Hình ảnh slider *
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <Button
                    variant={imageSource === "file" ? "contained" : "outlined"}
                    onClick={() => handleImageSourceChange("file")}
                    startIcon={<FaUpload />}
                  >
                    Tải lên file
                  </Button>
                  <Button
                    variant={imageSource === "url" ? "contained" : "outlined"}
                    onClick={() => handleImageSourceChange("url")}
                    startIcon={<FaLink />}
                  >
                    Nhập URL
                  </Button>
                </Box>

                {imageSource === "file" && (
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    {selectedFile ? "Thay đổi ảnh" : "Chọn ảnh từ máy"}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </Button>
                )}

                {imageSource === "url" && (
                  <TextField
                    name="image-url"
                    label="URL hình ảnh"
                    value={imageUrl}
                    onChange={handleImageUrlChange}
                    fullWidth
                    variant="outlined"
                    sx={{ ...inputStyle, mb: 2 }}
                    error={imageSource === "url" && !imageUrl}
                    helperText={
                      imageSource === "url" && !imageUrl
                        ? "URL hình ảnh là bắt buộc"
                        : ""
                    }
                  />
                )}
              </Box>
            </Grid>

            {(previewImage || sliderData.image) && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Xem trước ảnh:
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    height: 200,
                    border: "1px solid",
                    borderColor: isDarkMode ? "rgba(255,255,255,0.3)" : "gray",
                    borderRadius: 1,
                    overflow: "hidden",
                    bgcolor: "rgba(0,0,0,0.05)",
                  }}
                >
                  <img
                    src={previewImage || sliderData.image}
                    alt="Ảnh xem trước"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={sliderData.isActive}
                    onChange={handleInputChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Hoạt động"
                sx={{ color: isDarkMode ? "#fff" : "#000" }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ padding: 2 }}>
          <Button
            onClick={onClose}
            disabled={isLoading}
            sx={{ color: isDarkMode ? "rgba(255,255,255,0.7)" : undefined }}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{
              backgroundColor: "#00aaff",
              "&:hover": { backgroundColor: "#0088cc" },
            }}
          >
            {isLoading ? "Đang Cập Nhật..." : "Lưu"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditSliderDialog;
