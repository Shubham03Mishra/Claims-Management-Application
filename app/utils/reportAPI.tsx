import axios from "axios";
import { message } from "antd";

export interface User {
    user_doc_id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    amail: string;
  }
  
  export interface Organizer {
    user_doc_id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    amail: string;
  }
  
  export interface EventDetails {
    report_count: number;
    bookings_count: number;
    bookable: number;
    conversation_id: string;
    state: number;
    venue_name: string;
    name: string;
    venue_id: string;
    private: number;
    category: number;
    category_desc: string;
    capacity: number;
    start: number;
    duration: number;
    bnt: number;
    organizer_dn: string;
    images: string[];
    organizer: Organizer;
  }
  
  export interface EventReport {
    id: string;
    k: number;
    r: EventDetails;
  }
  
  export interface EventReportsResponse {
    rows: EventReport[];
    cursor?: {
      l?: string;
    };
  }
  
  export const fetchEventReports = async (
    extension: string,
    requestData: string // Change to string to accommodate JSON.stringify
  ): Promise<EventReportsResponse> => {
    try {
      const response = await axios.post<EventReportsResponse>(
        process.env.NEXT_PUBLIC_API_ENDPOINT + "/venu_events_by_report_count" + extension,
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
  