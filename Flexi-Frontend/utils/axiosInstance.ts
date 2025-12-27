import axios from "axios";
import { API_URL} from "@/utils/config";
import { getToken } from "./utility";

// Function to create an Axios instance without authentication
export const getAxios = () => {
  return axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30 seconds timeout
  });
};



// Function to create an Axios instance with authentication
export const getAxiosWithAuth = async () => {
  const token = await getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  return axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30 seconds timeout
    headers,
  });
};
