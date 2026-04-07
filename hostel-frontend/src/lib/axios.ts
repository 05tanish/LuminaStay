import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

export const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api";

export const api = axios.create({
  baseURL,
  withCredentials: true, // Required for httpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Check if the error is 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/login")) {
      if (originalRequest.url?.includes("/auth/refresh")) {
        // Refresh also failed, hard logout — but only if store has hydrated
        const store = useAuthStore.getState();
        if (store._hasHydrated) {
          store.logout();
        }
        toast.error("Session expired", { description: "Please log in again." });
        if (typeof window !== "undefined" && !window.location.pathname.includes("/auth")) {
          window.location.href = "/auth/login";
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        
        processQueue(null, "Refreshed");
        isRefreshing = false;
        
        return api(originalRequest);
      } catch (err: any) {
        processQueue(err, null);
        isRefreshing = false;
        
        const store = useAuthStore.getState();
        if (store._hasHydrated) {
          store.logout();
        }
        toast.error("Session expired", { description: "Please log in again." });
        if (typeof window !== "undefined" && !window.location.pathname.includes("/auth")) {
          window.location.href = "/auth/login";
        }
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 403) {
      toast.error("Forbidden", {
        description: "You do not have permission to perform this action.",
      });
    }

    return Promise.reject(error);
  }
);
