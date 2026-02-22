import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";



const Messages = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: "PUT",
        credentials: "include",
      });
      await fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await fetchNotifications();
    } catch (error) {
      console.error("Failed to delete notification");
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: "PUT",
        credentials: "include",
      });
      await fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read");
    }
  };

  if (loading) return <p>Loading messages...</p>;

  return (
    <div className="messages-page">
      <div className="page-header">
        <h1>Messages</h1>
        <button className="primary-btn" onClick={markAllAsRead}>
          Mark All Read
        </button>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Message</th>
              <th>Type</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((item) => (
              <tr key={item._id}>
                <td>{item.title}</td>
                <td>{item.message}</td>
                <td>{item.type}</td>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
                <td>
                  <span className={`status ${item.isRead ? "active" : "inactive"}`}>
                    {item.isRead ? "Read" : "Unread"}
                  </span>
                </td>
                <td className="actions">
                  {!item.isRead && (
                    <button className="edit" onClick={() => markAsRead(item._id)}>
                      Read
                    </button>
                  )}
                  <button className="danger" onClick={() => deleteNotification(item._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {notifications.length === 0 && <p style={{ padding: "12px" }}>No messages found</p>}
      </div>
    </div>
  );
};

export default Messages;
