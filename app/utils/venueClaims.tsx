import axios from "axios";
import { message } from "antd";
import { loginUser } from "./useUserAuth";

interface FetchClaimsRequest {
  limit: number;
}

export interface User {
  user_doc_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  amail: string;
}

export interface Address {
  rcpt: string;
  fl: string;
  sl: string;
  pc: string;
  cty: string;
  reg: string;
  ctry: number;
}

export interface Position {
  l: number;
  L: number;
}

export interface Owner {
  user_doc_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  amail: string;
}

export interface Venue {
  rating: number;
  event_conf_req: number;
  description: string;
  capacity: number;
  category_desc: string;
  category: number;
  private: number;
  name: string;
  venue_id: string;
  addr: Address;
  position: Position;
  owner: Owner;
}

export interface Claim {
  id: string;
  k: number;
  r: {
    timestamp: number;
    user: User;
    venue: Venue;
  };
}

export interface ClaimResponse {
  rows: Claim[];
}

const loginCredentials = {
  uid: "Shu",
  pwd: "Hello@123",
};

export const fetchClaims = async (): Promise<ClaimResponse> => {
  const requestData: FetchClaimsRequest = {
    limit: 5,
  };

  try {
    // await loginUser(loginCredentials);
    // console.log(await loginUser(loginCredentials));
    // console.log(requestData);
    // console.log(process.env.NEXT_PUBLIC_API_ENDPOINT + "/venu_venue_claims");
    const response = await axios.post<ClaimResponse>(
      process.env.NEXT_PUBLIC_API_ENDPOINT + "/venu_venue_claims",
      requestData,
      {
        withCredentials: true, // This ensures cookies are sent with the request
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

export const claimAccept = async (claimId: string) => {
  try {
    await axios.post(
      process.env.NEXT_PUBLIC_API_ENDPOINT + "/venu_claim_accept",
      { claim_id: claimId },
      {
        headers: {
          Cookie: "your_cookie_name=your_cookie_value",
        },
        withCredentials: true,
      }
    );
    message.success("Claim accepted successfully");
  } catch (error) {
    console.error("Claim accept request failed:", error);
    message.error("Failed to accept claim");
    throw error;
  }
};

export const claimReject = async (claimId: string) => {
  try {
    await axios.post(
      process.env.NEXT_PUBLIC_API_ENDPOINT + "/venu_claim_reject",
      { claim_id: claimId },
      {
        headers: {
          Cookie: "your_cookie_name=your_cookie_value",
        },
        withCredentials: true,
      }
    );
    message.success("Claim rejected successfully");
  } catch (error) {
    console.error("Claim reject request failed:", error);
    message.error("Failed to reject claim");
    throw error;
  }
};
