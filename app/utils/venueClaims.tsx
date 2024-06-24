import axios from "axios";
import { message } from "antd";

export interface FetchClaimsRequest {
  cursor?: string | null;
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
  cursor?: {
    l?: string;
  };
}

export const fetchClaims = async (
  extension: string,
  requestData: string // Change to string to accommodate JSON.stringify
): Promise<ClaimResponse> => {
  try {
    const response = await axios.post<ClaimResponse>(
      process.env.NEXT_PUBLIC_API_ENDPOINT + "/venu_venue_claims" + extension,
      requestData, // Send the JSON stringified requestData
      {
        withCredentials: true, // This ensures cookies are sent with the request
        headers: {
          "Content-Type": "application/json", // Set the content type to JSON
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

export const claimAccept = async (venuClaimId: string) => {
  try {
    const response = await axios.post(
      process.env.NEXT_PUBLIC_API_ENDPOINT + "/venu_venue_claim_accept",
      { venue_claim_id: venuClaimId },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
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
    const response = await axios.post(
      process.env.NEXT_PUBLIC_API_ENDPOINT + "/venu_venue_claim_reject",
      { venue_claim_id: claimId },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Response");
    console.log(response.data);
    message.success("Claim rejected successfully");
  } catch (error) {
    console.error("Claim reject request failed:", error);
    message.error("Failed to reject claim");
    throw error;
  }
};
