import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/AuthContext';
import './ProfessionalDashboardBody.css';
import ProfessionalNotifications from '../Notification/ProfessionalNotification';

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

// Full Page Spinner for initial loading
const FullPageSpinner = ({ text = 'Loading...' }) => {
  const fullPageStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  };

  return (
    <div style={fullPageStyles}>
      <Spinner size="large" text={text} />
    </div>
  );
};

function ProfessionalDashBoardContent() {
  const { user, isAuthenticated} = useContext(AuthContext); 
  const navigate = useNavigate();

  const [hasProfile, setHasProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectCounts, setProjectCounts] = useState({ active: 0, completed: 0 });
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState('');
  const [avgRating, setAvgRating] = useState(null);
  const [reviews, setReviews] = useState([]);

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
  if (loading) return <FullPageSpinner text="Loading your dashboard..." />;
  if (!isAuthenticated || !user) return null;

  return (
    <div className="professional-dashboard">
      <h1>Professional Dashboard</h1>
      <ProfessionalNotifications/>
      {hasProfile ? (
        <>
          <p style={{ color: 'white' }}>Welcome back to your Professional Dashboard, {user.name}!</p>
          {projectLoading ? (
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: '8px', 
              padding: '20px', 
              margin: '20px 0' 
            }}>
              <Spinner size="medium" text="Loading project data..." />
            </div>
          ) : projectError ? (
            <p className="error-message">{projectError}</p>
          ) : (
            <>
              <div className="project-counts-table">
                <h2 style={{ color: 'black' }}>Project Overview</h2>
                <table>
                  <thead>
                    <tr>
                      <th style={{ color: 'black' }}>Project Status</th>
                      <th style={{ color: 'black' }}>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Active Projects</td>
                      <td>{projectCounts.active}</td>
                    </tr>
                    <tr>
                      <td>Completed Projects</td>
                      <td>{projectCounts.completed}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="reviews-section">
                <h2>Your Reviews</h2>
                {avgRating !== null ? (
                  <p className="average-rating">
                    Average Rating: {avgRating.toFixed(1)} / 5
                    {avgRating > 0 && (
                      <span className="star-rating">
                        {[...Array(5)].map((_, index) => (
                          <span
                            key={index}
                            className={`star ${index < Math.round(avgRating) ? 'filled' : ''}`}
                          >
                            ★
                          </span>
                        ))}
                      </span>
                    )}
                  </p>
                ) : (
                  <p>No ratings yet.</p>
                )}
                {reviews.length > 0 ? (
                  <div className="reviews-list">
                    <h3>Individual Project Reviews</h3>
                    <ul>
                      {reviews.map((review) => (
                        <li key={review.job_id} className="review-item">
                          <p>
                            <strong>{review.title}</strong> (by {review.client_name}): {review.rating} / 5
                            <span className="star-rating">
                              {[...Array(5)].map((_, index) => (
                                <span
                                  key={index}
                                  className={`star ${index < review.rating ? 'filled' : ''}`}
                                >
                                  ★
                                </span>
                              ))}
                            </span>
                            <br />
                            <em>Review:</em> {review.review}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p>No individual project reviews yet.</p>
                )}
              </div>
            </>
          )}
        </>
      ) : (
        <div>
          <p style={{ color: 'white' }}>Welcome to the Professional Dashboard, {user.name}! You don't have a profile yet.</p>
          <button onClick={() => navigate('/create-professional-profile')} className="create-profile-btn">
            Create Professional Profile
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfessionalDashBoardContent;