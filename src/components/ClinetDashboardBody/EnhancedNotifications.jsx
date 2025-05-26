import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './EnhancedNotifications.css';

// Enhanced Spinner Component
const Spinner = ({ size = 'small', color = '#3b82f6' }) => {
  const spinnerStyles = {
    width: size === 'small' ? '16px' : '24px',
    height: size === 'small' ? '16px' : '24px',
    border: `2px solid transparent`,
    borderTop: `2px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  return (
    <div style={spinnerStyles}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

// Individual Notification Item Component
const NotificationItem = ({ notification, onMarkAsRead, onDelete, onRedirect }) => {
  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'job_application': return '👥';
      case 'payment': return '💰';
      case 'project_update': return '📋';
      case 'message': return '💬';
      case 'rating': return '⭐';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'job_application': return '#3b82f6';
      case 'payment': return '#10b981';
      case 'project_update': return '#f59e0b';
      case 'message': return '#8b5cf6';
      case 'rating': return '#f97316';
      case 'system': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMs = now - notificationDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return notificationDate.toLocaleDateString();
  };

  const getRedirectPath = (notification) => {
    const data = notification.data || {};
    
    switch (notification.notification_type?.toLowerCase()) {
      case 'job_application':
        return data.job_id ? `/job-applications/${data.job_id}` : '/client-project';
      case 'payment':
        return data.payment_id ? `/client-pending-payments` : '/client-transactions';
      case 'project_update':
        return data.project_id ? `/project/${data.project_id}` : '/client-project';
      case 'message':
        return data.conversation_id ? `/client-conversation/${data.conversation_id}` : '/conversations';
      case 'rating':
        return '/client-project';
      default:
        return '/client-dashboard';
    }
  };

  const handleNotificationClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    
    const redirectPath = getRedirectPath(notification);
    onRedirect(redirectPath);
  };

  return (
    <div className={`notification-item ${!notification.is_read ? 'unread' : ''}`}>
      <div className="notification-content" onClick={handleNotificationClick}>
        <div className="notification-header">
          <div className="notification-icon-wrapper">
            <span 
              className="notification-icon"
              style={{ backgroundColor: getNotificationColor(notification.notification_type) }}
            >
              {getNotificationIcon(notification.notification_type)}
            </span>
            {!notification.is_read && <div className="unread-dot"></div>}
          </div>
          
          <div className="notification-meta">
            <span className="notification-time">{getTimeAgo(notification.created_at)}</span>
            <div className="notification-actions">
              {!notification.is_read && (
                <button
                  className="action-btn mark-read"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  title="Mark as read"
                >
                  ✓
                </button>
              )}
              <button
                className="action-btn delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                title="Delete notification"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="notification-body">
          <h4 className="notification-title">{notification.title}</h4>
          <p className="notification-message">{notification.message}</p>
          
          {notification.data && Object.keys(notification.data).length > 0 && (
            <div className="notification-data">
              {notification.data.amount && (
                <span className="data-tag amount">
                  💰 ₹{notification.data.amount}
                </span>
              )}
              {notification.data.job_title && (
                <span className="data-tag job">
                  📋 {notification.data.job_title}
                </span>
              )}
              {notification.data.applicant_name && (
                <span className="data-tag applicant">
                  👤 {notification.data.applicant_name}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="notification-footer">
          <span className="redirect-hint">
            Click to view details →
          </span>
        </div>
      </div>
    </div>
  );
};

// Main Enhanced Notifications Component
const EnhancedNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.midhung.in/api/notifications/?page=${pageNum}&filter=${filter}`,
        { withCredentials: true }
      );

      const newNotifications = response.data.notifications || [];
      
      if (reset || pageNum === 1) {
        setNotifications(newNotifications);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
      }

      setUnreadCount(response.data.unread_count || 0);
      setHasMore(newNotifications.length >= 10); // Assuming 10 per page
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `https://api.midhung.in/api/notifications/${notificationId}/read/`,
        {},
        { withCredentials: true }
      );

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.patch(
        'https://api.midhung.in/api/notifications/mark-all-read/',
        {},
        { withCredentials: true }
      );

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(
        `https://api.midhung.in/api/notifications/${notificationId}/`,
        { withCredentials: true }
      );

      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle redirect
  const handleRedirect = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  // Load more notifications
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1, false);
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
    fetchNotifications(1, true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when dropdown is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications(1, true);
  }, [filter]);

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) {
        fetchNotifications(1, true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isOpen, filter]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'read') return notification.is_read;
    return true;
  });

  return (
    <div className="enhanced-notifications" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        className={`notification-bell ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="notification-dropdown">
          {/* Header */}
          <div className="notification-header">
            <h3 className="header-title">
              <span className="header-icon">🔔</span>
              Notifications
            </h3>
            
            <div className="header-actions">
              {unreadCount > 0 && (
                <button
                  className="mark-all-read-btn"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  ✓ All
                </button>
              )}
              <button
                className="close-btn"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'read', label: 'Read', count: notifications.length - unreadCount }
            ].map(tab => (
              <button
                key={tab.key}
                className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
                onClick={() => handleFilterChange(tab.key)}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="tab-count">{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="notifications-list">
            {loading && notifications.length === 0 ? (
              <div className="loading-state">
                <Spinner />
                <span>Loading notifications...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  {filter === 'unread' ? '✅' : '🔔'}
                </div>
                <h4>
                  {filter === 'unread' 
                    ? 'All caught up!' 
                    : 'No notifications yet'
                  }
                </h4>
                <p>
                  {filter === 'unread'
                    ? 'You have no unread notifications'
                    : 'Notifications will appear here when you have activity'
                  }
                </p>
              </div>
            ) : (
              <>
                {filteredNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    onRedirect={handleRedirect}
                  />
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <div className="load-more-container">
                    <button
                      className="load-more-btn"
                      onClick={loadMore}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner size="small" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="notification-footer">
            <button
              className="view-all-btn"
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedNotifications;