"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  List,
  Typography,
  Pagination,
  Spin,
  Alert,
  Modal,
  message,
} from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import styles from "../styles/claim.module.css";
import {
  fetchClaims,
  claimAccept,
  claimReject,
  ClaimResponse,
  Claim,
} from "../utils/venueClaims";
import { updateVenuOwner } from "../utils/venueClaims"; // Ensure you import the sendVenueData function

const { Title, Text } = Typography;

const ClaimManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [claimsCache, setClaimsCache] = useState<{ [key: number]: Claim[] }>({});
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [cursor, setCursor] = useState<any>(null); // Change the type of cursor to any
  const [nextEnable, setNextEnable] = useState<boolean>(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const pageSize = 5;

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const loadClaims = async (page: number) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    // Check cache first
    if (claimsCache[page]) {
      setClaims(claimsCache[page]);
      setLoading(false);
      return;
    }

    try {
      const requestData = JSON.stringify({
        limit: pageSize,
        cursor: cursor,
      });

      const extension = cursor ? "_next" : "";
      const data: ClaimResponse = await fetchClaims(extension, requestData);

      if (!Array.isArray(data.rows)) {
        throw new Error("Invalid response format");
      }

      const newClaims = data.rows;
      setClaims(newClaims);
      setClaimsCache((prevCache) => ({
        ...prevCache,
        [page]: newClaims,
      }));
      const hasCursor = data.cursor !== undefined && data.cursor.l !== undefined;
      setCursor(hasCursor ? data.cursor : null);
      setNextEnable(hasCursor);
      // Update totalItems based on nextEnable status
      setTotalItems(hasCursor ? page * pageSize + 1 : page * pageSize);
    } catch (error) {
      setError("Failed to fetch claims.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims(currentPage);
  }, [currentPage]);

  const handleAccept = (id: string) => {
    setConfirmingId(id);
  };

  const handleReject = (id: string) => {
    setRejectingId(id);
  };

  const handleConfirm = async () => {
    if (confirmingId) {
      try {
        const claim = claims.find((claim) => claim.id === confirmingId);
        if (!claim) throw new Error("Claim not found");
        const venue = claim.r.venue;
        venue.event_conf_req = 1;
        const response = await updateVenuOwner(venue);
        if(Object.keys(response.data).length === 0){
          const claimAcceptResponse = await claimAccept(confirmingId);

          if(Object.keys(claimAcceptResponse.data).length === 0){
            message.success("Claim accepted successfully");
            await delay(10);
            window.location.reload();
          }
        }
      } catch (error) {
        message.error("Failed to accept claim");
      } finally {
        setConfirmingId(null);
      }
    }
  };

  const handleRejectConfirm = async () => {
    if (rejectingId) {
      try {
        const claim = claims.find((claim) => claim.id === rejectingId);
        if (!claim) throw new Error("Claim not found");
        console.log(rejectingId);
        console.log(claim);
        const venue = claim.r.venue;
        venue.event_conf_req = 0;
        const response = await updateVenuOwner(venue);
        if(Object.keys(response.data).length === 0){
          const claimRejectResponse = await claimReject(rejectingId);

          if(Object.keys(claimRejectResponse.data).length === 0){
            message.success("Claim rejected successfully");
            await delay(10);
            window.location.reload();
          }
        }
      } catch (error) {
        message.error("Failed to reject claim");
      } finally {
        setRejectingId(null);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className={styles.container}>
      <Title level={2}>Venue Claims</Title>
      {loading && !claims.length ? (
        <Spin size="large" />
      ) : error ? (
        <Alert message={error} type="error" />
      ) : (
        <List
          dataSource={claims}
          renderItem={(item) => (
            <List.Item>
              <Card className={styles.card}>
                <div className={styles.cardContent}>
                  <div className={styles.details}>
                    <Title level={5}>{item.r.venue.name}</Title>
                    <Text>
                      <p>
                        <strong>Description:</strong> {item.r.venue.description}
                      </p>
                    </Text>
                    <Text>
                      <p>
                        <strong>Organizer:</strong> {item.r.user.first_name}{" "}
                        {item.r.user.last_name}
                      </p>
                    </Text>
                    <Text>
                      <p>
                        <strong>Email:</strong> {item.r.user.email}
                      </p>
                    </Text>
                    <Text>
                      <p>
                        <strong>Timestamp:</strong>{" "}
                        {new Date(item.r.timestamp * 1000).toLocaleString()}
                      </p>
                    </Text>
                  </div>
                  <div className={styles.actions}>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleAccept(item.id)}
                    >
                      Accept
                    </Button>
                    <Button
                      danger
                      size="small"
                      onClick={() => handleReject(item.id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
      {claims.length > 0 && (
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={totalItems}
          onChange={handlePageChange}
          className={styles.pagination}
          showSizeChanger={false}
          disabled={loading}
        />
      )}
      <Modal
        title="Confirm Acceptance"
        visible={!!confirmingId}
        onOk={handleConfirm}
        onCancel={() => setConfirmingId(null)}
      >
        <p>Are you sure you want to accept this claim?</p>
      </Modal>
      <Modal
        title="Confirm Rejection"
        visible={!!rejectingId}
        onOk={handleRejectConfirm}
        onCancel={() => setRejectingId(null)}
      >
        <p>Are you sure you want to reject this claim?</p>
      </Modal>
    </div>
  );
};

export default ClaimManagement;
