import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminHeaderComp from '../AdminHeaderComp/AdminHeaderComp';
import './AdminDashboard.css';

// Spinner Component (copied from ProfessionalDashBoardContent.jsx)
const Spinner = ({ size = 'medium', text = 'Loading...' }) => {
  const spinnerStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    },
    spinner: {
      width: size === 'small' ? '20px' : size === 'large' ? '60px' : '40px',
      height: size === 'small' ? '20px' : size === 'large' ? '60px' : '40px',
      border: `${size === 'small' ? '2px' : '3px'} solid #f3f3f3`,
      borderTop: `${size === 'small' ? '2px' : '3px'} solid #007bff`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '10px',
    },
    text: {
      color: '#666',
      fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
      fontWeight: '500',
    }
  };

  return (
    <div style={spinnerStyles.container}>
      <div style={spinnerStyles.spinner}></div>
      <span style={spinnerStyles.text}>{text}</span>
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

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    professionals: 0,
    clients: 0,
    totalJobs: 0,
    completedJobs: 0,
    pendingComplaints: 0,
    verifiedProfessionals: 0,
    activeApplications: 0,
    activeConversations: 0,
    totalPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        // Fetch user counts
        const userResponse = await axios.get('https://api.midhung.in/api/users/counts/', {
          withCredentials: true,
        });
        // Fetch job counts
        const jobResponse = await axios.get('https://api.midhung.in/api/jobs/counts/', {
          withCredentials: true,
        });
        // Fetch payment total
        const paymentResponse = await axios.get('https://api.midhung.in/api/payments/total/', {
          withCredentials: true,
        });

        setMetrics({
          professionals: userResponse.data.professionals,
          clients: userResponse.data.clients,
          pendingComplaints: userResponse.data.pending_complaints,
          verifiedProfessionals: userResponse.data.verified_professionals,
          totalJobs: jobResponse.data.total_jobs,
          completedJobs: jobResponse.data.completed_jobs,
          activeApplications: jobResponse.data.active_applications,
          activeConversations: jobResponse.data.active_conversations,
          totalPayments: paymentResponse.data.total_payments,
        });
      } catch (err) {
        if (err.response?.status === 403) {
          setIsUnauthorized(true);
        } else {
          setError(err.response?.data?.error || 'Failed to fetch metrics');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (isUnauthorized) {
    return (
      <div className="admin-dashboard">
        <AdminHeaderComp />
        <main>
          <h1>Admin Dashboard</h1>
          <div className="error-message">You do not have permission to access the admin dashboard.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <AdminHeaderComp />
      <main>
        <h1>Admin Dashboard</h1>
        {loading ? (
          <div style={{ margin: '20px 0', textAlign: 'center' }}>
            <Spinner size="medium" text="Loading dashboard metrics..." />
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="metrics-grid">
            <div className="metric-card">
              <h2>Professionals</h2>
              <p className="metric-value">{metrics.professionals}</p>
            </div>
            <div className="metric-card">
              <h2>Clients</h2>
              <p className="metric-value">{metrics.clients}</p>
            </div>
            <div className="metric-card">
              <h2>Verified Professionals</h2>
              <p className="metric-value">{metrics.verifiedProfessionals}</p>
            </div>
            <div className="metric-card">
              <h2>Pending Complaints</h2>
              <p className="metric-value">{metrics.pendingComplaints}</p>
            </div>
            <div className="metric-card">
              <h2>Total Jobs</h2>
              <p style={{color:'black'}} className="metric-value">{metrics.totalJobs}</p>
            </div>
            <div className="metric-card">
              <h2>Completed Works</h2>
              <p className="metric-value">{metrics.completedJobs}</p>
            </div>
            <div className="metric-card">
              <h2>Active Applications</h2>
              <p className="metric-value">{metrics.activeApplications}</p>
            </div>
            <div className="metric-card">
              <h2>Active Conversations</h2>
              <p className="metric-value">{metrics.activeConversations}</p>
            </div>
            <div className="metric-card">
              <h2>Total Payments (₹)</h2>
              <p className="metric-value">{metrics.totalPayments.toLocaleString()}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;