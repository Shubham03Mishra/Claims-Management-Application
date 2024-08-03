"use client";
import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import styles from "../styles/login.module.css";
import { loginUser } from "../utils/userAPI";
import { useRouter } from "next/navigation";  // Updated import for Next.js 13+

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();  // Initialize the router
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const onFinish = async (values: { userId: string; password: string }) => {
    if (values.userId !== "root") {
      message.error("Access denied. Only root user can login.");
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser({ uid: values.userId, pwd: values.password });
      if (response && response.status === 200) {
        message.success("Login successful!");
        setLoggedIn(true); // Set the loggedIn state to true upon successful login
        router.push("/dashboard"); // Redirect to /dashboard
      } else {
        message.error("Login failed!");
      }
    } catch (error) {
      message.error("Login failed. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Login</h2>
      <Form name="login" layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="userId"
          rules={[{ required: true, message: "Please enter your user ID" }]}
        >
          <Input placeholder="User ID" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please enter your password" }]}
        >
          <Input.Password
            placeholder="Password"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginPage;
