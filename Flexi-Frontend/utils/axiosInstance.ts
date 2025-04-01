import axios from "axios";
import { API_URL} from "@/utils/config";
import { getToken } from "./utility";

// Function to create an Axios instance without authentication
export const getAxios = () => {
  return axios.create({
    baseURL: API_URL,
  });
};



// Function to create an Axios instance with authentication
export const getAxiosWithAuth = async () => {
  const token = await getToken();
  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
