import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./axios";

// ==========================================
// HOSTEL APIS (SUPER ADMIN & ADMIN view)
// ==========================================

export interface Hostel {
  id: string;
  name: string;
  address: string;
  createdAt: string;
}
//0998

export const useHostels = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["hostels", page, limit],
    queryFn: async () => {
      const { data } = await api.get(`/hostel?page=${page}&limit=${limit}`);
      return data.data; // Assuming backend returns { success: true, data: [...] }
    },
  });
};

export const useCreateHostel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; address: string }) => {
      const { data } = await api.post("/super-admin", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostels"] });
    },
  });
};

export const useDeleteHostel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/hostel/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostels"] });
    },
  });
};

export const useAssignAdmin = () => {
  return useMutation({
    mutationFn: async (payload: { userId: string; hostelId: string }) => {
      const { data } = await api.post("/super-admin/assign-admin", payload);
      return data;
    },
  });
};

// ==========================================
// ROOM APIS (ADMIN view)
// ==========================================

export interface Room {
  id: string;
  roomNo: string;
  capacity: number;
  hostelId: string;
  beds: Bed[];
}

export interface Bed {
  id: string;
  bedNo: string;
  userId?: string;
}

export const useRooms = (hostelId?: string) => {
  return useQuery({
    queryKey: ["rooms", hostelId],
    queryFn: async () => {
      // Backend expects /rooms?hostelId=xxx if filtering
      const url = hostelId ? `/rooms?hostelId=${hostelId}` : "/rooms";
      const { data } = await api.get(url);
      return data.data || data; // handle payload structure 
    },
    enabled: !!hostelId // Only fetch if we have a hostel
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { roomNo: string; capacity: number; hostelId: string }) => {
      const { data } = await api.post("/rooms", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
};

export const useAssignBed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { userId: string; bedId: string }) => {
      const { data } = await api.post("/rooms/assign-bed", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useVacateBed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { userId: string }) => {
      const { data } = await api.post("/rooms/vacate-bed", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

// ==========================================
// USER (STUDENT) APIS (ADMIN view)
// ==========================================

export const useUsers = (page = 1, limit = 10, search = "") => {
  return useQuery({
    queryKey: ["users", page, limit, search],
    queryFn: async () => {
      const { data } = await api.get(`/admin/users?page=${page}&limit=${limit}&search=${search}`);
      return data.data || data;
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post("/admin/users", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

// ==========================================
// FOOD APIS
// ==========================================

export const useMenu = (date?: string) => {
  return useQuery({
    queryKey: ["menu", date],
    queryFn: async () => {
      const url = date ? `/food/menu?date=${date}` : "/food/menu";
      const { data } = await api.get(url);
      return data.data || data;
    },
  });
};

export const useUpsertMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { date: string, meals: any[] }) => {
      const { data } = await api.post("/food/menu", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
};

// ==========================================
// COMPLAINT APIS
// ==========================================

export const useComplaints = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["complaints", page, limit],
    queryFn: async () => {
      const { data } = await api.get(`/complaint?page=${page}&limit=${limit}`);
      return data.data || data;
    },
  });
};

export const useUpdateComplaintStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { complaintID: string, status: string }) => {
      const { data } = await api.patch("/complaint/status", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
};

// ==========================================
// PAYMENT APIS
// ==========================================

export const useAllPayments = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["payments", "all", page, limit],
    queryFn: async () => {
      const { data } = await api.get(`/payment/all?page=${page}&limit=${limit}`);
      return data.data || data;
    },
  });
};

export const useCashPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { userId: string, amount: number, remarks: string }) => {
      const { data } = await api.post("/payment/cash", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
};


export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.delete(`/admin/users/${userId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

// ==========================================
// USER SPECIFIC APIS (Student view)
// ==========================================

export const useMyFees = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["myFees", page, limit],
    queryFn: async () => {
      const { data } = await api.get(`/user/my-fees?page=${page}&limit=${limit}`);
      return data.data || data;
    },
  });
};

export const useMyPayments = () => {
  return useQuery({
    queryKey: ["myPayments"],
    queryFn: async () => {
      const { data } = await api.get(`/payment/my-payments`);
      return data.data || data;
    },
  });
};

export const useCreateComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string, description: string }) => {
      const { data } = await api.post("/complaint", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
};

export const useCreatePaymentOrder = () => {
  return useMutation({
    mutationFn: async (payload: { amount: number }) => {
      const { data } = await api.post("/payment/create-order", payload);
      return data;
    },
  });
};
