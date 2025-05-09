import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { toast } from "react-toastify";
import axios from "axios";

const ImageUpload = ({ onImageUpload, currentImage }) => {
  const [image, setImage] = useState(currentImage || "");
  const [loading, setLoading] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    // Kiểm tra định dạng file
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận file ảnh (JPEG, PNG, GIF)");
      return;
    }

    setLoading(true);

    try {
      // Chuyển file thành base64
      const base64 = await convertFileToBase64(file);

      const response = await axios.post(
        "http://localhost:4000/api/sliders",
        {
          image: base64,
          name: "Temporary Name", // Thêm các trường bắt buộc
          description: "Temporary Description",
          link: "#",
          order: 1,
          isActive: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.image) {
        setImage(response.data.image);
        onImageUpload(response.data.image);
        toast.success("Tải ảnh lên thành công");
      } else {
        throw new Error("Không nhận được URL ảnh từ server");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(
        "Lỗi khi tải ảnh lên: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <Box>
      <input
        accept="image/*"
        style={{ display: "none" }}
        id="image-upload"
        type="file"
        onChange={handleImageChange}
      />
      <label htmlFor="image-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUploadIcon />}
          disabled={loading}
        >
          {loading ? "Đang tải..." : "Chọn ảnh"}
        </Button>
      </label>

      {image && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Ảnh đã chọn:
          </Typography>
          <img
            src={image}
            alt="Preview"
            style={{
              maxWidth: "100%",
              maxHeight: 200,
              objectFit: "contain",
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default ImageUpload;
