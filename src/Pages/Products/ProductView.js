import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Breadcrumbs,
  Chip,
  Button,
  Rating,
  CircularProgress,
  Divider,
  Fade,
  Zoom,
  IconButton,
  Tooltip,
  TextField,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocalOffer as LocalOfferIcon,
  Inventory as InventoryIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  Business as BrandingIcon,
} from "@mui/icons-material";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import { viewData, getData, postData } from "../../utils/api";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const ProductView = () => {
  const { isDarkMode } = useCustomTheme();
  const { id } = useParams(); // Get product ID from URL
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [replyContents, setReplyContents] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminComment, setAdminComment] = useState("");
  const [adminRating, setAdminRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  // Fetch product data when component mounts or ID changes
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const productData = await viewData("/products/", id);
        setProduct(productData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load product data");
        setLoading(false);
        console.error(
          "Error fetching product:",
          err.response?.data || err.message
        );
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Lấy bình luận khi load sản phẩm
  useEffect(() => {
    if (product?._id) {
      getData(`/api/reviews/product/${product._id}`).then((res) => {
        setReviews(res.data);
      });
      // Kiểm tra quyền admin
      const adminInfo = JSON.parse(localStorage.getItem("admin_info") || "{}");
      // Kiểm tra cả admin và superadmin
      setIsAdmin(
        adminInfo?.role === "admin" || adminInfo?.role === "superadmin"
      );
    }
  }, [product]);

  // Handle back navigation
  const handleBack = () => {
    navigate("/products");
  };

  // Toggle favorite status
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const fetchReviews = async () => {
    try {
      const res = await getData(`/api/reviews/product/${product._id}`);
      setReviews(res.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleReply = async (reviewId) => {
    try {
      if (!isAdmin) {
        console.error("Bạn không có quyền phản hồi bình luận");
        return;
      }

      const adminInfo = JSON.parse(localStorage.getItem("admin_info") || "{}");
      if (
        !adminInfo?.role ||
        (adminInfo.role !== "admin" && adminInfo.role !== "superadmin")
      ) {
        alert("Bạn không có quyền phản hồi bình luận");
        return;
      }

      const response = await postData(`/api/reviews/${reviewId}/reply`, {
        content: replyContents[reviewId] || "",
      });

      if (response.success) {
        setReplyContents((prev) => ({ ...prev, [reviewId]: "" }));
        fetchReviews();
      }
    } catch (error) {
      console.error("Error replying to review:", error);
      alert(
        "Không thể gửi phản hồi. Vui lòng kiểm tra lại quyền truy cập của bạn."
      );
    }
  };

  const handleAdminComment = async () => {
    if (!isAdmin) {
      setError("Bạn không có quyền thêm bình luận");
      return;
    }

    if (!newComment.trim()) {
      setError("Vui lòng nhập nội dung bình luận");
      return;
    }

    try {
      const adminInfo = JSON.parse(localStorage.getItem("admin_info") || "{}");
      const response = await axios.post(
        `${API_URL}/reviews`,
        {
          productId: product._id,
          rating: 5, // Mặc định 5 sao cho bình luận admin
          comment: newComment,
          isAdminComment: true,
          adminRole: adminInfo.role,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          },
        }
      );

      if (response.data.success) {
        setNewComment("");
        setError("");
        // Cập nhật lại danh sách bình luận
        fetchReviews();
      }
    } catch (error) {
      setError(error.response?.data?.message || "Không thể thêm bình luận");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          bgcolor: isDarkMode ? "#0f1824" : "#f5f5f5",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography
          variant="h6"
          sx={{
            color: isDarkMode ? "#fff" : "#1a1a1a",
            mt: 2,
            fontWeight: 500,
          }}
        >
          Đang tải thông tin sản phẩm...
        </Typography>
      </Box>
    );
  }

  // Show error state
  if (error || !product) {
    return (
      <Box
        sx={{
          p: 3,
          bgcolor: isDarkMode ? "#0f1824" : "#f5f5f5",
          minHeight: "100vh",
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{
            mb: 2,
            bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#fff",
            color: isDarkMode ? "#fff" : "#1a1a1a",
            "&:hover": {
              bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "#f5f5f5",
            },
          }}
        >
          Quay lại danh sách sản phẩm
        </Button>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
            border: `1px solid ${
              isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0"
            }`,
            textAlign: "center",
          }}
        >
          <Typography
            variant="h5"
            color="error"
            sx={{ mb: 2, fontWeight: 500 }}
          >
            {error || "Không tìm thấy sản phẩm"}
          </Typography>
          <Typography
            sx={{
              color: isDarkMode
                ? "rgba(255, 255, 255, 0.7)"
                : "rgba(0, 0, 0, 0.6)",
              mb: 3,
            }}
          >
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </Typography>
          <Button
            variant="contained"
            onClick={handleBack}
            sx={{
              bgcolor: "#1976d2",
              "&:hover": {
                bgcolor: "#1565c0",
              },
            }}
          >
            Quay lại danh sách
          </Button>
        </Paper>
      </Box>
    );
  }

  // Format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format price with commas
  const formatPrice = (price) => {
    return price ? price.toLocaleString("vi-VN") : "0";
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        bgcolor: isDarkMode ? "#0f1824" : "#f5f5f5",
        minHeight: "100vh",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{
              mr: 2,
              bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#fff",
              color: isDarkMode ? "#fff" : "#1a1a1a",
              "&:hover": {
                bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "#f5f5f5",
              },
            }}
          >
            Quay lại
          </Button>
          <Typography
            variant="h5"
            sx={{
              color: isDarkMode ? "#fff" : "#1a1a1a",
              fontWeight: 600,
              flexGrow: 1,
            }}
          >
            Chi tiết sản phẩm
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Chỉnh sửa">
              <IconButton
                sx={{
                  bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#fff",
                  color: "#1976d2",
                  "&:hover": {
                    bgcolor: isDarkMode
                      ? "rgba(255, 255, 255, 0.2)"
                      : "#f5f5f5",
                  },
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Xóa">
              <IconButton
                sx={{
                  bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#fff",
                  color: "#f44336",
                  "&:hover": {
                    bgcolor: isDarkMode
                      ? "rgba(255, 255, 255, 0.2)"
                      : "#f5f5f5",
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Chia sẻ">
              <IconButton
                sx={{
                  bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#fff",
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                  "&:hover": {
                    bgcolor: isDarkMode
                      ? "rgba(255, 255, 255, 0.2)"
                      : "#f5f5f5",
                  },
                }}
              >
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}>
              <IconButton
                onClick={toggleFavorite}
                sx={{
                  bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#fff",
                  color: isFavorite
                    ? "#f44336"
                    : isDarkMode
                    ? "#fff"
                    : "#1a1a1a",
                  "&:hover": {
                    bgcolor: isDarkMode
                      ? "rgba(255, 255, 255, 0.2)"
                      : "#f5f5f5",
                  },
                }}
              >
                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Breadcrumbs
          separator="/"
          aria-label="breadcrumb"
          sx={{
            "& .MuiBreadcrumbs-separator": {
              color: isDarkMode
                ? "rgba(255, 255, 255, 0.5)"
                : "rgba(0, 0, 0, 0.4)",
            },
          }}
        >
          <Link
            to="/"
            style={{
              color: isDarkMode ? "#90caf9" : "#1976d2",
              textDecoration: "none",
              fontWeight: 500,
              transition: "all 0.2s",
              "&:hover": {
                color: isDarkMode ? "#64b5f6" : "#1565c0",
              },
            }}
          >
            Trang chủ
          </Link>
          <Link
            to="/products"
            style={{
              color: isDarkMode ? "#90caf9" : "#1976d2",
              textDecoration: "none",
              fontWeight: 500,
              transition: "all 0.2s",
              "&:hover": {
                color: isDarkMode ? "#64b5f6" : "#1565c0",
              },
            }}
          >
            Sản phẩm
          </Link>
          <Typography
            sx={{
              color: isDarkMode
                ? "rgba(255, 255, 255, 0.7)"
                : "rgba(0, 0, 0, 0.6)",
              fontWeight: 500,
            }}
          >
            {product.name}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Grid container spacing={3}>
        {/* Product Gallery */}
        <Grid item xs={12} md={6}>
          <Fade in={true} timeout={800}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
                border: `1px solid ${
                  isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0"
                }`,
                overflow: "hidden",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: isDarkMode
                    ? "0 8px 20px rgba(0, 0, 0, 0.3)"
                    : "0 8px 20px rgba(0, 0, 0, 0.1)",
                  transform: "translateY(-5px)",
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <LocalOfferIcon sx={{ color: "#1976d2" }} />
                Hình ảnh sản phẩm
              </Typography>
              <Box
                sx={{
                  border: `1px dashed ${
                    isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0"
                  }`,
                  borderRadius: 2,
                  p: 2,
                  mb: 2,
                  minHeight: 400,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#fff",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Zoom in={true} timeout={1000}>
                  <img
                    src={
                      product.images && product.images.length > 0
                        ? product.images[selectedImage]
                        : "https://via.placeholder.com/400"
                    }
                    alt={product.name}
                    style={{
                      maxWidth: "100%",
                      maxHeight: 400,
                      objectFit: "contain",
                      transition: "all 0.3s ease",
                    }}
                  />
                </Zoom>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  overflowX: "auto",
                  pb: 1,
                  "&::-webkit-scrollbar": {
                    height: 6,
                  },
                  "&::-webkit-scrollbar-track": {
                    bgcolor: isDarkMode
                      ? "rgba(255, 255, 255, 0.05)"
                      : "#f5f5f5",
                    borderRadius: 3,
                  },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: isDarkMode
                      ? "rgba(255, 255, 255, 0.2)"
                      : "#c0c0c0",
                    borderRadius: 3,
                  },
                }}
              >
                {product.images &&
                  product.images.map((image, index) => (
                    <Box
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      sx={{
                        border: `2px solid ${
                          selectedImage === index
                            ? "#1976d2"
                            : isDarkMode
                            ? "rgba(255, 255, 255, 0.1)"
                            : "#e0e0e0"
                        }`,
                        borderRadius: 1,
                        p: 0.5,
                        width: 80,
                        height: 80,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#fff",
                        "&:hover": {
                          borderColor: "#1976d2",
                          transform: "scale(1.05)",
                        },
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={image}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 2,
                        }}
                      />
                    </Box>
                  ))}
              </Box>
            </Paper>
          </Fade>
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Fade in={true} timeout={800} style={{ transitionDelay: "200ms" }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
                border: `1px solid ${
                  isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0"
                }`,
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: isDarkMode
                    ? "0 8px 20px rgba(0, 0, 0, 0.3)"
                    : "0 8px 20px rgba(0, 0, 0, 0.1)",
                  transform: "translateY(-5px)",
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <InventoryIcon sx={{ color: "#1976d2" }} />
                Thông tin sản phẩm
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 3,
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.9)"
                    : "rgba(0, 0, 0, 0.87)",
                  fontWeight: 600,
                  lineHeight: 1.3,
                }}
              >
                {product.name}
              </Typography>

              <Box
                sx={{
                  "& > div": { mb: 2.5 },
                  bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#f9f9f9",
                  p: 2,
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 100,
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.7)"
                        : "rgba(0, 0, 0, 0.6)",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <BrandingIcon fontSize="small" sx={{ color: "#1976d2" }} />
                    Thương hiệu
                  </Box>
                  <Typography
                    sx={{
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.5)"
                        : "rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    :
                  </Typography>
                  <Box
                    sx={{
                      ml: 2,
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                      fontWeight: 500,
                    }}
                  >
                    {product.brand
                      ? typeof product.brand === "object"
                        ? product.brand.name
                        : product.brand
                      : "N/A"}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 100,
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.7)"
                        : "rgba(0, 0, 0, 0.6)",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <CategoryIcon fontSize="small" sx={{ color: "#1976d2" }} />
                    Danh mục
                  </Box>
                  <Typography
                    sx={{
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.5)"
                        : "rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    :
                  </Typography>
                  <Box
                    sx={{
                      ml: 2,
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                      fontWeight: 500,
                    }}
                  >
                    {product.category
                      ? typeof product.category === "object"
                        ? product.category.name
                        : product.category
                      : "N/A"}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 100,
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.7)"
                        : "rgba(0, 0, 0, 0.6)",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <LocalOfferIcon
                      fontSize="small"
                      sx={{ color: "#1976d2" }}
                    />
                    Giá
                  </Box>
                  <Typography
                    sx={{
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.5)"
                        : "rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    :
                  </Typography>
                  <Box sx={{ ml: 2 }}>
                    <Typography
                      component="span"
                      sx={{
                        color: isDarkMode ? "#90caf9" : "#1976d2",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                      }}
                    >
                      {formatPrice(product.discountedPrice)} đ
                    </Typography>
                    {product.discount > 0 && (
                      <>
                        <Typography
                          component="span"
                          sx={{
                            ml: 1,
                            textDecoration: "line-through",
                            color: isDarkMode
                              ? "rgba(255, 255, 255, 0.5)"
                              : "rgba(0, 0, 0, 0.4)",
                          }}
                        >
                          {formatPrice(product.price)} đ
                        </Typography>
                        <Chip
                          label={`-${product.discount}%`}
                          size="small"
                          sx={{
                            ml: 1,
                            bgcolor: "#f44336",
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        />
                      </>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 100,
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.7)"
                        : "rgba(0, 0, 0, 0.6)",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <InventoryIcon fontSize="small" sx={{ color: "#1976d2" }} />
                    Kho hàng
                  </Box>
                  <Typography
                    sx={{
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.5)"
                        : "rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    :
                  </Typography>
                  <Box
                    sx={{
                      ml: 2,
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                      fontWeight: 500,
                    }}
                  >
                    ({product.countInStock}){" "}
                    {product.countInStock === 1 ? "Sản phẩm" : "Sản phẩm"}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 100,
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.7)"
                        : "rgba(0, 0, 0, 0.6)",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <StarIcon fontSize="small" sx={{ color: "#1976d2" }} />
                    Đánh giá
                  </Box>
                  <Typography
                    sx={{
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.5)"
                        : "rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    :
                  </Typography>
                  <Box
                    sx={{
                      ml: 2,
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                      fontWeight: 500,
                    }}
                  >
                    ({String(product.numReviews || 0).padStart(2, "0")}){" "}
                    {product.numReviews === 1 ? "Đánh giá" : "Đánh giá"}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 100,
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.7)"
                        : "rgba(0, 0, 0, 0.6)",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <StarIcon fontSize="small" sx={{ color: "#1976d2" }} />
                    Xếp hạng
                  </Box>
                  <Typography
                    sx={{
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.5)"
                        : "rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    :
                  </Typography>
                  <Box sx={{ ml: 2, display: "flex", alignItems: "center" }}>
                    <Rating
                      value={product.rating || 0}
                      precision={0.5}
                      readOnly
                      size="small"
                      sx={{
                        "& .MuiRating-iconFilled": {
                          color: "#fdd835",
                        },
                      }}
                    />
                    <Typography
                      sx={{
                        ml: 1,
                        color: isDarkMode ? "#fff" : "#1a1a1a",
                        fontWeight: 500,
                      }}
                    >
                      ({product.rating ? product.rating.toFixed(1) : "0.0"})
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 100,
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.7)"
                        : "rgba(0, 0, 0, 0.6)",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <CalendarIcon fontSize="small" sx={{ color: "#1976d2" }} />
                    Ngày đăng
                  </Box>
                  <Typography
                    sx={{
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.5)"
                        : "rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    :
                  </Typography>
                  <Box
                    sx={{
                      ml: 2,
                      color: isDarkMode ? "#fff" : "#1a1a1a",
                      fontWeight: 500,
                    }}
                  >
                    {formatDate(product.dateCreated)}
                  </Box>
                </Box>

                {product.isFeatured && (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 100,
                        color: isDarkMode
                          ? "rgba(255, 255, 255, 0.7)"
                          : "rgba(0, 0, 0, 0.6)",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <StarIcon fontSize="small" sx={{ color: "#1976d2" }} />
                      Nổi bật
                    </Box>
                    <Typography
                      sx={{
                        color: isDarkMode
                          ? "rgba(255, 255, 255, 0.5)"
                          : "rgba(0, 0, 0, 0.4)",
                      }}
                    >
                      :
                    </Typography>
                    <Box sx={{ ml: 2 }}>
                      <Chip
                        label="NỔI BẬT"
                        size="small"
                        sx={{
                          bgcolor: "#f44336",
                          color: "#fff",
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>

              <Box
                sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}
              ></Box>
            </Paper>
          </Fade>
        </Grid>
      </Grid>

      {/* Product Description */}
      <Fade in={true} timeout={800} style={{ transitionDelay: "400ms" }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mt: 3,
            borderRadius: 2,
            bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
            border: `1px solid ${
              isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0"
            }`,
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: isDarkMode
                ? "0 8px 20px rgba(0, 0, 0, 0.3)"
                : "0 8px 20px rgba(0, 0, 0, 0.1)",
              transform: "translateY(-5px)",
            },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: isDarkMode ? "#fff" : "#1a1a1a",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <LocalOfferIcon sx={{ color: "#1976d2" }} />
            Mô tả sản phẩm
          </Typography>
          <Divider sx={{ mb: 3, opacity: 0.2 }} />
          <Typography
            sx={{
              color: isDarkMode
                ? "rgba(255, 255, 255, 0.7)"
                : "rgba(0, 0, 0, 0.6)",
              lineHeight: 1.8,
              fontSize: "1.05rem",
            }}
          >
            {product.description}
          </Typography>
        </Paper>
      </Fade>

      {/* Rating Analytics (only show if there are reviews) */}
      {product.numReviews > 0 && (
        <Fade in={true} timeout={800} style={{ transitionDelay: "600ms" }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mt: 3,
              borderRadius: 2,
              bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
              border: `1px solid ${
                isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0"
              }`,
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: isDarkMode
                  ? "0 8px 20px rgba(0, 0, 0, 0.3)"
                  : "0 8px 20px rgba(0, 0, 0, 0.1)",
                transform: "translateY(-5px)",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                color: isDarkMode ? "#fff" : "#1a1a1a",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <StarIcon sx={{ color: "#1976d2" }} />
              Phân tích đánh giá
            </Typography>
            <Divider sx={{ mb: 3, opacity: 0.2 }} />
            <Grid container spacing={4}>
              {/* Left side - Rating bars */}
              <Grid item xs={12} md={8}>
                {[
                  { star: 5, count: 22, percentage: 60 },
                  { star: 4, count: 6, percentage: 40 },
                  { star: 3, count: 5, percentage: 20 },
                  { star: 2, count: 3, percentage: 10 },
                  { star: 1, count: 2, percentage: 5 },
                ].map((rating) => (
                  <Box
                    key={rating.star}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        width: 60,
                        color: isDarkMode
                          ? "rgba(255, 255, 255, 0.7)"
                          : "rgba(0, 0, 0, 0.6)",
                        fontWeight: 500,
                      }}
                    >
                      {rating.star} Sao
                    </Typography>
                    <Box
                      sx={{
                        flex: 1,
                        mx: 2,
                        height: 10,
                        borderRadius: 5,
                        bgcolor: isDarkMode
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(0, 0, 0, 0.08)",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${rating.percentage}%`,
                          height: "100%",
                          bgcolor: "#fdd835",
                          borderRadius: 5,
                          transition: "width 1s ease-in-out",
                        }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        width: 40,
                        color: isDarkMode
                          ? "rgba(255, 255, 255, 0.7)"
                          : "rgba(0, 0, 0, 0.6)",
                        textAlign: "right",
                        fontWeight: 500,
                      }}
                    >
                      ({String(rating.count).padStart(2, "0")})
                    </Typography>
                  </Box>
                ))}
              </Grid>

              {/* Right side - Average rating */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    textAlign: "center",
                    borderLeft: {
                      md: `1px solid ${
                        isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0"
                      }`,
                    },
                    pl: { md: 4 },
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 2,
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.9)"
                        : "rgba(0, 0, 0, 0.87)",
                      fontWeight: 500,
                    }}
                  >
                    Tổng số đánh giá ({product.numReviews})
                  </Typography>
                  <Typography
                    variant="h2"
                    sx={{
                      mb: 1,
                      fontWeight: "bold",
                      color: isDarkMode ? "#90caf9" : "#1976d2",
                    }}
                  >
                    {product.rating ? product.rating.toFixed(1) : "0.0"}
                  </Typography>
                  <Rating
                    value={product.rating || 0}
                    precision={0.5}
                    readOnly
                    sx={{
                      mb: 1,
                      "& .MuiRating-iconFilled": {
                        color: "#fdd835",
                      },
                    }}
                  />
                  <Typography
                    sx={{
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.7)"
                        : "rgba(0, 0, 0, 0.6)",
                    }}
                  >
                    Xếp hạng trung bình
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Fade>
      )}

      {/* Customer Reviews section */}
      <Box sx={{ mt: 4 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            color: isDarkMode ? "#fff" : "#1a1a1a",
            fontWeight: 600,
          }}
        >
          Bình luận của khách hàng
        </Typography>
        {isAdmin && (
          <Paper
            sx={{
              p: 2,
              mb: 3,
              bgcolor: isDarkMode ? "rgba(255,255,255,0.04)" : "#fafafa",
            }}
          >
            <Typography sx={{ fontWeight: 500, mb: 1 }}>
              Thêm bình luận với tư cách{" "}
              {JSON.parse(localStorage.getItem("admin_info") || "{}")?.role ===
              "superadmin"
                ? "Super Admin"
                : "Quản trị viên"}
              :
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Rating
                value={adminRating}
                onChange={(_, value) => setAdminRating(value || 5)}
              />
              <TextField
                fullWidth
                size="small"
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Nhập nội dung bình luận..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "#fff",
                    "& fieldset": {
                      borderColor: isDarkMode
                        ? "rgba(255,255,255,0.1)"
                        : "#e0e0e0",
                    },
                    "&:hover fieldset": {
                      borderColor: isDarkMode
                        ? "rgba(255,255,255,0.2)"
                        : "#bdbdbd",
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleAdminComment}
                disabled={!adminComment.trim()}
                sx={{
                  bgcolor:
                    JSON.parse(localStorage.getItem("admin_info") || "{}")
                      ?.role === "superadmin"
                      ? "#f44336"
                      : "#1976d2",
                  "&:hover": {
                    bgcolor:
                      JSON.parse(localStorage.getItem("admin_info") || "{}")
                        ?.role === "superadmin"
                        ? "#d32f2f"
                        : "#1565c0",
                  },
                }}
              >
                Gửi
              </Button>
            </Box>
          </Paper>
        )}
        {reviews.length === 0 && (
          <Typography sx={{ color: isDarkMode ? "#aaa" : "#888" }}>
            Chưa có bình luận nào cho sản phẩm này.
          </Typography>
        )}
        {reviews.map((review) => (
          <Paper
            key={review._id}
            sx={{
              p: 2,
              mb: 2,
              bgcolor: isDarkMode ? "rgba(255,255,255,0.04)" : "#fafafa",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  color: isDarkMode ? "#90caf9" : "#1976d2",
                }}
              >
                {review.user?.name || "Người dùng"}
              </Typography>
              <Rating
                value={review.rating}
                readOnly
                size="small"
                sx={{ ml: 1 }}
              />
              <Typography
                sx={{
                  ml: 2,
                  color: isDarkMode ? "#aaa" : "#888",
                  fontSize: 13,
                }}
              >
                {new Date(review.date).toLocaleString("vi-VN")}
              </Typography>
            </Box>
            <Typography sx={{ mb: 1 }}>{review.comment}</Typography>

            {/* Hiển thị tất cả phản hồi admin */}
            {Array.isArray(review.adminReplies) &&
              review.adminReplies.length > 0 && (
                <Box sx={{ ml: 2, mt: 1 }}>
                  {review.adminReplies.map((reply, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        mb: 1,
                        p: 1.5,
                        bgcolor: isDarkMode
                          ? "rgba(33,150,243,0.08)"
                          : "#e3f2fd",
                        borderRadius: 1,
                      }}
                    >
                      <Typography sx={{ fontWeight: 500, color: "#1976d2" }}>
                        Phản hồi từ quản trị viên
                        {reply.admin && reply.admin.name
                          ? ` (${reply.admin.name})`
                          : ""}
                        :
                      </Typography>
                      <Typography
                        sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                      >
                        {reply.content}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: isDarkMode ? "#aaa" : "#888",
                        }}
                      >
                        {reply.createdAt
                          ? new Date(reply.createdAt).toLocaleString("vi-VN")
                          : ""}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

            {/* Form phản hồi cho mỗi bình luận - chỉ hiển thị cho admin */}
            {isAdmin && (
              <Box sx={{ mt: 2, ml: 2 }}>
                <Typography
                  sx={{
                    fontWeight: 500,
                    mb: 1,
                    color: isDarkMode ? "#90caf9" : "#1976d2",
                  }}
                >
                  Phản hồi bình luận:
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={replyContents[review._id] || ""}
                    onChange={(e) =>
                      setReplyContents({
                        ...replyContents,
                        [review._id]: e.target.value,
                      })
                    }
                    placeholder="Nhập nội dung phản hồi..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "#fff",
                        "& fieldset": {
                          borderColor: isDarkMode
                            ? "rgba(255,255,255,0.1)"
                            : "#e0e0e0",
                        },
                        "&:hover fieldset": {
                          borderColor: isDarkMode
                            ? "rgba(255,255,255,0.2)"
                            : "#bdbdbd",
                        },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleReply(review._id)}
                    disabled={
                      !replyContents[review._id] ||
                      replyContents[review._id].trim() === ""
                    }
                    sx={{
                      bgcolor: "#1976d2",
                      "&:hover": {
                        bgcolor: "#1565c0",
                      },
                    }}
                  >
                    Gửi
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default ProductView;
