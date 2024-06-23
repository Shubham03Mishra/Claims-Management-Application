"use client";
import React, { useState, useEffect } from "react";
import { Card, Button, List, Typography, Spin, Alert, Modal, message } from "antd";
import styles from "./reservation.module.css";
import { fetchClaims, claimAccept, claimReject, Claim, ClaimResponse } from "../utils/venueClaims";

const { Title, Text } = Typography;

const Claims: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const loadClaims = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: ClaimResponse = await fetchClaims();
      setClaims(data.rows);
    } catch (error) {
      setError("Failed to fetch claims.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      // Wait for the cookie to be set
      await delay(500); // Adjust the delay as needed
      await loadClaims();
    };
    initialize();
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
      } catch (error) {
        // Handle error if needed
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
      } catch (error) {
        // Handle error if needed
      } finally {
        setRejectingId(null);
      }
    }
  };

  return (
    <div className={styles.container}>
      {loading ? (
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