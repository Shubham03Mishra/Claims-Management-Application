"use client";
import React, { useEffect, useState } from 'react';
import { Modal, Table, notification, Pagination, Button, Typography } from 'antd';
import { fetchVenues } from '../utils/fetchVenues';
import { createVenue, venueTransfer, deleteVenue } from "../utils/venueAPI";
import { fetchUserDocId, fetchUserDetails } from '../utils/userAPI';
import "../styles/venues.module.css";

const { Link } = Typography;

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
  id: string,
  uid: string;
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
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  empty: boolean;
}

const VenuesFetchComponent: React.FC = () => {
  const [data, setData] = useState<ResponseData | null>(null);
  const [page, setPage] = useState<number>(1); // Starting from 1 since AntD Pagination is 1-based
  const [pageSize] = useState<number>(2); // Hardcoded size parameter
  const [createdVenues, setCreatedVenues] = useState<Set<string>>(new Set());
  const [venueData, setVenueData] = useState<any>(null);
  const [userDocIdData, setUserDocIdData] = useState<any>(null);
  const userDocumentId = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [userModalVisible, setUserModalVisible] = useState<boolean>(false);

  const fetchData = async (page: number) => {
    try {
      const response = await fetchVenues(page - 1, pageSize); // Adjust for 0-based index in backend
      const responseData = response as unknown as ResponseData;
      if (responseData.totalPages < responseData.pageable.pageNumber + 1) {
        Modal.error({
          title: 'Error',
          content: 'The current page number is greater than the total pages.',
        });
      } else {
        setData(responseData);
        setPage(responseData.pageable.pageNumber + 1); // Adjust for 1-based index in frontend
      }
    } catch (error) {
      notification.error({
        message: 'Fetch Error',
        description: 'There was an error fetching the data.',
      });
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleButtonClick = async (record: Content) => {
    const requestData = {
      name: record.name,
      category: 1,
      category_desc: record.category,
      capacity: 0,
      private: 0,
      description: record.description,
      position: {
        l: record.position.l,
        L: record.position.longitude,
      },
      addr: {
        rcpnt: record.addr.rcpnt,
        fl: record.addr.fl,
        sl: record.addr.sl,
        pc: record.addr.pc,
        cty: record.addr.cty,
        reg: record.addr.reg,
        ctry: record.addr.ctry,
      },
      event_conf_req: 1
    };

    try {
      const responseVenueId = await createVenue(requestData);
      setVenueData(responseVenueId.venue_id);
      notification.success({
        message: 'Venue Created',
        description: `Venue "${record.name}" created successfully.`,
      });
      setCreatedVenues(prev => new Set(prev).add(record.uid));

      const responseUserDocId = await fetchUserDocId(record.uid);
      setUserDocIdData(responseUserDocId.id);
      notification.success({
        message: 'User Document ID Fetched',
        description: `User document ID fetched successfully for user "${record.uid}".`,
      });

      const userResponseData = await venueTransfer(responseUserDocId.id, responseVenueId.venue_id);
      notification.success({
        message: 'Venue Transferred Successfully',
        description: `Venue was transferred successfully to user: "${record.uid}".`,
      });

    } catch (error) {
      notification.error({
        message: 'Creation Error',
        description: 'There was an error creating the venue or fetching user document ID.',
      });
    }
  };

  const handleDeleteButtonClick = async (id: string, name: string) => {
    try {
      await deleteVenue(id);
      notification.success({
        message: 'Venue Deleted Successfully',
        description: `Venue "${name}" was deleted successfully.`,
      });

      fetchData(page);

    } catch (error) {
      notification.error({
        message: 'Deletion Error',
        description: 'There was an error deleting the venue.',
      });
    }
  };

  const handleUserClick = async (uid: string) => {
    try {
      const responseUserDocId = await fetchUserDocId(uid);
      setUserDocIdData(responseUserDocId.id);

      const response = await fetchUserDetails(responseUserDocId.id);
      setUserDetails(response["$@user_details_for_admin"]);
      setUserModalVisible(true);
    } catch (error) {
      notification.error({
        message: 'Fetch Error',
        description: 'There was an error fetching the user details.',
      });
    }
  };

  const handleUserModalClose = () => {
    setUserModalVisible(false);
    setUserDetails(null);
  };

  const handleSeeOnMapClick = (position: Position) => {
    const url = `https://maps.google.com/?q=${position.l},${position.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="venues-container">
      {data && (
        <>
          <Table
            dataSource={data.content}
            columns={[
              {
                title: 'User ID',
                dataIndex: 'uid',
                key: 'uid',
                render: (uid: string) => (
                  <Link onClick={() => handleUserClick(uid)}>{uid}</Link>
                ),
              },
              { title: 'Name', dataIndex: 'name', key: 'name' },
              { title: 'Category', dataIndex: 'category', key: 'category' },
              { title: 'Description', dataIndex: 'description', key: 'description' },
              { title: 'Rating', dataIndex: 'rating', key: 'rating' },
              {
                title: 'Address',
                dataIndex: 'addr',
                key: 'addr',
                render: (addr: Address) =>
                  `${addr.rcpnt}, ${addr.fl}, ${addr.sl}, ${addr.pc}, ${addr.cty}, ${addr.ctry}`,
              },
              {
                title: 'Action',
                key: 'action',
                render: (text, record) => (
                  <div>
                    <Button
                      onClick={() => handleButtonClick(record)}
                      disabled={createdVenues.has(record.uid)}
                      type={createdVenues.has(record.uid) ? 'default' : 'primary'}
                    >
                      {createdVenues.has(record.uid) ? 'Venue Created' : 'Create Venue'}
                    </Button>
                    <Button
                      danger
                      onClick={() => handleDeleteButtonClick(record.id, record.name)}
                    >
                      Delete Venue
                    </Button>
                    <Button
                      onClick={() => handleSeeOnMapClick(record.position)}
                      type="default"
                    >
                      See on Map
                    </Button>
                  </div>
                ),
              },
            ]}
            rowKey="uid"
            pagination={false}
          />
          <Pagination
            current={page}
            pageSize={pageSize}
            total={data.totalElements}
            onChange={handlePageChange}
          />
          <Modal
            title="User Details"
            open={userModalVisible}
            onCancel={handleUserModalClose}
            footer={[
              <Button key="close" onClick={handleUserModalClose} type="primary">
                Close
              </Button>
            ]}
          >
            {userDetails && (
              <div>
                <p><strong>First Name:</strong> {userDetails.fn}</p>
                <p><strong>Last Name:</strong> {userDetails.ln}</p>
                <p><strong>Email:</strong> {userDetails.mail}</p>
                <p><strong>Phone Number:</strong> {userDetails.phone}</p>
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default VenuesFetchComponent;