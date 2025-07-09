import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/AuthContext';
import './ClientProfile.css';

const baseUrl = import.meta.env.VITE_API_URL;

const Spinner = ({ size = 'medium', text = 'Loading...' }) => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <span className="spinner-text">{text}</span>
    </div>
  );
};

const ClientProfile = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    phone_number: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState({}); // State for form errors

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'client') {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/client/profile/`, {
          withCredentials: true,
        });
        setProfile(response.data);
        setFormData({
          company_name: response.data.company_name || '',
          phone_number: response.data.phone_number || '',
          address: response.data.address || ''
        });
        setLoading(false);
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'Failed to fetch profile';
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

    fetchProfile();
  }, [isAuthenticated, user, navigate]);

  const validatePhoneNumber = (phone) => {
    if (!phone) return ''; // Allow empty input (optional)
    
    // Regex: Starts with + followed by 1-3 digits, then 10 digits
    const phoneRegex = /^\+\d{1,3}(\d{10})$/;
    const match = phone.match(phoneRegex);

    if (!match) {
      return 'Phone number must include country code (e.g., +91) followed by exactly 10 digits';
    }

    const digits = match[1]; // The 10-digit number
    if (digits === '0000000000') {
      return 'Phone number cannot be all zeros';
    }

    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate phone number
    if (name === 'phone_number') {
      const error = validatePhoneNumber(value);
      setFormErrors(prev => ({ ...prev, phone_number: error }));
    }
  };

  const handleSave = async () => {
    // Validate before saving
    const phoneError = validatePhoneNumber(formData.phone_number);
    if (phoneError) {
      setFormErrors({ phone_number: phoneError });
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: phoneError,
        confirmButtonColor: '#dc3545',
      });
      return;
    }

    try {
      const method = profile.company_name || profile.phone_number || profile.address ? 'patch' : 'post';
      const response = await axios[method](`${baseUrl}/api/client/profile/`, formData, {
        withCredentials: true,
      });
      setProfile(response.data.profile);
      setIsEditing(false);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: response.data.message,
        confirmButtonColor: '#28a745',
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.phone_number?.[0] || 'Failed to save profile';
      setError(errorMessage);
      setFormErrors({ phone_number: err.response?.data?.phone_number?.[0] || '' });
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

  if (loading) {
    return <Spinner size="large" text="Loading profile..." />;
  }

  if (error) {
    return (
      <div className="error-message">
        <span>⚠️</span>
        <div>
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="client-profile">
      <div className="header">
        <h1>Your Profile</h1>
        <p>Manage your personal and company information</p>
      </div>

      <div className="profile-container">
        <h2>Personal Information</h2>
        <div className="profile-field">
          <label>Username</label>
          <p>{profile.username}</p>
        </div>
        <div className="profile-field">
          <label>Email</label>
          <p>{profile.email}</p>
        </div>

        <h2>Company Information</h2>
        {isEditing ? (
          <div>
            <div className="profile-field">
              <label>Company Name</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                placeholder="Enter company name"
              />
            </div>
            <div className="profile-field">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="+91XXXXXXXXXX"
                className={formErrors.phone_number ? 'input-error' : ''}
              />
              {formErrors.phone_number && (
                <p className="error-text">{formErrors.phone_number}</p>
              )}
            </div>
            <div className="profile-field">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your address"
                rows="4"
              />
            </div>
            <div className="button-group">
              <button className="save-btn" onClick={handleSave}>
                Save
              </button>
              <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="profile-field">
              <label>Company Name</label>
              <p>{profile.company_name || 'Not set'}</p>
            </div>
            <div className="profile-field">
              <label>Phone Number</label>
              <p>{profile.phone_number || 'Not set'}</p>
            </div>
            <div className="profile-field">
              <label>Address</label>
              <p>{profile.address || 'Not set'}</p>
            </div>
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProfile;