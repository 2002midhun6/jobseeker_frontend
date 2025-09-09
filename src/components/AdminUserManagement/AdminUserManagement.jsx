import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminUserManagement.css';
import AdminHeaderComp from '../AdminHeaderComp/AdminHeaderComp';

const baseUrl = import.meta.env.VITE_API_URL;


const AdminUserSpinner = ({ text = 'Loading...' }) => (
  <div className="admin-user-spinner-container">
    <div className="admin-user-loading-spinner"></div>
    <p className="admin-user-spinner-text">{text}</p>
  </div>
);


const UserStatsSummary = ({ users, filteredUsers }) => {
  const stats = {
    total: users.length,
    active: users.filter(user => !user.is_blocked && user.is_verified).length,
    blocked: users.filter(user => user.is_blocked).length,
    unverified: users.filter(user => !user.is_verified).length, 
    clients: users.filter(user => user.role === 'client').length,
    professionals: users.filter(user => user.role === 'professional').length,
    admins: users.filter(user => user.role === 'admin').length,
    filtered: filteredUsers.length
  };

  return (
    <div className="user-stats-summary">
      <div className="user-stat-item">
        <h4>Total Users</h4>
        <p>{stats.total}</p>
      </div>
      <div className="user-stat-item">
        <h4>Active Users</h4>
        <p>{stats.active}</p>
      </div>
      <div className="user-stat-item">
        <h4>Blocked Users</h4>
        <p>{stats.blocked}</p>
      </div>
      <div className="user-stat-item">
        <h4>Unverified</h4>
        <p>{stats.unverified}</p>
      </div>
      <div className="user-stat-item">
        <h4>Clients</h4>
        <p>{stats.clients}</p>
      </div>
      <div className="user-stat-item">
        <h4>Professionals</h4>
        <p>{stats.professionals}</p>
      </div>
    </div>
  );
};


const getUserStatus = (user) => {
  if (!user.is_verified) return 'unverified';
  if (user.is_blocked) return 'blocked';
  return 'active';
};


const getStatusText = (user) => {
  const status = getUserStatus(user);
  switch (status) {
    case 'unverified': return 'Unverified';
    case 'blocked': return 'Blocked';
    case 'active': return 'Active';
    default: return 'Unknown';
  }
};


const UserCard = ({ user, onBlockUnblock, onDeleteUser, onVerifyUser }) => {
  const status = getUserStatus(user);
  
  return (
    <div className="user-card">
      <div className="user-card-header">
        <div className="user-card-info">
          <h4>{user.name}</h4>
          <p>{user.email}</p>
        </div>
        <span className={`status-badge status-${status}`}>
          {getStatusText(user)}
        </span>
      </div>
      
      <div className="user-card-details">
        <div className="user-detail-item">
          <span className="user-detail-label">Role</span>
          <span className={`role-badge role-${user.role}`}>
            {user.role}
          </span>
        </div>
        <div className="user-detail-item">
          <span className="user-detail-label">Status</span>
          <span className="user-detail-value">{getStatusText(user)}</span>
        </div>
      </div>
      
      <div className="user-card-actions">
        {!user.is_verified ? (
          <>
            <button
              onClick={() => onVerifyUser(user.id)}
              className="verify-button"
            >
              Verify User
            </button>
            <button
              onClick={() => onDeleteUser(user.id)}
              className="delete-button"
            >
              Delete User
            </button>
          </>
        ) : (
          <button
            onClick={() => onBlockUnblock(user.id, user.is_blocked)}
            className={user.is_blocked ? 'unblock-button' : 'block-button'}
          >
            {user.is_blocked ? 'Unblock User' : 'Block User'}
          </button>
        )}
      </div>
    </div>
  );
};


const PaginationControls = ({ totalItems, currentPage, onPageChange, itemsPerPage }) => {
  const pageCount = Math.ceil(totalItems.length / itemsPerPage);
  
  if (pageCount <= 1) return null;

  const maxVisiblePages = 5;
  const pages = [];
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems.length);

  return (
    <div style={{ marginTop: '32px' }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '16px',
        color: '#6b7280',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        Showing {startIndex} to {endIndex} of {totalItems.length} users
      </div>

      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="page-btn"
        >
          Previous
        </button>
        
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`page-btn ${currentPage === page ? 'active' : ''}`}
          >
            {page}
          </button>
        ))}
        
        <button
          disabled={currentPage === pageCount}
          onClick={() => onPageChange(currentPage + 1)}
          className="page-btn"
        >
          Next
        </button>
      </div>
    </div>
  );
};

function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`${baseUrl}/api/users/`, {
          withCredentials: true,
        });
        setUsers(response.data || []);
        setFilteredUsers(response.data || []);
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'Failed to fetch users';
        setError(errorMessage);
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

 
  useEffect(() => {
    let filtered = users;

    if (searchQuery.trim()) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (filterType) {
      case 'active':
        filtered = filtered.filter(user => !user.is_blocked && user.is_verified);
        break;
      case 'blocked':
        filtered = filtered.filter(user => user.is_blocked);
        break;
      case 'unverified':
        filtered = filtered.filter(user => !user.is_verified);
        break;
      case 'client':
        filtered = filtered.filter(user => user.role === 'client');
        break;
      case 'professional':
        filtered = filtered.filter(user => user.role === 'professional');
        break;
      case 'admin':
        filtered = filtered.filter(user => user.role === 'admin');
        break;
      default:
        break;
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchQuery, filterType]);

 
  const handleBlockUnblock = async (userId, isBlocked) => {
    try {
      setError('');
      setSuccessMessage('');
      
      const response = await axios.patch(
        `${baseUrl}/api/users/${userId}/block-unblock/`,
        { is_blocked: !isBlocked },
        { withCredentials: true }
      );
      
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, is_blocked: !isBlocked } : user
      );
      setUsers(updatedUsers);
      
      setSuccessMessage(response.data.message || `User ${!isBlocked ? 'blocked' : 'unblocked'} successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update user status';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  };


  const handleVerifyUser = async (userId) => {
    try {
      setError('');
      setSuccessMessage('');
      
      const response = await axios.patch(
        `${baseUrl}/api/users/${userId}/verify/`,
        {},
        { withCredentials: true }
      );
      
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, is_verified: true } : user
      );
      setUsers(updatedUsers);
      
      setSuccessMessage('User verified successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to verify user';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  };


  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this unverified user? This action cannot be undone.')) {
      return;
    }

    try {
      setError('');
      setSuccessMessage('');
      
      await axios.delete(
        `${baseUrl}/api/users/${userId}/`,
        { withCredentials: true }
      );
      
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      
      setSuccessMessage('User deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete user';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const paginate = (items, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  return (
    <div className="admin-user-management">
      <AdminHeaderComp />
      <main>
        <h1>User Management</h1>
        
        {!loading && !error && <UserStatsSummary users={users} filteredUsers={filteredUsers} />}
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        
        {/* Updated Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            <span>📊</span>
            All ({users.length})
          </button>
          <button
            className={`filter-tab ${filterType === 'active' ? 'active' : ''}`}
            onClick={() => handleFilterChange('active')}
          >
            <span>✅</span>
            Active ({users.filter(u => !u.is_blocked && u.is_verified).length})
          </button>
          <button
            className={`filter-tab ${filterType === 'blocked' ? 'active' : ''}`}
            onClick={() => handleFilterChange('blocked')}
          >
            <span>🚫</span>
            Blocked ({users.filter(u => u.is_blocked).length})
          </button>
          <button
            className={`filter-tab ${filterType === 'unverified' ? 'active' : ''}`}
            onClick={() => handleFilterChange('unverified')}
          >
            <span>⏳</span>
            Unverified ({users.filter(u => !u.is_verified).length})
          </button>
          <button
            className={`filter-tab ${filterType === 'client' ? 'active' : ''}`}
            onClick={() => handleFilterChange('client')}
          >
            <span>🏢</span>
            Clients ({users.filter(u => u.role === 'client').length})
          </button>
          <button
            className={`filter-tab ${filterType === 'professional' ? 'active' : ''}`}
            onClick={() => handleFilterChange('professional')}
          >
            <span>👨‍💼</span>
            Professionals ({users.filter(u => u.role === 'professional').length})
          </button>
        </div>
        
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        {loading ? (
          <AdminUserSpinner text="Loading users..." />
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            {searchQuery || filterType !== 'all' 
              ? 'No users found matching your criteria.' 
              : 'No users found in the system.'}
          </div>
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
                {paginate(filteredUsers, currentPage).map(user => {
                  const status = getUserStatus(user);
                  return (
                    <tr key={user.id}>
                      <td>{user.email}</td>
                      <td>{user.name}</td>
                      <td>
                        <span className={`role-badge role-${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span style={{color:'black'}} className={`status-badge status-${status}`}>
                          {getStatusText(user)}
                        </span>
                      </td>
                      <td>
                        {!user.is_verified ? (
                          <div className="action-buttons">
                            
                          </div>
                        ) : (
                          <button
                            onClick={() => handleBlockUnblock(user.id, user.is_blocked)}
                            className={user.is_blocked ? 'unblock-button' : 'block-button'}
                          >
                            {user.is_blocked ? 'Unblock' : 'Block'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Updated Mobile Card View */}
            <div className="user-cards">
              {paginate(filteredUsers, currentPage).map(user => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  onBlockUnblock={handleBlockUnblock}
                  onDeleteUser={handleDeleteUser}
                  onVerifyUser={handleVerifyUser}
                />
              ))}
            </div>

            <PaginationControls
              totalItems={filteredUsers}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default AdminUserManagement;