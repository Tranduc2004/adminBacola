import React from "react";
import { Routes, Route } from "react-router-dom";
import UserList from "./UserList";
import UserDetail from "./UserDetail";

const UserManagement = () => {
  return (
    <Routes>
      <Route path="/" element={<UserList />} />
      <Route path="/:id" element={<UserDetail />} />
    </Routes>
  );
};

export default UserManagement;
