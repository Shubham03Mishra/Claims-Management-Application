"use client";
import React from 'react';
import { Tabs } from 'antd';
import ClaimManagement from "../claim/page";
import VenuesFetchComponent from '../venues/page';
import ReportsComponent from '../reports/page';  // Import the ReportsComponent
import styles from '../styles/dashboard.module.css'; // Import the CSS file

const { TabPane } = Tabs;

const Dashboard: React.FC = () => {
  return (
    <div className={styles.container}>
      <Tabs defaultActiveKey="1" centered>
        <TabPane tab="Claim Management" key="1">
          <ClaimManagement />
        </TabPane>
        <TabPane tab="Venues" key="2">
          <VenuesFetchComponent />
        </TabPane>
        <TabPane tab="Reports" key="3">
          <ReportsComponent />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Dashboard;
