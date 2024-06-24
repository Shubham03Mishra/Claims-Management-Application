import axios from 'axios';

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