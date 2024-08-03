import axios from "axios";


export const cancelEvents = async (eventId: any) => {
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_ENDPOINT + "/venu_event_cancel",
        { event_id: eventId },
        {
            withCredentials: true, // This ensures cookies are sent with the request
            headers: {
              "Content-Type": "application/json", // Set the content type to JSON
            },
          }
      );
      return response;
    } catch (error) {
        console.error("API request failed:", error);
        throw error;
    }
  };