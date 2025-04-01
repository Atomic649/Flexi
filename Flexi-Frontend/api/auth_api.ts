import { checkNetwork, getToken } from "@/utils/utility";
import { getAxios, getAxiosWithAuth } from "@/utils/axiosInstance";
import axios from "axios";

class CallAPIUser {
  // Register API

  async registerAPI(data: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
  }): Promise<any> {
    if (!(await checkNetwork())) {
      return { message: "No Network Connection" };
    }
    try {
      const response = await getAxios().post("/auth/register", data);

      console.log("📝registerAPI:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨Register API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }

  // Login API
  async loginAPI(data: { email: string; password: string }): Promise<any> {
    if (!(await checkNetwork())) {
      return { message: "No Network Connection" };
    }
    try {
      const response = await getAxios().post("/auth/login", data);

      console.log("🚀loginAPI:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨Login API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }

  // Get Session

  async getSessionAPI(): Promise<any> {
    if (!(await checkNetwork())) {
      return { message: "No Network Connection" };
    }
    try {
      const token = await getToken();
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/auth/session/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("🚀sessionAPI :", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨Get Session API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }

  async updateUserAPI(data: any): Promise<any> {
    if (!(await checkNetwork())) {
      return { message: "No Network Connection" };
    }
    try {
      const token = await getToken();
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.put(
        `/auth/update/${data.id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("🚨Update User API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }
  // Logout API
  async logoutAPI(): Promise<any> {
    if (!(await checkNetwork())) {
      return { message: "No Network Connection" };
    }
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get("/auth/logout");
      console.log("🚀logoutAPI:", "signout");
      return response.data;
    } catch (error) {
      console.error("🚨Logout API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }

  // onAuthStateChange
  onAuthStateChange(_callback: (session: any) => void) {
    // Implement this method to listen to authentication state changes
  }
}

export default new CallAPIUser();
