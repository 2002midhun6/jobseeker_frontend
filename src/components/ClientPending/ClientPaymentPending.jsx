import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './ClientPaymentPending.css';

// Spinner Component
const Spinner = ({ size = 'medium', text = 'Loading...' }) => {
  const spinnerStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    },
    spinner: {
      width: size === 'small' ? '20px' : size === 'large' ? '60px' : '40px',
      height: size === 'small' ? '20px' : size === 'large' ? '60px' : '40px',
      border: `${size === 'small' ? '2px' : '3px'} solid #f3f3f3`,
      borderTop: `${size === 'small' ? '2px' : '3px'} solid #007bff`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '15px',
    },
    text: {
      color: '#666',
      fontSize: size === 'small' ? '12px' : size === 'large' ? '18px' : '16px',
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

// Payment Card Component
const PaymentCard = ({ payment, onPayment, user }) => {
  const [processing, setProcessing] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount / 100);
  };

  const getPaymentTypeInfo = (type) => {
    switch (type?.toLowerCase()) {
      case 'initial':
        return { label: 'Initial Payment', color: '#28a745', icon: '🟢' };
      case 'remaining':
        return { label: 'Final Payment', color: '#dc3545', icon: '🔴' };
      default:
        return { label: 'Payment', color: '#6c757d', icon: '💰' };
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      await onPayment(payment);
    } finally {
      setProcessing(false);
    }
  };

  const paymentTypeInfo = getPaymentTypeInfo(payment.payment_type);

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e8ecf0',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
      }}
    >
      {/* Payment Type Badge */}
      <div style={{
        position: 'absolute',
        top: '0',
        right: '0',
        backgroundColor: paymentTypeInfo.color,
        color: 'white',
        padding: '8px 16px',
        borderBottomLeftRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {paymentTypeInfo.label}
      </div>

      {/* Main Content */}
      <div style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '24px', marginRight: '12px' }}>💼</span>
          <h3 style={{ 
            color: '#2d3748', 
            margin: '0', 
            fontSize: '20px', 
            fontWeight: '700',
            lineHeight: '1.2'
          }}>
            {payment.job_application?.job_title || 'Unknown Job'}
          </h3>
        </div>

        {/* Payment Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '18px', marginRight: '8px' }}>💰</span>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Amount</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>
              {formatCurrency(payment.amount)}
            </div>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '18px', marginRight: '8px' }}>{paymentTypeInfo.icon}</span>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Type</span>
            </div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: paymentTypeInfo.color,
              textTransform: 'capitalize'
            }}>
              {payment.payment_type}
            </div>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '18px', marginRight: '8px' }}>🆔</span>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Order ID</span>
            </div>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: '500', 
              color: '#4a5568',
              fontFamily: 'monospace',
              backgroundColor: '#edf2f7',
              padding: '4px 8px',
              borderRadius: '6px'
            }}>
              {payment.order_id}
            </div>
          </div>
        </div>

        {/* Professional Details */}
        {payment.job_application && (
          <div style={{
            padding: '16px',
            backgroundColor: '#f7fafc',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '1px solid #bee3f8'
          }}>
            <h4 style={{ 
              color: '#2b6cb0', 
              margin: '0 0 12px 0', 
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '8px' }}>👤</span>
              Project Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              {payment.job_application.professional_name && (
                <div>
                  <span style={{ fontSize: '12px', color: '#4a5568', fontWeight: '500' }}>Professional:</span>
                  <p style={{ margin: '4px 0 0 0', color: '#2d3748', fontWeight: '600' }}>
                    {payment.job_application.professional_name}
                  </p>
                </div>
              )}
              {payment.job_application.client_name && (
                <div>
                  <span style={{ fontSize: '12px', color: '#4a5568', fontWeight: '500' }}>Client:</span>
                  <p style={{ margin: '4px 0 0 0', color: '#2d3748', fontWeight: '600' }}>
                    {payment.job_application.client_name}
                  </p>
                </div>
              )}
              {payment.job_application.status && (
                <div>
                  <span style={{ fontSize: '12px', color: '#4a5568', fontWeight: '500' }}>Status:</span>
                  <p style={{ 
                    margin: '4px 0 0 0', 
                    color: '#2d3748', 
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {payment.job_application.status}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={processing}
          style={{
            width: '100%',
            padding: '16px 24px',
            backgroundColor: processing ? '#94a3b8' : '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: processing ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: processing ? 'none' : '0 4px 12px rgba(5, 150, 105, 0.3)',
          }}
          onMouseEnter={(e) => {
            if (!processing) {
              e.target.style.backgroundColor = '#047857';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(5, 150, 105, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!processing) {
              e.target.style.backgroundColor = '#059669';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)';
            }
          }}
        >
          {processing ? (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #ffffff40',
                borderTop: '2px solid #ffffff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Processing...
            </>
          ) : (
            <>
              <span>💳</span>
              Pay {formatCurrency(payment.amount)}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Enhanced Search Bar Component
const SearchBar = ({ searchQuery, onSearchChange, totalPayments, filteredCount }) => (
  <div style={{
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e8ecf0'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
      <div style={{ flex: '1', minWidth: '300px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '18px',
            color: '#64748b'
          }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by job title..."
            value={searchQuery}
            onChange={onSearchChange}
            style={{
              width: '100%',
              padding: '14px 16px 14px 48px',
              border: '2px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.3s ease',
              backgroundColor: '#f8fafc'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        fontSize: '14px',
        color: '#64748b',
        fontWeight: '500'
      }}>
        <div style={{
          backgroundColor: '#eff6ff',
          color: '#1d4ed8',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid #dbeafe'
        }}>
          📊 Total: {totalPayments}
        </div>
        {searchQuery && (
          <div style={{
            backgroundColor: '#f0fdf4',
            color: '#15803d',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #dcfce7'
          }}>
            🎯 Found: {filteredCount}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Enhanced Pagination Component
const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const paginationStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    padding: '24px 0',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    margin: '24px 0'
  };

  const buttonStyle = {
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#fff',
    color: '#4a5568',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    minWidth: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6'
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    opacity: 0.5,
    cursor: 'not-allowed'
  };

  return (
    <div style={paginationStyle}>
      <button
        style={currentPage === 1 ? disabledButtonStyle : buttonStyle}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ← Previous
      </button>

      {getVisiblePages().map(page => (
        <button
          key={page}
          style={page === currentPage ? activeButtonStyle : buttonStyle}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        style={currentPage === totalPages ? disabledButtonStyle : buttonStyle}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next →
      </button>
    </div>
  );
};

function ClientPendingPayments() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get('https://api.midhung.in/api/client-pending-payments/', {
          withCredentials: true,
        });
        console.log('Fetch Pending Payments Response:', response.data);
        const paymentsData = response.data.payments || [];
        setPayments(paymentsData);
        setFilteredPayments(paymentsData);
        setLoading(false);
      } catch (err) {
        console.error('Fetch Error:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        const errorMessage = err.response?.data?.error || 'Failed to fetch pending payments';
        setError(errorMessage);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: '#dc3545',
        });
        setLoading(false);
      }
    };

    if (!isAuthenticated || !user || user.role !== 'client') {
      navigate('/login');
    } else {
      fetchPayments();
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPayments(payments);
      setCurrentPage(1);
      return;
    }

    const filtered = payments.filter((payment) =>
      payment.job_application?.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPayments(filtered);
    setCurrentPage(1);
  }, [searchQuery, payments]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handlePayment = async (payment) => {
    if (!window.Razorpay) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Payment gateway not loaded. Please refresh the page.',
        confirmButtonColor: '#dc3545',
      });
      return;
    }

    const options = {
      key: payment.key,
      amount: payment.amount,
      currency: payment.currency,
      name: payment.name,
      description: payment.description,
      order_id: payment.order_id,
      handler: async function (response) {
        console.log('Razorpay Payment Response:', response);
        try {
          const payload = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            application_id: payment.job_application?.id || 'unknown',
            payment_type: payment.payment_type,
          };
          console.log('Verification Payload:', payload);

          const verifyResponse = await axios.post(
            'https://api.midhung.in/api/verify-payment/',
            payload,
            { withCredentials: true }
          );
          console.log('Verification Response:', verifyResponse.data);

          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: verifyResponse.data.message,
            confirmButtonColor: '#28a745',
            timer: 3000,
          });

          setPayments((prev) => prev.filter((p) => p.order_id !== payment.order_id));
          setFilteredPayments((prev) => prev.filter((p) => p.order_id !== payment.order_id));
        } catch (error) {
          console.error('Payment Verification Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          });
          Swal.fire({
            icon: 'error',
            title: 'Verification Error',
            text: error.response?.data?.error || 'Payment verification failed. Please contact support.',
            confirmButtonColor: '#dc3545',
            timer: 5000,
          });
        }
      },
      prefill: {
        email: user?.email || 'client@example.com',
        contact: user?.phone || '9999999999',
      },
      theme: {
        color: '#28a745',
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', function (response) {
      console.error('Razorpay Payment Failed:', response.error);
      Swal.fire({
        icon: 'error',
        title: 'Payment Failed',
        text: response.error.description || 'Payment could not be processed. Please try again.',
        confirmButtonColor: '#dc3545',
        timer: 5000,
      });
    });
    razorpay.open();
  };

  const paginate = (items, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const currentPayments = paginate(filteredPayments, currentPage);

  if (!isAuthenticated || !user) return null;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '32px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            💳 Pending Payments
          </h1>
          <p style={{
            margin: '0',
            fontSize: '18px',
            opacity: 0.9
          }}>
            Complete your payments to keep your projects moving forward
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          totalPayments={payments.length}
          filteredCount={filteredPayments.length}
        />

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #fecaca',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}>
            <Spinner size="large" text="Loading your pending payments..." />
          </div>
        ) : filteredPayments.length === 0 ? (
          /* Empty State */
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
            <h3 style={{ color: '#1f2937', marginBottom: '12px', fontSize: '24px' }}>
              {searchQuery ? 'No payments found' : 'All caught up!'}
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '16px' }}>
              {searchQuery 
                ? `No pending payments match "${searchQuery}"`
                : 'You have no pending payments at the moment.'
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginRight: '12px'
                }}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          /* Payment Cards */
          <>
            <div>
              {currentPayments.map((payment) => (
                <PaymentCard
                  key={payment.order_id}
                  payment={payment}
                  onPayment={handlePayment}
                  user={user}
                />
              ))}
            </div>

            {/* Pagination */}
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        {/* Back Button */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button
            onClick={() => navigate('/client-project')}
            style={{
              backgroundColor: '#fff',
              color: '#374151',
              border: '2px solid #d1d5db',
              padding: '14px 28px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f9fafb';
              e.target.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#fff';
              e.target.style.borderColor = '#d1d5db';
            }}
          >
            ← Back to Projects
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientPendingPayments;