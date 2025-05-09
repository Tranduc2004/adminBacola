import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Stack,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Tab,
  Tabs,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LinkIcon from "@mui/icons-material/Link";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTheme } from "../../context/ThemeContext";
import { postData, fetchDataFromApi } from "../../utils/api"; // Import your actual API functions
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProductUpload = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]); // To store URL sources
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [imageInputTab, setImageInputTab] = useState(0); // 0 for file upload, 1 for URL
  const [urlInput, setUrlInput] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    richDescription: "",
    brand: "",
    price: "",
    discount: "",
    countInStock: "",
    category: "",
    isFeatured: false,
    rating: 0,
    numReviews: 0,
  });

  // Fetch categories and brands on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetchDataFromApi("/api/categories");
        setCategories(categoriesResponse);

        // Fetch brands
        const brandsResponse = await fetchDataFromApi("/api/brands");
        setBrands(brandsResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Không thể tải dữ liệu danh mục và thương hiệu");
      } finally {
        setLoadingCategories(false);
        setLoadingBrands(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Thêm validation cho countInStock
    if (name === "countInStock") {
      const count = parseInt(value);
      if (count > 1000) {
        toast.error("Số lượng sản phẩm không được vượt quá 1000");
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Store the actual files for later upload
    setImageFiles((prevFiles) => [...prevFiles, ...files]);

    // Create preview URLs for display
    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setSelectedImages((prev) => [...prev, ...newImageUrls]);

    // Track source type (all are 'file' in this case)
    setImageUrls((prev) => [...prev, ...Array(files.length).fill("file")]);
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim()) {
      return;
    }

    // Validate URL
    try {
      new URL(urlInput);
    } catch (error) {
      toast.error("Vui lòng nhập URL hợp lệ");
      return;
    }

    // Add the URL to the selected images
    setSelectedImages((prev) => [...prev, urlInput]);
    setImageUrls((prev) => [...prev, "url"]);
    setUrlInput("");
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImageUrls((prev) => prev.filter((_, i) => i !== index));

    // Remove from imageFiles if it's a file type
    if (imageUrls[index] === "file") {
      const fileIndex = imageUrls
        .slice(0, index)
        .filter((type) => type === "file").length;
      setImageFiles((prev) => {
        const newFiles = [...prev];
        newFiles.splice(fileIndex, 1);
        return newFiles;
      });
    }

    // Adjust selected index if needed
    if (selectedImageIndex === index) {
      setSelectedImageIndex(0);
    } else if (selectedImageIndex > index) {
      setSelectedImageIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields = [
      "name",
      "description",
      "price",
      "countInStock",
      "category",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0 || selectedImages.length === 0) {
      toast.error(
        `Vui lòng điền đầy đủ thông tin${
          selectedImages.length === 0 ? " và thêm ít nhất một hình ảnh" : ""
        }`
      );
      return;
    }

    // Validate countInStock
    if (parseInt(formData.countInStock) > 1000) {
      toast.error("Số lượng sản phẩm không được vượt quá 1000");
      return;
    }

    setLoading(true);
    try {
      // Xử lý hình ảnh
      const processedImages = await Promise.all(
        selectedImages.map(async (image, index) => {
          if (imageUrls[index] === "url") {
            return image;
          } else {
            const fileIndex = imageUrls
              .slice(0, index)
              .filter((type) => type === "file").length;
            const file = imageFiles[fileIndex];

            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const base64String = reader.result;
                resolve(base64String);
              };
              reader.onerror = (error) => reject(error);
              reader.readAsDataURL(file);
            });
          }
        })
      );

      // Chuẩn bị dữ liệu sản phẩm
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        richDescription: formData.richDescription.trim(),
        brand: formData.brand || undefined,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount),
        category: formData.category,
        countInStock: parseInt(formData.countInStock),
        isFeatured: formData.isFeatured,
        images: processedImages,
      };

      console.log("Dữ liệu sản phẩm trước khi gửi:", {
        ...productData,
        images: `${productData.images.length} images`,
      });

      // Gửi dữ liệu lên server
      const response = await postData("/api/products", productData);

      if (response.success) {
        toast.success("Thêm sản phẩm thành công!");

        // Reset form
        setFormData({
          name: "",
          description: "",
          richDescription: "",
          brand: "",
          price: "",
          discount: "",
          countInStock: "",
          category: "",
          isFeatured: false,
        });
        setSelectedImages([]);
        setImageFiles([]);
        setImageUrls([]);

        // Chuyển hướng về trang ProductList
        navigate("/products");
      } else {
        throw new Error(response.message || "Thêm sản phẩm thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      toast.error(`Lỗi: ${error.message || "Không thể thêm sản phẩm"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setImageInputTab(newValue);
  };

  return (
    <Box
      sx={{
        bgcolor: isDarkMode ? "#0f1824" : "#f5f5f5",
        color: isDarkMode ? "#fff" : "#000",
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
          <h1>Product Upload</h1>
          <div className="breadcrumbs">
            <Link to="/" className="breadcrumb-link">
              Home
            </Link>
            <span className="separator">~</span>
            <Link to="/products" className="breadcrumb-link">
              Product
            </Link>
            <span className="separator">~</span>
            <span>Product Upload</span>
          </div>
        </div>
        <Stack spacing={4}>
          {/* Basic Information Section */}
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
                Basic Information
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.6)"
                    : "rgba(0, 0, 0, 0.6)",
                }}
              >
                * Required fields
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="NAME *"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
              required
            />

            <TextField
              fullWidth
              multiline
              rows={6}
              label="DESCRIPTION *"
              name="description"
              value={formData.description}
              onChange={handleChange}
              sx={{
                mb: 4,
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
              required
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="RICH DESCRIPTION (OPTIONAL)"
              name="richDescription"
              value={formData.richDescription}
              onChange={handleChange}
              sx={{
                mb: 4,
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

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel
                sx={{
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.6)",
                }}
              >
                CATEGORY *
              </InputLabel>
              <Select
                name="category"
                value={formData.category || ""}
                onChange={handleChange}
                sx={{
                  bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                  height: "56px",
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                }}
                required
              >
                <MenuItem value="">
                  <em>Chọn danh mục</em>
                </MenuItem>
                {loadingCategories ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} />
                  </MenuItem>
                ) : (
                  categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 4 }}>
              <InputLabel
                sx={{
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.6)",
                }}
              >
                BRAND
              </InputLabel>
              <Select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                sx={{
                  bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                  height: "56px",
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {loadingBrands ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} />
                  </MenuItem>
                ) : (
                  brands.map((brand) => (
                    <MenuItem key={brand._id} value={brand._id}>
                      {brand.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="PRICE *"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{
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
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="DISCOUNT (%)"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  InputProps={{
                    inputProps: {
                      min: 0,
                      max: 100,
                    },
                  }}
                  helperText="Phần trăm giảm giá (0-100%)"
                  sx={{
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
                    "& .MuiFormHelperText-root": {
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.5)"
                        : "rgba(0, 0, 0, 0.5)",
                      marginLeft: 0,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="COUNT IN STOCK *"
                  name="countInStock"
                  value={formData.countInStock}
                  onChange={handleChange}
                  InputProps={{
                    inputProps: {
                      min: 0,
                      max: 1000,
                    },
                  }}
                  helperText="Số lượng tối đa là 1000"
                  sx={{
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
                    "& .MuiFormHelperText-root": {
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.5)"
                        : "rgba(0, 0, 0, 0.5)",
                      marginLeft: 0,
                    },
                  }}
                  required
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    name="isFeatured"
                    sx={{
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.5)"
                        : "rgba(0, 0, 0, 0.3)",
                      "&.Mui-checked": {
                        color: "#0858f7",
                      },
                    }}
                  />
                }
                label="Featured Product"
                sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
              />
            </Box>
          </Box>

          {/* Media Section */}
          <Box sx={{ mt: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
                border: `1px solid ${
                  isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0"
                }`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: isDarkMode ? "#fff" : "#1a1a1a",
                    fontWeight: 500,
                  }}
                >
                  Media *
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.6)"
                      : "rgba(0, 0, 0, 0.6)",
                  }}
                >
                  At least one image required
                </Typography>
              </Box>

              {/* Images Preview Grid */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {selectedImages.map((image, index) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                    <Paper
                      sx={{
                        position: "relative",
                        p: 1,
                        border: `2px solid ${
                          index === selectedImageIndex
                            ? "#0858f7"
                            : "transparent"
                        }`,
                        borderRadius: 1,
                        cursor: "pointer",
                        "&:hover": {
                          borderColor: "#0858f7",
                        },
                      }}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/150?text=Error+Loading+Image";
                        }}
                      />
                      {index === selectedImageIndex && (
                        <CheckCircleIcon
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: "#0858f7",
                          }}
                        />
                      )}
                      {imageUrls[index] === "url" && (
                        <LinkIcon
                          sx={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            color: "#0858f7",
                            fontSize: 18,
                            bgcolor: "rgba(255,255,255,0.7)",
                            borderRadius: "50%",
                            padding: "2px",
                          }}
                        />
                      )}
                      <Button
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          right: 8,
                          minWidth: 0,
                          backgroundColor: "rgba(0,0,0,0.5)",
                          color: "#fff",
                          "&:hover": {
                            backgroundColor: "rgba(0,0,0,0.7)",
                          },
                        }}
                      >
                        ✕
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Image Input Tabs */}
              <Box sx={{ mb: 2 }}>
                <Tabs
                  value={imageInputTab}
                  onChange={handleTabChange}
                  sx={{
                    borderBottom: 1,
                    borderColor: isDarkMode
                      ? "rgba(255,255,255,0.1)"
                      : "divider",
                    "& .MuiTab-root": {
                      color: isDarkMode
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(0,0,0,0.5)",
                    },
                    "& .Mui-selected": {
                      color: "#0858f7 !important",
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: "#0858f7",
                    },
                  }}
                >
                  <Tab
                    icon={<CloudUploadIcon />}
                    label="Upload File"
                    iconPosition="start"
                  />
                  <Tab
                    icon={<LinkIcon />}
                    label="Image URL"
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              {/* Tab Panels */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f5f5f5",
                  borderRadius: 1,
                  mb: 3,
                }}
              >
                {imageInputTab === 0 ? (
                  // File Upload Tab
                  <Paper
                    component="label"
                    sx={{
                      p: 3,
                      border: `2px dashed ${
                        isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0"
                      }`,
                      borderRadius: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      bgcolor: "transparent",
                      "&:hover": {
                        borderColor: "#0858f7",
                        "& .upload-icon": {
                          color: "#0858f7",
                        },
                      },
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={handleImageUpload}
                    />
                    <CloudUploadIcon
                      className="upload-icon"
                      sx={{
                        fontSize: 40,
                        color: isDarkMode
                          ? "rgba(255, 255, 255, 0.5)"
                          : "rgba(0, 0, 0, 0.3)",
                        mb: 1,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: isDarkMode
                          ? "rgba(255, 255, 255, 0.5)"
                          : "rgba(0, 0, 0, 0.3)",
                        textAlign: "center",
                      }}
                    >
                      Click to select files or drag and drop
                    </Typography>
                  </Paper>
                ) : (
                  // URL Input Tab
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <TextField
                      fullWidth
                      placeholder="Enter image URL"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.3)" : "#fff",
                          "& fieldset": {
                            borderColor: isDarkMode
                              ? "rgba(255, 255, 255, 0.2)"
                              : "rgba(0, 0, 0, 0.2)",
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: isDarkMode ? "#fff" : "#1a1a1a",
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleUrlAdd}
                      sx={{
                        ml: 2,
                        bgcolor: "#0858f7",
                        color: "#fff",
                        "&:hover": {
                          bgcolor: "#0646c6",
                        },
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                )}
              </Box>

              <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
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
                        : "#cccccc",
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.5)"
                        : "#666666",
                    },
                    borderRadius: 1,
                    textTransform: "uppercase",
                    fontWeight: 500,
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress
                        size={20}
                        sx={{ mr: 1, color: "#fff" }}
                      />
                      Publishing...
                    </>
                  ) : (
                    "Publish Product"
                  )}
                </Button>
              </Box>
            </Paper>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ProductUpload;
