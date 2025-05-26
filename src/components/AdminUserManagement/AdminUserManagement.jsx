import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminUserManagement.css';
import AdminHeaderComp from '../AdminHeaderComp/AdminHeaderComp';

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

function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Added loading state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of users per page

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true); // Start spinner
        const response = await axios.get('https://api.midhung.in/api/users/', {
          withCredentials: true,
        });
        setUsers(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch users');
      } finally {
        setLoading(false); // Stop spinner
      }
    };

    fetchUsers();
  }, []);

  // Handle block/unblock action
  const handleBlockUnblock = async (userId, isBlocked) => {
    try {
      const response = await axios.patch(
        `https://api.midhung.in/api/users/${userId}/block-unblock/`,
        { is_blocked: !isBlocked },
        { withCredentials: true }
      );
      // Update the user list after successful block/unblock
      setUsers(users.map(user =>
        user.id === userId ? { ...user, is_blocked: !isBlocked } : user
      ));
      alert(response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user status');
    }
  };

  // Pagination logic
  const paginate = (items, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  const getPageCount = (items) => Math.ceil(items.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const PaginationControls = ({ totalItems }) => {
    const pageCount = getPageCount(totalItems);
    const pages = [];

    for (let i = 1; i <= pageCount; i++) {
      pages.push(i);
    }

    return (
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className="page-btn"
        >
          Previous
        </button>
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`page-btn ${currentPage === page ? 'active' : ''}`}
          >
            {page}
          </button>
        ))}
        <button
          disabled={currentPage === pageCount}
          onClick={() => handlePageChange(currentPage + 1)}
          className="page-btn"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="admin-user-management">
      <AdminHeaderComp />
      <main>
        <h1>User Management</h1>
        {loading ? (
          <div style={{ margin: '20px 0', textAlign: 'center' }}>
            <Spinner size="medium" text="Loading users..." />
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <table className="user-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="user-table-data">
                {paginate(users, currentPage).map(user => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.name}</td>
                    <td>{user.role}</td>
                    <td>{user.is_blocked ? 'Blocked' : 'Active'}</td>
                    <td>
                      <button
                        onClick={() => handleBlockUnblock(user.id, user.is_blocked)}
                        className={user.is_blocked ? 'unblock-button' : 'block-button'}
                      >
                        {user.is_blocked ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length > 0 && <PaginationControls totalItems={users} />}
          </>
        )}
      </main>
    </div>
  );
}

export default AdminUserManagement;