"use client";
import React, { useState, useEffect } from "react";
import { Card, Button, List, Typography, Spin, Alert, Modal, message, Pagination } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import styles from "./reservation.module.css";
import { fetchClaims, claimAccept, claimReject, Claim, ClaimResponse, FetchClaimsRequest } from "../utils/venueClaims";

const { Title, Text } = Typography;

const Claims: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const loadClaims = async (reset: boolean = false) => {
    if (loading || (!hasMore && !reset)) return;
    setLoading(true);
    setError(null);
    try {
      const requestData: FetchClaimsRequest = {
        cursor: reset ? null : cursor,
        limit: pageSize,
      };
      const response: ClaimResponse = await fetchClaims(requestData);
      if (reset) {
        setClaims(response.rows);
      } else if (response.rows.length > 0) {
        setClaims((prev) => [...prev, ...response.rows]);
      }
      setCursor(response.cursor); // Update cursor
      setHasMore(!!response.cursor);
    } catch (error) {
      setError("Failed to fetch claims.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims(true); // Reset on component mount
  }, []);

  const handleAccept = (id: string) => {
    setAcceptingId(id);
  };

  const handleReject = (id: string) => {
    setRejectingId(id);
  };

  const handleAcceptConfirm = async () => {
    if (acceptingId) {
      try {
        await claimAccept(acceptingId);
        setClaims((prev) =>
          prev.map((claim) =>
            claim.id === acceptingId ? { ...claim, r: { ...claim.r, accepted: true } } : claim
          )
        );
        message.success("Claim accepted successfully");
      } catch (error) {
        message.error("Failed to accept claim.");
      } finally {
        setAcceptingId(null);
      }
    }
  };

  const handleRejectConfirm = async () => {
    if (rejectingId) {
      try {
        await claimReject(rejectingId);
        setClaims((prev) =>
          prev.map((claim) =>
            claim.id === rejectingId ? { ...claim, r: { ...claim.r, rejected: true } } : claim
          )
        );
        message.success("Claim rejected successfully");
      } catch (error) {
        message.error("Failed to reject claim.");
      } finally {
        setRejectingId(null);
      }
    }
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
    setCursor(null); // Reset cursor for new page request
    setClaims([]); // Clear claims to fetch new data
    setHasMore(true); // Reset hasMore for new page request
    loadClaims(true); // Load claims with reset
  };

  return (
    <div className={styles.container}>
      {loading && claims.length === 0 ? (
        <Spin size="large" />
      ) : error ? (
        <Alert message={error} type="error" />
      ) : (
        <>
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
                          <strong>Address:</strong> {item.r.venue.addr.fl}
                        </p>
                      </Text>
                      <Text>
                        <p>
                          <strong>Description:</strong> {item.r.venue.description}
                        </p>
                      </Text>
                      <Text>
                        <p>
                          <strong>Organizer:</strong>{" "}
                          {item.r.user.first_name} {item.r.user.last_name}
                        </p>
                      </Text>
                      <Text>
                        <p>
                          <strong>Email:</strong> {item.r.user.email}{" "}
                        </p>
                      </Text>
                      <Text>
                        <p>
                          <strong>Timestamp:</strong>{" "}
                          {new Date(item.r.timestamp * 1000).toLocaleString()}{" "}
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
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={claims.length + (hasMore ? pageSize : 0)}
            onChange={handlePageChange}
            showSizeChanger
          />
        </>
      )}
      <Modal
        title="Confirm Acceptance"
        visible={!!acceptingId}
        onOk={handleAcceptConfirm}
        onCancel={() => setAcceptingId(null)}
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

export default Claims;
