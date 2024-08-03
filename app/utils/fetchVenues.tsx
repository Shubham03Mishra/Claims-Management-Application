import axios from 'axios';
import { message } from 'antd';

interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

interface Position {
  l: number;
  longitude: number;
}

interface Address {
  rcpnt: string;
  fl: string;
  sl: string;
  pc: string;
  cty: string;
  reg: string;
  ctry: number;
}

interface Content {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  position: Position;
  addr: Address;
}

interface ResponseData {
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  content: Content[];
  sort: Sort;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageable: Pageable;
  empty: boolean;
}

export const fetchVenues = async (page: number, size: number): Promise<ResponseData> => {
  try {
    const response = await axios.get<ResponseData>(
      `http://192.168.0.113:8080/venuesFetch?page=${page}&size=${size}`,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Fetch venues request failed:", error);
    message.error("Failed to fetch venues");
    throw error;
  }
};
