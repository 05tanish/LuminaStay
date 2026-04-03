/**
 * Centralized API service functions.
 * All functions use the shared `api` axios instance (with cookies & interceptors).
 */
import { api } from "@/lib/axios";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/user/me"),
  sendOtp: (phone: string) => api.post("/auth/otp/send", { phone }),
  registerWithInvite: (data: {
    code: string;
    name: string;
    email: string;
    password: string;
    phone?: string;
    otp?: string;
  }) => api.post("/invite/register", data),
};

// ─── Hostel ──────────────────────────────────────────────────────────────────

export const hostelApi = {
  getAll: (params?: { page?: number; limit?: number }) => api.get("/hostel", { params }),
  create: (data: { name: string; address: string }) =>
    api.post("/super-admin", data),
  assignAdmin: (data: { userId: string; hostelId: string }) =>
    api.post("/super-admin/assign-admin", data),
};

// ─── Rooms & Beds ─────────────────────────────────────────────────────────────

export const roomApi = {
  getAll: (hostelId?: string) =>
    api.get("/rooms", { params: hostelId ? { hostelId } : {} }),
  create: (data: { roomNo: string; capacity: number; hostelId: string }) =>
    api.post("/rooms", data),
  assignBed: (data: { userId: string; bedId: string }) =>
    api.post("/rooms/assign-bed", data),
  vacateBed: (data: { userId: string }) =>
    api.post("/rooms/vacate-bed", data),
};

// ─── Users (Admin) ───────────────────────────────────────────────────────────

export const usersApi = {
  getAll: (params: { page?: number; limit?: number; search?: string }) =>
    api.get("/admin/users", { params }),
  create: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    hostelId?: string;
  }) => api.post("/admin/users", data),
  delete: (userId: string) => api.delete(`/admin/users/${userId}`),
  updateRole: (userId: string, role: string) =>
    api.patch(`/admin/users/${userId}/role`, { role }),
};

// ─── Complaints ───────────────────────────────────────────────────────────────

export const complaintApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get("/complaint", { params }),
  create: (data: { title: string; description: string }) =>
    api.post("/complaint", data),
  delete: (id: string) => api.delete(`/complaint/${id}`),
  update: (id: string, data: { title?: string; description?: string }) =>
    api.put(`/complaint/${id}`, data),
  updateStatus: (complaintID: string, status: string) =>
    api.patch("/complaint/status", { complaintID, status }),
};

// ─── Food ────────────────────────────────────────────────────────────────────

export const foodApi = {
  getWeekly: () => api.get("/food/weekly"),
  getByDate: (date: string) => api.get(`/food/${date}`),
  upsert: (date: string, meals: object) =>
    api.post("/food", { date, meals }),
};

// ─── Payments ────────────────────────────────────────────────────────────────

export const paymentApi = {
  // Admin
  createFee: (data: {
    userId: string;
    month: string;
    amount: number;
    dueDate: string;
  }) => api.post("/admin/monthly-fees", data),
  getAllFees: (params?: {
    page?: number;
    limit?: number;
    userId?: string;
    status?: string;
    month?: string;
  }) => api.get("/admin/monthly-fees", { params }),
  // User
  getMyFees: (params?: { page?: number; limit?: number }) =>
    api.get("/user/my-fees", { params }),
  // Online payment
  createOrder: (monthlyFeeId: string) =>
    api.post("/payment/online/create-order", { monthlyFeeId }),
  verifyOrder: (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    monthlyFeeId: string;
  }) => api.post("/payment/online/verify", data),
  // Cash payment
  recordCash: (data: {
    monthlyFeeId: string;
    userId: string;
    transactionId?: string;
    remarks?: string;
  }) => api.post("/payment/cash", data),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationApi = {
  getMyNotifications: (params?: { page?: number; limit?: number }) =>
    api.get("/user/notifications", { params }),
  markRead: (id: string) => api.patch(`/user/notifications/${id}/read`),
  broadcast: (data: { title: string; message: string }) =>
    api.post("/admin/notifications/broadcast", data),
  sendToUser: (data: { userId: string; title: string; message: string }) =>
    api.post("/admin/notifications/user", data),
};

// ─── Invites ─────────────────────────────────────────────────────────────────

export const inviteApi = {
  create: (data: {
    hostelId: string;
    role: string;
    type: string;
    email?: string;
  }) => api.post("/invite", data),
  getAll: (hostelId: string) => api.get(`/invite/${hostelId}`),
  validate: (code: string) => api.get(`/invite/validate/${code}`),
};
