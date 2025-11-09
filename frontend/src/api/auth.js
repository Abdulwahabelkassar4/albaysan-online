import axiosClient from "./axiosClient.js";

export const loginAdmin = async (credentials) => {
  const { data } = await axiosClient.post("/api/admin/login", credentials);
  return data;
};

export const fetchAdminProfile = async () => {
  const { data } = await axiosClient.get("/api/admin/me");
  return data.admin;
};

