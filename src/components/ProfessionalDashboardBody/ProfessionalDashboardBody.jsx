
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/AuthContext';
import './ProfessionalDashboardBody.css';
import ProfessionalNotifications from '../Notification/ProfessionalNotification';
import EnhancedComplaintManagement from './EnhancedComplaintManagement'; // Import complaints

// Enhanced Spinner Component
const Spinner = ({ size = 'medium', text = 'Loading...', fullPage = false }) => {
  const spinnerStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: fullPage ? '60px 20px' : '20px',
      backgroundColor: fullPage ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
      borderRadius: fullPage ? '20px' : '0',
      ...(fullPage && {
        minHeight: '300px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
      })
    },
    spinner: {
      width: size === 'small' ? '24px' : size === 'large' ? '56px' : '40px',
      height: size === 'small' ? '24px' : size === 'large' ? '56px' : '40px',
      border: `${size === 'small' ? '3px' : '4px'} solid transparent`,
      borderTop: `${size === 'small' ? '3px' : '4px'} solid #3b82f6`,
      borderRight: `${size === 'small' ? '3px' : '4px'} solid #10b981`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '16px',
    },
    text: {
      color: '#6b7280',
      fontSize: size === 'small' ? '14px' : size === 'large' ? '18px' : '16px',
      fontWeight: '600',
      textAlign: 'center',
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

// Enhanced Statistics Card Component
const StatCard = ({ title, value, subValue, color, icon, trend }) => (
  <div style={{
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e8ecf0',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-8px)';
    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
  }}
  >
    {/* Top gradient line */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: `linear-gradient(90deg, ${color}, ${color}99)`,
    }}></div>

    <div style={{ 
      fontSize: '32px', 
      marginBottom: '12px',
      padding: '16px',
      background: `${color}15`,
      borderRadius: '16px',
      display: 'inline-block',
    }}>
      {icon}
    </div>
    
    <h3 style={{ 
      color: color, 
      fontSize: '32px', 
      margin: '0 0 8px 0', 
      fontWeight: '800',
      background: `linear-gradient(135deg, ${color}, ${color}cc)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}>
      {value}
    </h3>
    
    <p style={{ color: '#6b7280', margin: '0', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {title}
    </p>
    
    {subValue && (
      <p style={{ color: '#9ca3af', margin: '8px 0 0 0', fontSize: '12px' }}>
        {subValue}
      </p>
    )}
    
    {trend && (
      <div style={{ 
        marginTop: '8px',
        fontSize: '12px',
        color: trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : '#6b7280',
        fontWeight: '600',
      }}>
        {trend > 0 ? '↗️' : trend < 0 ? '↘️' : '➡️'} {Math.abs(trend)}%
      </div>
    )}
  </div>
);

// Enhanced Review Card Component
const ReviewCard = ({ review }) => {
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        style={{
          color: index < rating ? '#fbbf24' : '#e5e7eb',
          fontSize: '20px',
          marginRight: '2px',
        }}
      >
        ★
      </span>
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e8ecf0',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
    }}
    >
      {/* Top gradient line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
      }}></div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h4 style={{ color: '#1f2937', margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>
            {review.title}
          </h4>
          <p style={{ color: '#6b7280', margin: '0', fontSize: '14px', fontWeight: '500' }}>
            by {review.client_name}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ marginBottom: '4px' }}>
            {renderStars(review.rating)}
          </div>
          <span style={{ 
            color: '#f59e0b', 
            fontWeight: '700',
            fontSize: '16px',
          }}>
            {review.rating}/5
          </span>
        </div>
      </div>

      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #e8ecf0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span style={{ fontSize: '16px' }}>💬</span>
          <strong style={{ color: '#374151', fontSize: '14px' }}>Client Feedback</strong>
        </div>
        <p style={{ 
          margin: '0', 
          color: '#374151', 
          fontStyle: 'italic', 
          lineHeight: '1.6',
          fontSize: '14px',
        }}>
          "{review.review}"
        </p>
      </div>
    </div>
  );
};

// Enhanced Projects Overview Component
const ProjectsOverview = ({ projectCounts, loading, error }) => {
  if (loading) {
    return (
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '20px', 
        margin: '20px 0',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      }}>
        <Spinner size="medium" text="Loading project data..." fullPage={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: '#fef2f2',
        color: '#dc2626',
        padding: '20px',
        borderRadius: '16px',
        border: '1px solid #fecaca',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <span style={{ fontSize: '20px' }}>⚠️</span>
        <div>
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '24px',
      marginBottom: '40px'
    }}>
      <StatCard
        title="Active Projects"
        value={projectCounts.active}
        color="#10b981"
        icon="🚀"
      />
      <StatCard
        title="Completed Projects"
        value={projectCounts.completed}
        color="#8b5cf6"
        icon="✅"
      />
      <StatCard
        title="Total Projects"
        value={projectCounts.active + projectCounts.completed}
        color="#3b82f6"
        icon="📊"
      />
    </div>
  );
};

// Create Profile Card Component
const CreateProfileCard = () => {
  const navigate = useNavigate();
  
  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '24px',
      padding: '64px 32px',
      textAlign: 'center',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e8ecf0',
      margin: '32px 0',
    }}>
      <div style={{ fontSize: '80px', marginBottom: '24px' }}>👤</div>
      <h3 style={{ color: '#1f2937', marginBottom: '12px', fontSize: '28px', fontWeight: '700' }}>
        Complete Your Professional Profile
      </h3>
      <p style={{ color: '#6b7280', marginBottom: '32px', fontSize: '16px', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto 32px' }}>
        Create your professional profile to start receiving project opportunities and showcase your skills to potential clients.
      </p>
      <button
        onClick={() => navigate('/create-professional-profile')}
        style={{
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          color: 'white',
          border: 'none',
          padding: '16px 32px',
          borderRadius: '16px',
          fontSize: '16px',
          cursor: 'pointer',
          fontWeight: '600',
          transition: 'all 0.3s ease',
          boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 12px 35px rgba(59, 130, 246, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
        }}
      >
        <span style={{ fontSize: '18px' }}>⚡</span>
        Create Professional Profile
      </button>
    </div>
  );
};

function ProfessionalDashBoardContent() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [hasProfile, setHasProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectCounts, setProjectCounts] = useState({ active: 0, completed: 0 });
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState('');
  const [avgRating, setAvgRating] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showComplaints, setShowComplaints] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const response = await axios.get('https://api.midhung.in/api/profile/', {
          withCredentials: true,
        });
        setHasProfile(true);
        setAvgRating(response.data.avg_rating || 0);
      } catch (err) {
        if (err.response?.status === 404) {
          setHasProfile(false);
        } else {
          console.error('Error checking profile:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to check profile status',
            confirmButtonColor: '#dc3545',
            timer: 3000,
            timerProgressBar: true,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user && user.role === 'professional') {
      checkProfile();
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchProjectCountsAndReviews = async () => {
      try {
        const response = await axios.get('https://api.midhung.in/api/professional-job-applications/', {
          withCredentials: true,
        });
        const applications = Array.isArray(response.data.applications) ? response.data.applications : [];
        const activeCount = applications.filter(
          (app) => app.status === 'Accepted' && app.job_details?.status === 'Assigned'
        ).length;
        const completedCount = applications.filter(
          (app) => app.status === 'Completed' && app.job_details?.status === 'Completed'
        ).length;
        const completedReviews = applications
          .filter(
            (app) => app.status === 'Completed' && app.job_details?.status === 'Completed' && app.job_details?.rating
          )
          .map((app) => ({
            job_id: app.job_details.job_id,
            title: app.job_details.title,
            rating: app.job_details.rating,
            review: app.job_details.review || 'No review provided',
            client_name: app.job_details.client_name || 'Unknown Client',
          }));
        setProjectCounts({ active: activeCount, completed: completedCount });
        setReviews(completedReviews);
        setProjectLoading(false);
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'Failed to fetch project data';
        setProjectError(errorMessage);
        setProjectLoading(false);
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

    if (hasProfile) {
      fetchProjectCountsAndReviews();
    } else {
      setProjectLoading(false);
    }
  }, [hasProfile, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'professional') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  // Show full page spinner during initial loading
  if (loading) {
    return (
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '20px', 
        margin: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      }}>
        <Spinner size="large" text="Loading your dashboard..." fullPage={true} />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className="enhanced-professional-dashboard">
      {/* Enhanced Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '32px',
        boxShadow: '0 20px 60px rgba(102, 126, 234, 0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>')`,
          pointerEvents: 'none',
        }}></div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h1 style={{ 
                color: 'white', 
                marginBottom: '8px', 
                fontSize: '36px', 
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <span style={{ fontSize: '40px', filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))' }}>💼</span>
                Welcome back, {user.name}!
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '18px', margin: '0', fontWeight: '400' }}>
                {hasProfile ? 'Manage your projects and track your professional growth' : 'Complete your profile to start your professional journey'}
              </p>
            </div>

            {/* Enhanced Notifications and Actions */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
            }}>
              <ProfessionalNotifications />
              
              {/* Complaints Button */}
              <button
                onClick={() => setShowComplaints(!showComplaints)}
                style={{
                  background: showComplaints ? '#dc3545' : 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  if (!showComplaints) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showComplaints) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
              >
                <span style={{ fontSize: '16px' }}>📝</span>
                {showComplaints ? 'Hide Complaints' : 'Complaints'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Complaints Section - Toggle */}
      {showComplaints && (
        <div style={{ marginBottom: '32px' }}>
          <EnhancedComplaintManagement />
        </div>
      )}

      {hasProfile ? (
        <>
          {/* Projects Overview */}
          <ProjectsOverview 
            projectCounts={projectCounts}
            loading={projectLoading}
            error={projectError}
          />

          {/* Reviews and Rating Section */}
          {!projectLoading && !projectError && (
            <div style={{ marginBottom: '40px' }}>
              {/* Average Rating Card */}
              {avgRating !== null && avgRating > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '24px'
                  }}>
                    <StatCard
                      title="Average Rating"
                      value={`${avgRating.toFixed(1)}/5`}
                      color="#f59e0b"
                      icon="⭐"
                    />
                    <StatCard
                      title="Total Reviews"
                      value={reviews.length}
                      color="#8b5cf6"
                      icon="💬"
                    />
                  </div>
                </div>
              )}

              {/* Individual Reviews */}
              {reviews.length > 0 && (
                <div>
                  <h2 style={{ 
                    color: '#1f2937', 
                    marginBottom: '24px',
                    fontSize: '28px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    <span style={{ fontSize: '32px' }}>⭐</span>
                    Client Reviews ({reviews.length})
                  </h2>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '20px'
                  }}>
                    {reviews.map((review) => (
                      <ReviewCard key={review.job_id} review={review} />
                    ))}
                  </div>
                </div>
              )}

              {/* No Reviews State */}
              {avgRating === 0 || avgRating === null ? (
                <div style={{
                  backgroundColor: '#fff',
                  borderRadius: '24px',
                  padding: '48px 32px',
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #e8ecf0',
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '20px' }}>⭐</div>
                  <h3 style={{ color: '#1f2937', marginBottom: '12px', fontSize: '24px', fontWeight: '700' }}>
                    No Reviews Yet
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '16px', lineHeight: '1.6' }}>
                    Complete projects to start receiving reviews from clients and build your professional reputation.
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </>
      ) : (
        <CreateProfileCard />
      )}
    </div>
  );
}

export default  ProfessionalDashBoardContent;