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
    return response;
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
    return response;
  } catch (error) {
    console.error("Claim reject request failed:", error);
    message.error("Failed to reject claim");
    throw error;
  }
};


export const updateVenuOwner = async (venue) => {

  const payload = {
    venue_id: venue.venue_id,
    name: venue.name,
    category: venue.category,
    category_description: venue.category_desc || "",
    addr: {
      rcpt: venue.addr.rcpt || "",
      fl: venue.addr.fl || "",
      sl: venue.addr.sl || "",
      pc: venue.addr.pc || "",
      cty: venue.addr.cty || "",
      reg: venue.addr.reg || "",
      ctry: venue.addr.ctry || "",
    },
    capacity: venue.capacity,
    description: venue.description,
    event_conf_req: venue.event_conf_req,
    position: {
      l: venue.position.l,
      L: venue.position.L,
    },
    private: venue.private,
  };

  try {
    const response = await axios.post(
      process.env.NEXT_PUBLIC_API_ENDPOINT + "/venu_venue_update",
      payload,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    message.success('Venue data sent successfully');
    return response;
  } catch (error) {
    console.error('Failed to send venue data:', error);
    message.error('Failed to send venue data');
    throw error;
  }
};

export const createVenue = async (requestData: any) => {
  try {
    const response = await axios.post(
      process.env.NEXT_PUBLIC_API_ENDPOINT + "/venu_venue_create",
      requestData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
    return response.data;
  } catch (error) {
    console.error("Venue creation request failed:", error);
    message.error("Failed to create venue");
    throw error;
  }
};

export const venueTransfer = async (userDocId: string, venueId: string) => {
  try {
    const response = await axios.post(
      process.env.NEXT_PUBLIC_API_ENDPOINT + "/_user_get", 
      {"new_owner_id":userDocId, "venue_id": venueId},
      {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Transfer venue request failed:", error);
    message.error("Failed to transfer venue");
    throw error;
  }
};

export const deleteVenue = async (id: string) => {
  try {
    const response = await axios.delete(`http://192.168.0.113:8080/deleteVenue/${id}`, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    message.error('Failed to delete venue');
    throw error;
  }
};