import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/AuthContext';
import './ClientDashboardBody.css';
import Notifications from '../Notification/Notification';

// Spinner Component
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

// Project Card Component
const ProjectCard = ({ project, type }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return '#28a745';
      case 'assigned': return '#ffc107';
      case 'completed': return '#007bff';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e0e0e0',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <h3 style={{ color: '#333', margin: '0', fontSize: '18px', fontWeight: '600' }}>
          {project.title || 'Untitled Project'}
        </h3>
        <span 
          style={{
            backgroundColor: getStatusColor(project.status),
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500',
            textTransform: 'capitalize'
          }}
        >
          {project.status || 'Unknown'}
        </span>
      </div>

      <p style={{ color: '#666', marginBottom: '15px', lineHeight: '1.5' }}>
        {project.description ? 
          (project.description.length > 150 ? 
            `${project.description.substring(0, 150)}...` : 
            project.description) : 
          'No description available'
        }
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
        <div>
          <strong style={{ color: '#333', fontSize: '14px' }}>Budget:</strong>
          <p style={{ margin: '5px 0 0 0', color: '#28a745', fontWeight: '600' }}>
            {formatCurrency(project.budget)}
          </p>
        </div>

        {project.advance_payment && (
          <div>
            <strong style={{ color: '#333', fontSize: '14px' }}>Advance:</strong>
            <p style={{ margin: '5px 0 0 0', color: '#ffc107', fontWeight: '600' }}>
              {formatCurrency(project.advance_payment)}
            </p>
          </div>
        )}

        <div>
          <strong style={{ color: '#333', fontSize: '14px' }}>Deadline:</strong>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>
            {formatDate(project.deadline)}
          </p>
        </div>

        <div>
          <strong style={{ color: '#333', fontSize: '14px' }}>Created:</strong>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>
            {formatDate(project.created_at)}
          </p>
        </div>

        {project.applicants_count !== undefined && (
          <div>
            <strong style={{ color: '#333', fontSize: '14px' }}>Applicants:</strong>
            <p style={{ margin: '5px 0 0 0', color: '#007bff', fontWeight: '600' }}>
              {project.applicants_count}
            </p>
          </div>
        )}

        {project.rating && (
          <div>
            <strong style={{ color: '#333', fontSize: '14px' }}>Rating:</strong>
            <p style={{ margin: '5px 0 0 0', color: '#ffc107', fontWeight: '600' }}>
              {project.rating}/5 ⭐
            </p>
          </div>
        )}
      </div>

      {project.review && (
        <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <strong style={{ color: '#333', fontSize: '14px' }}>Review:</strong>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontStyle: 'italic' }}>
            "{project.review}"
          </p>
        </div>
      )}
    </div>
  );
};

// Statistics Card Component
const StatCard = ({ title, value, subValue, color, icon }) => (
  <div style={{
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e0e0e0',
  }}>
    <div style={{ fontSize: '24px', marginBottom: '10px' }}>{icon}</div>
    <h3 style={{ color: color, fontSize: '28px', margin: '0 0 5px 0', fontWeight: '700' }}>
      {value}
    </h3>
    <p style={{ color: '#666', margin: '0', fontSize: '14px', fontWeight: '500' }}>
      {title}
    </p>
    {subValue && (
      <p style={{ color: '#999', margin: '5px 0 0 0', fontSize: '12px' }}>
        {subValue}
      </p>
    )}
  </div>
);

function ClientDashBoardContent() {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const { user, isAuthenticated } = authContext || { user: null, isAuthenticated: false };

  const [projectData, setProjectData] = useState({ active: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Calculate statistics
  const stats = {
    totalProjects: projectData.active.length + projectData.completed.length,
    activeProjects: projectData.active.length,
    completedProjects: projectData.completed.length,
    totalBudget: [...projectData.active, ...projectData.completed].reduce((sum, project) => sum + (project.budget || 0), 0),
    avgRating: projectData.completed.filter(p => p.rating).length > 0 ? 
      (projectData.completed.filter(p => p.rating).reduce((sum, p) => sum + p.rating, 0) / 
       projectData.completed.filter(p => p.rating).length).toFixed(1) : null,
  };

  useEffect(() => {
    const fetchProjectCounts = async () => {
      try {
        const response = await axios.get('https://api.midhung.in/api/client-project/', {
          withCredentials: true,
        });
        
        setProjectData({
          active: response.data.active || [],
          completed: response.data.completed || [],
        });
        setLoading(false);
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'Failed to fetch project data';
        setError(errorMessage);
        setLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: '#dc3545',
          timer: 3000,
          timerProgressBar: true,
        });
      }
    };

    if (isAuthenticated && user && user.role === 'client') {
      fetchProjectCounts();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'client') {
      navigate('/login');
    }
  }, [user, isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="client-dashboard">
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: 'whitesmoke', marginBottom: '10px' }}>
          Welcome back, {user.name}! 👋
        </h1>
        <p style={{ color: 'whitesmoke', fontSize: '16px' }}>
          Here's an overview of your projects and activities
        </p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: 'whitesmoke', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
          🔔 Notifications 
          <span style={{ marginLeft: '10px' }}>
            <Notifications />
          </span>
        </h2>
      </div>

      {loading ? (
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: '12px', 
          padding: '40px', 
          margin: '20px 0' 
        }}>
          <Spinner size="large" text="Loading your dashboard..." />
        </div>
      ) : error ? (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb'
        }}>
          <strong>Error:</strong> {error}
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            <StatCard
              title="Total Projects"
              value={stats.totalProjects}
              color="#007bff"
              icon="📊"
            />
            <StatCard
              title="Active Projects"
              value={stats.activeProjects}
              color="#28a745"
              icon="🚀"
            />
            <StatCard
              title="Completed Projects"
              value={stats.completedProjects}
              color="#6f42c1"
              icon="✅"
            />
            <StatCard
              title="Total Investment"
              value={formatCurrency(stats.totalBudget)}
              color="#fd7e14"
              icon="💰"
            />
            {stats.avgRating && (
              <StatCard
                title="Average Rating"
                value={`${stats.avgRating}/5`}
                color="#ffc107"
                icon="⭐"
              />
            )}
          </div>

          {/* Active Projects Section */}
          {projectData.active.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ color: 'whitesmoke', marginBottom: '20px' }}>
                🚀 Active Projects ({projectData.active.length})
              </h2>
              {projectData.active.map((project, index) => (
                <ProjectCard key={project.job_id || index} project={project} type="active" />
              ))}
            </div>
          )}

          {/* Completed Projects Section */}
          {projectData.completed.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ color: 'whitesmoke', marginBottom: '20px' }}>
                ✅ Completed Projects ({projectData.completed.length})
              </h2>
              {projectData.completed.map((project, index) => (
                <ProjectCard key={project.job_id || index} project={project} type="completed" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {stats.totalProjects === 0 && (
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
              <h3 style={{ color: '#333', marginBottom: '10px' }}>No Projects Yet</h3>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                Start by creating your first project to connect with skilled professionals.
              </p>
              <button
                onClick={() => navigate('/create-job')}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Create Your First Project
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ClientDashBoardContent;