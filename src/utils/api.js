// api.js - Updated version

import axios from "axios";

// Create a base axios instance with consistent configuration
export const apiClient = axios.create({
  baseURL: "https://bacola.onrender.com",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  timeout: 30000, // Tăng timeout lên 30 giây
});

// Intercept requests to ensure token is always set from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server trả về response với status code nằm ngoài range 2xx
      console.error("Response error:", error.response.data);
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error("Request error:", error.request);
    } else {
      // Có lỗi khi setting up request
      console.error("Error:", error.message);
    }

    if (error.response?.status === 401) {
      const requestUrl = error.config.url;
      if (!requestUrl.includes("/login") && !requestUrl.includes("/register")) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_info");
      }
    }
    return Promise.reject(error);
  }
);

// Thêm hàm để lưu token
export const setAuthToken = (token) => {
  if (token) {
    // Lưu token vào localStorage
    localStorage.setItem("admin_token", token);

    // Lưu thông tin admin đầy đủ hơn
    const adminInfo = JSON.parse(localStorage.getItem("admin_info") || "{}");
    adminInfo.token = token;
    localStorage.setItem("admin_info", JSON.stringify(adminInfo));

    // Thiết lập token trong header của axios
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    // Xóa token khỏi localStorage
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_info");

    // Xóa token khỏi header của axios
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

// Hàm kiểm tra token
export const checkToken = () => {
  return !!localStorage.getItem("admin_token");
};

// Hàm login
export const loginAdmin = async (credentials) => {
  try {
    const { data } = await apiClient.post("/api/admin/login", credentials);
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  } catch (error) {
    throw error;
  }
};

// Hàm logout
export const logoutAdmin = async () => {
  try {
    const token = localStorage.getItem("admin_token");
    if (token) {
      await apiClient.post("/api/admin/logout", {});
    }
    setAuthToken(null);
    return true;
  } catch (error) {
    setAuthToken(null);
    throw error;
  }
};

export const fetchDataFromApi = async (url) => {
  try {
    const { data } = await apiClient.get(url);
    return data;
  } catch (error) {
    throw error;
  }
};

export const postData = async (url, formData) => {
  try {
    const response = await apiClient.post(url, formData);
    return response.data; // Trả về dữ liệu từ phản hồi
  } catch (error) {
    throw new Error(`Failed to post data to ${url}: ${error.message}`); // Ném lỗi có thông báo chi tiết
  }
};

export const editData = async (url, updatedData) => {
  try {
    const response = await apiClient.put(url, updatedData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      setAuthToken(null);
      window.location.href = "/login";
      return;
    }

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error(`Không thể cập nhật dữ liệu: ${error.message}`);
  }
};

export const deleteData = async (url) => {
  try {
    const response = await apiClient.delete(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const viewData = async (url, id) => {
  try {
    const apiUrl = url.endsWith("/") ? `/api${url}${id}` : `/api${url}/${id}`;
    const { data } = await apiClient.get(apiUrl);
    return data;
  } catch (error) {
    throw error;
  }
};

// Hàm đăng ký admin
export const registerAdmin = async (adminData) => {
  try {
    const { data } = await apiClient.post("/api/admin/register", adminData);

    if (data.token) {
      setAuthToken(data.token);
    }

    return data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw error;
  }
};

// User Management APIs
export const fetchUsersApi = async (
  page = 1,
  search = "",
  role = "all",
  status = "all"
) => {
  try {
    const response = await apiClient.get(`/api/admin/users`, {
      params: { page, limit: 10, search, role, status },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchUserDetailApi = async (userId) => {
  try {
    const response = await apiClient.get(`/api/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Lấy lịch sử đơn hàng của user (dùng cho UserDetail)
export const fetchUserOrdersApi = async (userId) => {
  try {
    const response = await apiClient.get(
      `/api/admin/orders/user/${userId}/orders`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const toggleUserStatusApi = async (userId, isActive) => {
  try {
    const response = await apiClient.put(
      `/api/admin/users/${userId}/toggle-status`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const exportUsersExcelApi = async () => {
  const response = await apiClient.get("/api/admin/users/export", {
    responseType: "blob",
  });
  return response.data;
};

export const updateUserApi = async (userId, data) => {
  try {
    const response = await apiClient.put(`/api/admin/users/${userId}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUserApi = async (userId) => {
  try {
    const response = await apiClient.delete(`/api/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Thêm API lấy tất cả đơn hàng
export const fetchAllOrdersApi = async () => {
  try {
    const response = await apiClient.get(`/api/admin/orders`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Lấy số đơn hàng mới
export const getNewOrdersCount = async () => {
  try {
    const response = await apiClient.get("/api/admin/orders/new-count");
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Lỗi khi lấy số đơn hàng mới");
    }
  } catch (error) {
    throw error;
  }
};

// Thêm các hàm mới cho quản lý bài viết
export const getData = async (url) => {
  try {
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const putData = async (url, data) => {
  try {
    const response = await apiClient.put(url, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
