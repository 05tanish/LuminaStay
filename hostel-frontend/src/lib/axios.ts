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

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    // Check if the error is 401 Unauthorized
    if (error.response?.status === 401) {
      // Avoid infinite loops if the error is from the auth endpoint
      if (!error.config?.url?.includes("/auth")) {
        // Clear auth state
        useAuthStore.getState().logout();

        toast.error("Session expired", {
          description: "Please log in again.",
        });

        // If not already on login page, redirect
        if (typeof window !== "undefined" && !window.location.pathname.includes("/auth")) {
          window.location.href = "/auth/login";
        }
      }
    }

    if (error.response?.status === 403) {
      toast.error("Forbidden", {
        description: "You do not have permission to perform this action.",
      });
    }

    // Default error message
    const data = error.response?.data as any;
    const message = data?.message || data?.error || "An unexpected error occurred.";

    // Optionally show toast for errors automatically?
    // Let's not toast *all* errors here, some components might want to handle it themselves.
    // However, for backend `AppError` response it usually has `data.message` and `success: false`.

    return Promise.reject(error);
  }
);
