"use client";
import React, { useEffect, useState } from 'react';
import { Table, Pagination, notification, Empty, Switch, Button } from 'antd';
import { fetchEventReports, EventReportsResponse } from '../utils/reportAPI';
import { cancelEvents } from '../utils/eventsAPI'; // Import the cancelEvents function
import moment from 'moment';
import '../styles/reports.module.css'; // Import the CSS file

const ReportsComponent: React.FC = () => {
  const [data, setData] = useState<EventReportsResponse | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [deletedEvents, setDeletedEvents] = useState<Set<string>>(new Set());

  const fetchData = async (page: number) => {
    try {
      const requestData = JSON.stringify({
        limit: pageSize,
        cursor: data?.cursor?.l || null,
      });
      const responseData = await fetchEventReports("", requestData);
      if (responseData.rows.length === 0) {
        notification.info({
          message: 'No Data',
          description: 'No event reports are available.',
        });
      }
      // Filter out the events with state 4
      const filteredData = {
        ...responseData,
        rows: responseData.rows.filter(row => row.r.state !== 4)
      };
      setData(filteredData);
    } catch (error) {
      notification.error({
        message: 'Fetch Error',
        description: 'There was an error fetching the event reports.',
      });
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleDeleteButtonClick = async (eventId: string, eventName: string) => {
    try {
      await cancelEvents(eventId); // Call the cancelEvents function with the event ID
      notification.success({
        message: 'Event Deleted Successfully',
        description: `Event "${eventName}" was deleted successfully.`,
      });

      setDeletedEvents((prev) => new Set(prev).add(eventId)); // Add the deleted event ID to the set

      // Remove the deleted event from the data
      setData((prevData) => ({
        ...prevData,
        rows: prevData?.rows.filter(row => row.id !== eventId) || [],
      }));

    } catch (error) {
      notification.error({
        message: 'Deletion Error',
        description: 'There was an error deleting the event.',
      });
    }
  };

  const getRowStyle = (reportCount: number) => {
    const ratio = reportCount / 10;
    const red = Math.min(255, Math.floor(255 * ratio));
    const color = `rgba(${red}, 0, 0, 0.2)`;
    const fontColor = '#000000'; //red > 127 ? '#000000' : 
    return { backgroundColor: color, color: fontColor };
  };

  return (
    <div>
      <h2>Reports</h2>
      {data ? (
        data.rows.length > 0 ? (
          <>
            <Table
              dataSource={data.rows}
              columns={[
                { title: 'Report Count', dataIndex: ['r', 'report_count'], key: 'report_count' },
                { title: 'Venue Name', dataIndex: ['r', 'venue_name'], key: 'venue_name' },
                { title: 'Event Name', dataIndex: ['r', 'name'], key: 'name' },
                {
                  title: 'Private',
                  dataIndex: ['r', 'private'],
                  key: 'private',
                  render: (isPrivate: number) => (
                    <Switch checked={isPrivate === 1} disabled />
                  ),
                },
                {
                  title: 'Start Time',
                  dataIndex: ['r', 'start'],
                  key: 'start',
                  render: (start: number) => moment.unix(start).format('YYYY-MM-DD HH:mm:ss'),
                },
                { title: 'Organizer Name', dataIndex: ['r', 'organizer_dn'], key: 'organizer_dn' },
                {
                  title: 'Action',
                  key: 'action',
                  render: (text, record) => {
                    const isDeleted = deletedEvents.has(record.id);
                    return (
                      <Button
                        danger={!isDeleted}
                        disabled={isDeleted}
                        onClick={() => handleDeleteButtonClick(record.id, record.r.name)}
                      >
                        {isDeleted ? 'Event Deleted' : 'Delete Event'}
                      </Button>
                    );
                  },
                },
              ]}
              rowKey="id"
              pagination={false}
              rowClassName={(record) => 'custom-row'} // Add a custom class to each row
              onRow={(record) => {
                return {
                  style: getRowStyle(record.r.report_count), // Apply styles based on report count
                };
              }}
            />
            <Pagination
              current={page}
              pageSize={pageSize}
              total={data.rows.length}
              onChange={handlePageChange}
            />
          </>
        ) : (
          <Empty description="No Data" />
        )
      ) : (
        <Empty description="No Data" />
      )}
    </div>
  );
};

export default ReportsComponent;
