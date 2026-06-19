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
  updateProfile: (data: { name?: string; phone?: string }) => api.patch("/user/me", data),
  requestProfileUpdate: (data: { changes: any; reason: string }) => api.post("/user/profile-request", data),
  sendOtp: (phone: string) => api.post("/auth/otp/send", { phone }),
  registerWithInvite: (data: {
    code: string;
    name: string;
    email: string;
    password: string;
    phone?: string;
    otp?: string;
  }) => api.post("/invite/register", data),
  requestPasswordReset: (email: string) => api.post("/auth/forgot-password", { email }),
  verifyResetToken: (token: string) => api.get(`/auth/verify-reset-token/${token}`),
  resetPassword: (data: { token: string; newPassword: string }) => api.post("/auth/reset-password", data),
};

// ─── Hostel ──────────────────────────────────────────────────────────────────

export const hostelApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) => api.get("/hostel", { params }),
  create: (data: { name: string; address: string }) =>
    api.post("/hostel", data),
  delete: (id: string, mode: 'soft' | 'hard' = 'soft') =>
    api.delete(`/hostel/${id}?mode=${mode}`),
  transfer: (id: string, targetHostelId: string) =>
    api.post(`/hostel/${id}/transfer`, { targetHostelId }),
  assignAdmin: (data: { userId: string; hostelId: string }) =>
    api.post("/super-admin/assign-admin", data),
};

// ─── Super Admin ─────────────────────────────────────────────────────────────

export const superAdminApi = {
  getStats: () => api.get("/super-admin/stats"),
  getAdmins: () => api.get("/super-admin/admins"),
  reassignAdmin: (userId: string, hostelId: string) =>
    api.patch(`/super-admin/admins/${userId}/reassign`, { hostelId }),
  deleteAdmin: (userId: string) =>
    api.delete(`/super-admin/admins/${userId}`),
};

// ─── Rooms & Beds ─────────────────────────────────────────────────────────────

export const roomApi = {
  getAll: (hostelId?: string) =>
    api.get("/rooms", { params: hostelId ? { hostelId } : {} }),
  create: (data: { roomNo: string; capacity: number }) =>
    api.post("/rooms", data),
  assignBed: (data: { userId: string; bedId: string }) =>
    api.post("/rooms/assign-bed", data),
  vacateBed: (bedId: string) =>
    api.post("/rooms/vacate-bed", { bedId }),
};

// ─── Users (Admin) ───────────────────────────────────────────────────────────

export const usersApi = {
  getAll: (params: { page?: number; limit?: number; search?: string }) =>
    api.get("/admin/users", { params }),
  create: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: string;
    hostelId?: string;
  }) => api.post("/admin/users", data),
  delete: (userId: string) => api.delete(`/admin/users/${userId}`),
  updateRole: (userId: string, role: string) =>
    api.patch(`/admin/users/${userId}/role`, { role }),
  getProfileRequests: () => api.get("/admin/profile-requests"),
  respondProfileRequest: (id: string, data: { status: string; adminComment?: string }) =>
    api.patch(`/admin/profile-requests/${id}`, data),
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
  getAdminComplaints: (params?: { page?: number; limit?: number }) =>
    api.get("/complaint/admin", { params }),
};

// ─── Food ────────────────────────────────────────────────────────────────────

export const foodApi = {
  getWeekly: (startDate?: string) => api.get("/food/menu/weekly", { params: { startDate } }),
  getByDate: (date: string) => api.get("/food/menu", { params: { date } }),
  upsert: (date: string, meals: { type: string; items: string[] }[]) =>
    api.post("/food/menu", { date, meals }),
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
  // Revenue
  getRevenue: () => api.get("/payment/revenue"),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationApi = {
  getMyNotifications: (params?: { page?: number; limit?: number }) =>
    api.get("/user/notifications", { params }),
  markRead: (id: string) => api.patch(`/user/notifications/${id}/read`),
  broadcast: (data: { title: string; message: string }) =>
    api.post("/notification/broadcast", data),
  sendToUser: (data: { userId: string; title: string; message: string }) =>
    api.post("/notification/user", data),
};

// ─── Invites ─────────────────────────────────────────────────────────────────

export const inviteApi = {
  create: (data: {
    hostelId: string;
    role: string;
    type: string;
    email?: string;
  }) => api.post("/invite", data),
  getAll: (hostelId: string) => api.get(`/invite/hostel/${hostelId}`),
  getGlobalAll: () => api.get(`/invite/all`),
  validate: (code: string) => api.get(`/invite/${code}`),
  delete: (id: string) => api.delete(`/invite/${id}`),
  sendEmailShare: (data: { code: string; email: string; originUrl: string }) =>
    api.post("/invite/email-share", data),
};
