import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
	user: null,
	loading: false,
	checkingAuth: true,
	refreshingToken: false,

	signup: async ({ name, email, password, confirmPassword }) => {
		set({ loading: true });

		if (password !== confirmPassword) {
			set({ loading: false });
			return toast.error("Passwords do not match");
		}

		try {
			const res = await axios.post("/auth/signup", { name, email, password });
			set({ user: res.data, loading: false });
			toast.success("User signed Up Successfully")
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.message || "An error occurred");
		}
	},
	login: async (email, password) => {
		set({ loading: true });

		try {
			const res = await axios.post("/auth/login", { email, password });

			set({ user: res.data, loading: false });
			toast.success('Login Successful')
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.message || "An error occurred");
		}
	},

	logout: async () => {
		try {
			await axios.post("/auth/logout");
			set({ user: null });
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred during logout");
		}
	},

	checkAuth: async () => {
		set({ checkingAuth: true });
		try {
			const response = await axios.get("/auth/profile");
			set({ user: response.data, checkingAuth: false });
		} catch (error) {
			console.log(error.message);
			set({ checkingAuth: false, user: null });
		}
	},

	refreshToken: async () => {
		// Prevent multiple simultaneous refresh attempts
		if (get().refreshingToken) return;

		set({ refreshingToken: true });
		try {
			await axios.post("/auth/refresh-token");
		} catch (error) {
			set({ user: null });
			throw error;
		} finally {
			set({ refreshingToken: false }); 
		}
	},
}));


// Axios interceptor for token refresh
let refreshPromise = null;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth")
    ) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      if (originalRequest._retryCount > 1) {
        useUserStore.getState().logout();
        return Promise.reject(error);
      }

      try {
        if (!refreshPromise) {
          refreshPromise = useUserStore.getState().refreshToken();
        }

        await refreshPromise;
        refreshPromise = null;

        return axios(originalRequest);
      } catch (err) {
        refreshPromise = null;
        useUserStore.getState().logout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);