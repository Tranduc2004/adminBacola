import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Pagination from "@mui/material/Pagination";
import { fetchDataFromApi, deleteData } from "../../utils/api";
import EditProductDialog from "./EditProductDialog";
import "./styles.css";

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Edit Dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const navigate = useNavigate();

  // Fetch products and related data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      // Fetch products
      const productsData = await fetchDataFromApi("/api/products");
      const productsArray = Array.isArray(productsData[0])
        ? productsData[0]
        : productsData;

      // Fetch brands
      const brandsData = await fetchDataFromApi("/api/brands");
      setBrands(brandsData);

      // Create brands map
      const brandsMap = {};
      brandsData.forEach((brand) => {
        brandsMap[brand._id] = brand.name;
      });

      // Map products with brand names
      const productsWithBrands = productsArray.map((product) => {
        let brandName = "No Brand";
        let brandId = null;

        if (product.brand) {
          if (typeof product.brand === "object" && product.brand.name) {
            brandName = product.brand.name;
            brandId = product.brand._id;
          } else if (typeof product.brand === "string") {
            brandName = brandsMap[product.brand] || "No Brand";
            brandId = product.brand;
          }
        }

        return {
          ...product,
          brandName,
          brandId,
        };
      });

      setProducts(productsWithBrands);
      setLoading(false);
    } catch (err) {
      setError("Failed to load data");
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchAllData();

    const getCategories = async () => {
      try {
        const data = await fetchDataFromApi("/api/categories");
        setCategories(data);
      } catch (err) {
        // Đã bỏ console.error debug
      }
    };

    getCategories();
  }, []);

  // Handle delete product
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteData("/api/products/", id);
        fetchAllData(); // Refresh all data
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Failed to delete product");
      }
    }
  };

  // Handle open edit dialog
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  // Handle close edit dialog
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedProduct(null);
  };

  // Handle product update
  const handleProductUpdated = (updatedProduct) => {
    // Update the product in the local state
    setProducts(
      products.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
  };

  // Handle view product
  const handleView = (id) => {
    navigate(`/products/${id}`);
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchQuery ||
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product._id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !categoryFilter || product.category?._id === categoryFilter;

    // Xử lý nhiều trường hợp cấu trúc brand
    let brandId = null;
    if (product.brand) {
      if (typeof product.brand === "object" && product.brand._id) {
        brandId = product.brand._id;
      } else if (typeof product.brand === "string") {
        brandId = product.brand;
      }
    }

    const matchesBrand = !brandFilter || brandId === brandFilter;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  // Pagination calculation
  const indexOfLastProduct = page * rowsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - rowsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const pageCount = Math.ceil(filteredProducts.length / rowsPerPage);

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading)
    return <div className="loading-indicator">Loading products...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="product-table-container">
      <div className="table-header-section">
        <h3>Product Management</h3>
        <div className="table-filters">
          <div className="filter-group">
            <label>SHOW BY</label>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value="12">12 Row</option>
              <option value="24">24 Row</option>
              <option value="36">36 Row</option>
            </select>
          </div>

          <div className="filter-group">
            <label>CATEGORY BY</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>BRAND BY</label>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand._id} value={brand._id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>SEARCH BY</label>
            <input
              type="text"
              placeholder="id / name / category / brand"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="product-table">
          <thead>
            <tr>
              <th>UID</th>
              <th>PRODUCT</th>
              <th>CATEGORY</th>
              <th>BRAND</th>
              <th>PRICE</th>
              <th>DISCOUNT</th>
              <th>STOCK</th>
              <th>RATING</th>
              <th>FEATURED</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <tr key={product._id}>
                  <td>#{product._id.substring(0, 6)}</td>
                  <td>
                    <div className="product-info">
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/50";
                        }}
                      />
                      <div>
                        <div className="product-name">{product.name}</div>
                        <div className="product-description">
                          {product.description?.length > 30
                            ? `${product.description.substring(0, 30)}...`
                            : product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{product.category?.name || "Unknown"}</td>
                  <td>{product.brandName}</td>
                  <td>
                    <div className="price-container">
                      <span className="sale-price">
                        ${product.discountedPrice?.toLocaleString()}
                      </span>
                      {product.discount > 0 && (
                        <>
                          <span className="original-price">
                            ${product.price?.toLocaleString()}
                          </span>
                          <span className="discount-badge">
                            -{product.discount}%
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td>
                    {product.discount > 0 ? (
                      <span className="discount-value">
                        {product.discount}%
                      </span>
                    ) : (
                      <span className="no-discount">-</span>
                    )}
                  </td>
                  <td>{product.countInStock}</td>
                  <td>
                    <div className="rating">
                      <FaStar className="star-icon" />
                      <span>{product.rating}</span>
                      <span className="rating-count">
                        ({product.numReviews})
                      </span>
                    </div>
                  </td>
                  <td>{product.isFeatured ? "Yes" : "No"}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="view-btn"
                        onClick={() => handleView(product._id)}
                        title="View product details"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(product)}
                        title="Edit product"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(product._id)}
                        title="Delete product"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="no-products">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="showing-info">
          Showing {filteredProducts.length > 0 ? indexOfFirstProduct + 1 : 0}-
          {Math.min(indexOfLastProduct, filteredProducts.length)} of{" "}
          {filteredProducts.length} results
        </div>
        <div className="pagination">
          <Pagination
            count={pageCount}
            page={page}
            color="primary"
            onChange={handlePageChange}
          />
        </div>
      </div>

      {/* Edit Product Dialog */}
      <EditProductDialog
        open={editDialogOpen}
        handleClose={handleCloseEditDialog}
        product={selectedProduct}
        onProductUpdated={handleProductUpdated}
      />
    </div>
  );
};

export default ProductTable;
