import axios from 'axios';
import {message} from 'antd';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT as string;

interface LoginCredentials {
  uid: string;
  pwd: string;
}

export const loginUser = async (credentials: LoginCredentials) => {
  try {
    const response = await axios.post(
      process.env.NEXT_PUBLIC_API_ENDPOINT + "/_login",
      credentials,
      {
        headers:{
          Accept: '*/*',
        },
        withCredentials: true,
      }
    );
    return response;
  } catch (error) {
    console.error("Login API request failed:", error);
    throw error;
  }
};

export const fetchUserDocId = async (userId: string) => {
  try {
    const response = await axios.post(
      process.env.NEXT_PUBLIC_API_ENDPOINT + "/_user_docid",
      {"uid":userId}, 
      {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Fetch user document ID request failed:", error);
    message.error("Failed to fetch user document ID");
    throw error;
  }
};

export const fetchUserDetails = async (userDocId: string) => {
  try {
    const response = await axios.post(
      process.env.NEXT_PUBLIC_API_ENDPOINT + "/_user_get", 
      {"id":userDocId},
      {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Fetch user details request failed:", error);
    message.error("Failed to fetch user details");
    throw error;
  }
};