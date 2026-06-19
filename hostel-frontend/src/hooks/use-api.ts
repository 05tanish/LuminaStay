/**
 * Reusable React Query hooks for every API domain.
 * These abstract away loading/error states so pages stay clean.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  complaintApi,
  foodApi,
  hostelApi,
  inviteApi,
  notificationApi,
  paymentApi,
  roomApi,
  superAdminApi,
  usersApi,
  authApi,
} from "@/lib/api";

// ─── QUERY KEYS ──────────────────────────────────────────────────────────────
export const QK = {
  hostels: ["hostels"],
  rooms: (hostelId?: string) => ["rooms", hostelId],
  users: (search?: string, page?: number) => ["users", search, page],
  complaints: (page?: number) => ["complaints", page],
  food: (date?: string) => ["food", date],
  foodWeekly: ["food", "weekly"],
  fees: (params?: object) => ["fees", params],
  myFees: (page?: number) => ["my-fees", page],
  notifications: (page?: number) => ["notifications", page],
  invites: (hostelId?: string) => ["invites", hostelId],
};

// ─── HOSTELS ─────────────────────────────────────────────────────────────────

export function useHostels(page = 1, search = "") {
  return useQuery({
    queryKey: ["hostels", page, search],
    queryFn: async () => {
      const res = await hostelApi.getAll({ page, limit: 10, search });
      // Backend returns { success, data: { hostels, pagination } }
      // Return the full object so consumers can access .hostels and .pagination
      return res.data.data; // { hostels: [...], pagination: {...} }
    },
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

export function useCreateHostel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hostelApi.create,
    onSuccess: () => {
      toast.success("Hostel created successfully");
      qc.invalidateQueries({ queryKey: QK.hostels });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to create hostel"),
  });
}

export function useAssignAdmin() {
  return useMutation({
    mutationFn: hostelApi.assignAdmin,
    onSuccess: () => toast.success("Admin assigned successfully"),
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to assign admin"),
  });
}

// ─── SUPER ADMIN ─────────────────────────────────────────────────────────────

export function usePlatformStats() {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      const res = await superAdminApi.getStats();
      return res.data.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
  });
}

export function useAdmins() {
  return useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const res = await superAdminApi.getAdmins();
      return res.data.data;
    },
  });
}

export function useReassignAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, hostelId }: { userId: string; hostelId: string }) =>
      superAdminApi.reassignAdmin(userId, hostelId),
    onSuccess: () => {
      toast.success("Admin reassigned successfully");
      qc.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to reassign admin"),
  });
}

export function useDeleteAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: superAdminApi.deleteAdmin,
    onSuccess: () => {
      toast.success("Admin removed");
      qc.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to remove admin"),
  });
}

// ─── ROOMS ───────────────────────────────────────────────────────────────────

export function useRooms(hostelId?: string) {
  return useQuery({
    queryKey: QK.rooms(hostelId),
    queryFn: async () => {
      // Pass hostelId if available; backend falls back to session hostelId
      const res = await roomApi.getAll(hostelId);
      return res.data.data;
    },
    // Always fetch — backend uses session hostelId if no param provided
    enabled: true,
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

export function useCreateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: roomApi.create,
    onSuccess: () => {
      toast.success("Room created successfully");
      qc.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to create room"),
  });
}

export function useAssignBed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: roomApi.assignBed,
    onSuccess: () => {
      toast.success("Bed assigned successfully");
      qc.invalidateQueries({ queryKey: ["rooms"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to assign bed"),
  });
}

export function useVacateBed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bedId: string) => roomApi.vacateBed(bedId),
    onSuccess: () => {
      toast.success("Bed vacated successfully");
      qc.invalidateQueries({ queryKey: ["rooms"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to vacate bed"),
  });
}

// ─── AUTH & PROFILE ──────────────────────────────────────────────────────────

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully");
      qc.invalidateQueries({ queryKey: ["user", "me"] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to update profile"),
  });
}

export function useRequestProfileUpdate() {
  return useMutation({
    mutationFn: authApi.requestProfileUpdate,
    onSuccess: () => {
      toast.success("Profile update request submitted to admin!");
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to submit request"),
  });
}

// ─── USERS ────────────────────────────────────────────────────────────────────

export function useUsers(search?: string, page = 1) {
  return useQuery({
    queryKey: QK.users(search, page),
    queryFn: async () => {
      const res = await usersApi.getAll({ search, page, limit: 20 });
      return res.data.data;
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 45000,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      toast.success("User created successfully");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to create user"),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      toast.success("User deleted");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to delete user"),
  });
}

export function useProfileRequests() {
  return useQuery({
    queryKey: ["profile-requests"],
    queryFn: async () => {
      const res = await usersApi.getProfileRequests();
      return res.data.data;
    },
  });
}

export function useRespondProfileRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, adminComment }: { id: string; status: string; adminComment?: string }) =>
      usersApi.respondProfileRequest(id, { status, adminComment }),
    onSuccess: () => {
      toast.success("Request updated");
      qc.invalidateQueries({ queryKey: ["profile-requests"] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to update request"),
  });
}

// ─── COMPLAINTS ───────────────────────────────────────────────────────────────

export function useComplaints(page = 1) {
  return useQuery({
    queryKey: QK.complaints(page),
    queryFn: async () => {
      const res = await complaintApi.getAll({ page, limit: 20 });
      return res.data.data;
    },
  });
}

export function useAdminComplaints(page = 1) {
  return useQuery({
    queryKey: ["admin-complaints", page],
    queryFn: async () => {
      const res = await complaintApi.getAdminComplaints({ page, limit: 20 });
      return res.data.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 20000,
  });
}

export function useCreateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: complaintApi.create,
    onSuccess: () => {
      toast.success("Complaint submitted");
      qc.invalidateQueries({ queryKey: ["complaints"] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to submit complaint"),
  });
}

export function useUpdateComplaintStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      complaintApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["complaints"] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to update status"),
  });
}

export function useDeleteComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: complaintApi.delete,
    onSuccess: () => {
      toast.success("Complaint deleted");
      qc.invalidateQueries({ queryKey: ["complaints"] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to delete"),
  });
}

// ─── FOOD ────────────────────────────────────────────────────────────────────

export function useFoodWeekly(startDate?: string) {
  return useQuery({
    queryKey: [...QK.foodWeekly, startDate],
    queryFn: async () => {
      const res = await foodApi.getWeekly(startDate);
      return res.data.data;
    },
  });
}

export function useFoodByDate(date: string) {
  return useQuery({
    queryKey: QK.food(date),
    enabled: !!date,
    queryFn: async () => {
      const res = await foodApi.getByDate(date);
      return res.data.data;
    },
  });
}

export function useUpsertFood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ date, meals }: { date: string; meals: { type: string; items: string[] }[] }) =>
      foodApi.upsert(date, meals),
    onSuccess: () => {
      toast.success("Menu saved successfully");
      qc.invalidateQueries({ queryKey: ["food"] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to save menu"),
  });
}

// ─── PAYMENTS ────────────────────────────────────────────────────────────────

export function useAdminFees(params?: object) {
  return useQuery({
    queryKey: QK.fees(params),
    queryFn: async () => {
      const res = await paymentApi.getAllFees(params as any);
      return res.data.data;
    },
  });
}

export function useMyFees(page = 1) {
  return useQuery({
    queryKey: QK.myFees(page),
    queryFn: async () => {
      const res = await paymentApi.getMyFees({ page, limit: 20 });
      return res.data.data;
    },
  });
}

export function useCreateFee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentApi.createFee,
    onSuccess: () => {
      toast.success("Monthly fee created");
      qc.invalidateQueries({ queryKey: ["fees"] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to create fee"),
  });
}

export function useRecordCashPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentApi.recordCash,
    onSuccess: () => {
      toast.success("Cash payment recorded");
      qc.invalidateQueries({ queryKey: ["fees"] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to record payment"),
  });
}

export function useRevenue() {
  return useQuery({
    queryKey: ["revenue"],
    queryFn: async () => {
      const res = await paymentApi.getRevenue();
      return res.data.data;
    },
  });
}

export function useCreateOnlineOrder() {
  return useMutation({
    mutationFn: paymentApi.createOrder,
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to initiate online payment"),
  });
}

export function useVerifyOnlineOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentApi.verifyOrder,
    onSuccess: () => {
      toast.success("Payment successful!");
      qc.invalidateQueries({ queryKey: ["my-fees"] });
      qc.invalidateQueries({ queryKey: ["fees"] });
      qc.invalidateQueries({ queryKey: ["revenue"] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Payment verification failed"),
  });
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export function useNotifications(page = 1) {
  return useQuery({
    queryKey: QK.notifications(page),
    queryFn: async () => {
      const res = await notificationApi.getMyNotifications({ page, limit: 20 });
      return res.data.data;
    },
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useBroadcastNotification() {
  return useMutation({
    mutationFn: notificationApi.broadcast,
    onSuccess: () => toast.success("Notification broadcast successfully"),
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to broadcast"),
  });
}

// ─── INVITES ─────────────────────────────────────────────────────────────────

export function useInvites(hostelId?: string) {
  return useQuery({
    queryKey: QK.invites(hostelId),
    enabled: !!hostelId,
    queryFn: async () => {
      const res = await inviteApi.getAll(hostelId!);
      return res.data.data;
    },
  });
}

export function useCreateInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inviteApi.create,
    onSuccess: () => {
      toast.success("Invite created successfully");
      qc.invalidateQueries({ queryKey: ["invites"] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to create invite"),
  });
}

export function useAllInvites() {
  return useQuery({
    queryKey: [...QK.invites("all"), "global"],
    queryFn: async () => {
      const res = await inviteApi.getGlobalAll();
      return res.data.data;
    },
  });
}

export function useDeleteInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inviteApi.delete,
    onSuccess: () => {
      toast.success("Invite deleted");
      qc.invalidateQueries({ queryKey: ["invites"] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to delete invite"),
  });
}

export function useSendEmailShare() {
  return useMutation({
    mutationFn: inviteApi.sendEmailShare,
    onSuccess: () => {
      toast.success("Email sent successfully");
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to send email"),
  });
}
