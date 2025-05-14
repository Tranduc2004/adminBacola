import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  RadioGroup,
  FormLabel,
  Radio,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { editData, fetchDataFromApi } from "../../../utils/api";
import { useTheme } from "../../../context/ThemeContext";
import axios from "axios";
import { toast } from "react-toastify";

const EditProductDialog = ({
  open,
  handleClose,
  product,
  onProductUpdated,
}) => {
  const { isDarkMode } = useTheme();

  // State quản lý dữ liệu sản phẩm
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    brand: "",
    price: "",
    discount: "",
    category: "",
    countInStock: "",
    isFeatured: false,
    images: [], // Lưu trữ mảng URL Cloudinary
  });

  // State quản lý danh mục và thương hiệu
  const [productCategories, setProductCategories] = useState([]);
  const [productBrands, setProductBrands] = useState([]);

  // State quản lý loại input ảnh (URL hoặc file)
  const [imageInputMethod, setImageInputMethod] = useState("url");

  // State quản lý file ảnh được chọn
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  // State quản lý ảnh preview
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  // State quản lý trạng thái tải dữ liệu
  const [isLoading, setIsLoading] = useState(false);

  // State quản lý lỗi
  const [errorMessage, setErrorMessage] = useState("");

  // useEffect để tải danh mục và thương hiệu khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          fetchDataFromApi("/api/categories"),
          fetchDataFromApi("/api/brands"),
        ]);
        if (Array.isArray(categoriesData)) {
          setProductCategories(
            categoriesData.map((cat) => ({
              _id: cat._id,
              name: cat.name,
            }))
          );
        } else {
          console.error("Categories data is not an array:", categoriesData);
        }
        setProductBrands(brandsData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        setErrorMessage("Không thể tải danh mục hoặc thương hiệu.");
      }
    };
    fetchData();
  }, []);

  // useEffect để cập nhật dữ liệu sản phẩm khi `product` prop thay đổi
  useEffect(() => {
    if (product) {
      console.log("Product data:", product);
      setProductData({
        name: product.name || "",
        description: product.description || "",
        brand: product.brand?._id || product.brand || "",
        price: product.price?.toString() || "",
        discount: product.discount?.toString() || "0",
        category: product.category?._id || "",
        countInStock: product.countInStock?.toString() || "",
        isFeatured: product.isFeatured || false,
        images: product.images || [],
      });
      setImagePreviewUrl(product.images?.[0] || "");
    }
  }, [product]);

  // Hàm xử lý sự kiện thay đổi giá trị input
  const handleInputChange = (event) => {
    const { name, value, checked, type } = event.target;
    console.log(`Input change - ${name}:`, value);

    if (name === "category") {
      console.log("Selected category:", value);
    }

    // Kiểm tra giới hạn số lượng trong kho
    if (name === "countInStock") {
      const stockValue = Number(value);
      if (stockValue > 1000) {
        toast.error("Số lượng trong kho không được vượt quá 1000");
        return;
      }
    }

    setProductData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Hàm xử lý sự kiện thay đổi loại input ảnh
  const handleImageInputMethodChange = (event) => {
    setImageInputMethod(event.target.value);
    setImagePreviewUrl("");
    setSelectedImageFile(null);
    setProductData({ ...productData, images: [] });
  };

  // Hàm xử lý thêm URL ảnh mới
  const handleAddImageUrl = () => {
    setProductData({
      ...productData,
      images: [...productData.images, ""],
    });
  };

  // Hàm xử lý xóa URL ảnh
  const handleRemoveImageUrl = (index) => {
    const newImages = productData.images.filter((_, i) => i !== index);
    setProductData({
      ...productData,
      images: newImages,
    });
  };

  // Hàm xử lý thay đổi URL ảnh
  const handleImageUrlChange = (index, value) => {
    const newImages = [...productData.images];
    newImages[index] = value;
    setProductData({
      ...productData,
      images: newImages,
    });
    // Hiển thị preview ảnh đầu tiên
    if (index === 0) {
      setImagePreviewUrl(value);
    }
  };

  // Hàm xử lý sự kiện thay đổi file ảnh
  const handleImageFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  // Thay đổi hàm handleFormSubmit trong EditProductDialog
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!product?._id) {
      toast.error("Không tìm thấy ID sản phẩm");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // Kiểm tra dữ liệu bắt buộc
      if (!productData.name?.trim()) {
        throw new Error("Tên sản phẩm không được để trống");
      }
      if (!productData.category) {
        throw new Error("Vui lòng chọn danh mục sản phẩm");
      }
      if (!productData.price || Number(productData.price) <= 0) {
        throw new Error("Giá sản phẩm phải lớn hơn 0");
      }
      if (
        Number(productData.discount) < 0 ||
        Number(productData.discount) > 100
      ) {
        throw new Error("Giảm giá phải nằm trong khoảng 0-100%");
      }
      if (!productData.countInStock || Number(productData.countInStock) < 0) {
        throw new Error("Số lượng trong kho không được âm");
      }
      if (Number(productData.countInStock) > 1000) {
        throw new Error("Số lượng trong kho không được vượt quá 1000");
      }

      // Chuẩn bị dữ liệu cập nhật
      const updatedProductData = {
        name: productData.name.trim(),
        description: productData.description?.trim() || "",
        price: Number(productData.price),
        discount: Number(productData.discount),
        countInStock: Number(productData.countInStock),
        category: productData.category,
        isFeatured: Boolean(productData.isFeatured),
      };

      // Chỉ thêm brand nếu có giá trị
      if (productData.brand && productData.brand.trim() !== "") {
        updatedProductData.brand = productData.brand;
      }

      // Xử lý ảnh
      if (imageInputMethod === "url") {
        // Lọc bỏ các URL trống
        updatedProductData.images = productData.images.filter(
          (url) => url.trim() !== ""
        );
      } else if (selectedImageFile) {
        // Xử lý upload file ảnh
        const formData = new FormData();
        formData.append("file", selectedImageFile);
        formData.append("upload_preset", "your_upload_preset");

        const uploadResponse = await axios.post(
          "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
          formData
        );

        updatedProductData.images = [uploadResponse.data.secure_url];
      }

      // Gọi API cập nhật sản phẩm
      const response = await editData(
        `/api/products/${product._id}`,
        updatedProductData
      );

      if (response) {
        toast.success("Cập nhật sản phẩm thành công!");
        if (onProductUpdated) {
          onProductUpdated(response);
        }
        handleClose();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      setErrorMessage(error.message);
      toast.error(error.message || "Đã xảy ra lỗi khi cập nhật sản phẩm");
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

  const selectStyle = {
    ...inputStyle,
    "& .MuiSelect-icon": {
      color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.54)",
    },
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      sx={dialogStyle}
    >
      <DialogTitle sx={{ color: isDarkMode ? "#fff" : "#000" }}>
        Chỉnh Sửa Sản Phẩm
      </DialogTitle>
      <form onSubmit={handleFormSubmit}>
        <DialogContent>
          {errorMessage && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {errorMessage}
            </Typography>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                margin="dense"
                id="name"
                name="name"
                label="Tên Sản Phẩm"
                value={productData.name}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                sx={inputStyle}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel
                  sx={{
                    color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : undefined,
                  }}
                >
                  Thương Hiệu
                </InputLabel>
                <Select
                  name="brand"
                  value={productData.brand}
                  onChange={handleInputChange}
                  label="Thương Hiệu"
                  sx={selectStyle}
                >
                  <MenuItem
                    value=""
                    sx={{
                      color: isDarkMode ? "#fff" : "#000",
                      backgroundColor: isDarkMode ? "#1a2035" : "#fff",
                    }}
                  >
                    <em>Không có thương hiệu</em>
                  </MenuItem>
                  {productBrands.map((brand) => (
                    <MenuItem
                      key={brand._id}
                      value={brand._id}
                      sx={{
                        color: isDarkMode ? "#fff" : "#000",
                        backgroundColor: isDarkMode ? "#1a2035" : "#fff",
                        "&:hover": {
                          backgroundColor: isDarkMode
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.04)",
                        },
                      }}
                    >
                      {brand.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                margin="dense"
                id="price"
                name="price"
                label="Giá"
                type="number"
                value={productData.price}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                InputProps={{ inputProps: { min: 0 } }}
                sx={inputStyle}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="discount"
                name="discount"
                label="Giảm Giá (%)"
                type="number"
                value={productData.discount}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                InputProps={{ inputProps: { min: 0, max: 100 } }}
                helperText="Phần trăm giảm giá (0-100%)"
                sx={inputStyle}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                margin="dense"
                id="countInStock"
                name="countInStock"
                label="Số Lượng Trong Kho"
                type="number"
                value={productData.countInStock}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                InputProps={{ inputProps: { min: 0, max: 1000 } }}
                sx={inputStyle}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth margin="dense">
                <InputLabel
                  sx={{
                    color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : undefined,
                  }}
                >
                  Danh Mục *
                </InputLabel>
                <Select
                  required
                  name="category"
                  value={productData.category || ""}
                  onChange={(e) => {
                    console.log("Category change:", e.target.value);
                    handleInputChange(e);
                  }}
                  label="Danh Mục"
                  sx={selectStyle}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: isDarkMode ? "#1a2035" : "#fff",
                      },
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>Chọn danh mục</em>
                  </MenuItem>
                  {Array.isArray(productCategories) &&
                    productCategories.map((category) => (
                      <MenuItem
                        key={category._id}
                        value={category._id}
                        sx={{
                          color: isDarkMode ? "#fff" : "#000",
                          "&:hover": {
                            backgroundColor: isDarkMode
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(0, 0, 0, 0.04)",
                          },
                        }}
                      >
                        {category.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                margin="dense"
                id="description"
                name="description"
                label="Mô Tả"
                value={productData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                sx={inputStyle}
              />
            </Grid>

            <Grid item xs={12}>
              <FormLabel
                component="legend"
                sx={{
                  color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : undefined,
                }}
              >
                Phương Thức Nhập Ảnh
              </FormLabel>
              <RadioGroup
                row
                name="imageInputMethod"
                value={imageInputMethod}
                onChange={handleImageInputMethodChange}
              >
                <FormControlLabel
                  value="url"
                  control={
                    <Radio
                      sx={{
                        color: isDarkMode
                          ? "rgba(255, 255, 255, 0.7)"
                          : undefined,
                        "&.Mui-checked": {
                          color: isDarkMode ? "#90caf9" : "#1976d2",
                        },
                      }}
                    />
                  }
                  label="URL"
                  sx={{ color: isDarkMode ? "#fff" : "#000" }}
                />
                <FormControlLabel
                  value="file"
                  control={
                    <Radio
                      sx={{
                        color: isDarkMode
                          ? "rgba(255, 255, 255, 0.7)"
                          : undefined,
                        "&.Mui-checked": {
                          color: isDarkMode ? "#90caf9" : "#1976d2",
                        },
                      }}
                    />
                  }
                  label="Tải File Lên"
                  sx={{ color: isDarkMode ? "#fff" : "#000" }}
                />
              </RadioGroup>
            </Grid>

            {imageInputMethod === "url" ? (
              <Grid item xs={12}>
                {productData.images.map((url, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <TextField
                      margin="dense"
                      label={`URL Ảnh ${index + 1}`}
                      type="text"
                      value={url}
                      fullWidth
                      onChange={(e) =>
                        handleImageUrlChange(index, e.target.value)
                      }
                      sx={inputStyle}
                    />
                    <IconButton
                      onClick={() => handleRemoveImageUrl(index)}
                      sx={{
                        color: isDarkMode
                          ? "rgba(255, 255, 255, 0.7)"
                          : undefined,
                        mt: 1,
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddImageUrl}
                  sx={{
                    mt: 1,
                    color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : undefined,
                  }}
                >
                  Thêm URL Ảnh
                </Button>
              </Grid>
            ) : (
              <Grid item xs={12}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  style={{
                    color: isDarkMode ? "#fff" : "#000",
                    backgroundColor: "transparent",
                  }}
                />
              </Grid>
            )}

            {imagePreviewUrl && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Xem trước ảnh đầu tiên:
                </Typography>
                <img
                  src={imagePreviewUrl}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    marginTop: 10,
                    border: `1px solid ${
                      isDarkMode
                        ? "rgba(255, 255, 255, 0.2)"
                        : "rgba(0, 0, 0, 0.23)"
                    }`,
                  }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ padding: 2 }}>
          <Button
            onClick={handleClose}
            disabled={isLoading}
            sx={{
              color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : undefined,
            }}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
            sx={{
              backgroundColor: isDarkMode ? "#90caf9" : "#1976d2",
              "&:hover": {
                backgroundColor: isDarkMode ? "#42a5f5" : "#1565c0",
              },
            }}
          >
            {isLoading ? "Đang Cập Nhật..." : "Cập Nhật Sản Phẩm"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditProductDialog;
