import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

function AdminPanel() {
    const [pendingBookings, setPendingBookings] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [view, setView] = useState('pending');
    const navigate = useNavigate();

    const getAuthHeaders = () => {
        const token = localStorage.getItem('adminToken');
        return {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
    };

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }

        if (view === 'pending') {
            fetchPendingBookings();
        } else {
            fetchAllBookings();
        }
    }, [view]);

    const fetchPendingBookings = async () => {
        setLoading(true);
        setMessage('');
        try {
            const response = await axios.get(
                `${API_URL}/bookings/pending`,
                getAuthHeaders()
            );
            setPendingBookings(response.data.bookings);
        } catch (error) {
            console.error('Error fetching pending bookings:', error);
            const errorMsg = error.response?.data?.error || 'Failed to fetch bookings';
            setMessage(`❌ Error: ${errorMsg}`);

            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAllBookings = async () => {
        setLoading(true);
        setMessage('');
        try {
            const response = await axios.get(
                `${API_URL}/bookings`,
                getAuthHeaders()
            );
            setAllBookings(response.data.bookings);
        } catch (error) {
            console.error('Error fetching all bookings:', error);
            const errorMsg = error.response?.data?.error || 'Failed to fetch bookings';
            setMessage(`❌ Error: ${errorMsg}`);

            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (bookingId) => {
        if (!window.confirm('Are you sure you want to approve this booking?')) return;

        setLoading(true);
        setMessage('');
        try {
            const response = await axios.post(
                `${API_URL}/bookings/approve/${bookingId}`,
                {},
                getAuthHeaders()
            );
            setMessage(`✅ ${response.data.message}`);
            fetchPendingBookings();
        } catch (error) {
            console.error('Error approving booking:', error);
            setMessage(`❌ Error: ${error.response?.data?.error || 'Failed to approve booking'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (bookingId) => {
        if (!window.confirm('Are you sure you want to reject this booking?')) return;

        setLoading(true);
        setMessage('');
        try {
            const response = await axios.post(
                `${API_URL}/bookings/reject/${bookingId}`,
                {},
                getAuthHeaders()
            );
            setMessage(`✅ ${response.data.message}`);
            fetchPendingBookings();
        } catch (error) {
            console.error('Error rejecting booking:', error);
            setMessage(`❌ Error: ${error.response?.data?.error || 'Failed to reject booking'}`);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return '#28a745';
            case 'pending_payment': return '#ffc107';
            case 'rejected': return '#dc3545';
            case 'cancelled': return '#6c757d';
            default: return '#6c757d';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'confirmed': return '✅ CONFIRMED';
            case 'pending_payment': return '⏳ PENDING';
            case 'rejected': return '❌ REJECTED';
            case 'cancelled': return '🚫 CANCELLED';
            default: return status.toUpperCase();
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.title}>🎭 Admin Dashboard</h1>
                    <p style={styles.subtitle}>Yakshagana Ticket Management</p>
                </div>

                <div style={styles.nav}>
                    <button
                        style={{ ...styles.navButton, ...(view === 'pending' ? styles.navButtonActive : {}) }}
                        onClick={() => setView('pending')}
                    >
                        <span style={styles.navButtonText}>⏳ Pending</span>
                        <span style={styles.navButtonBadge}>({pendingBookings.length})</span>
                    </button>
                    <button
                        style={{ ...styles.navButton, ...(view === 'all' ? styles.navButtonActive : {}) }}
                        onClick={() => setView('all')}
                    >
                        <span style={styles.navButtonText}>📋 All</span>
                        <span style={styles.navButtonBadge}>({allBookings.length})</span>
                    </button>
                    <button
                        style={{
                            ...styles.navButton,
                            background: '#ff4757',
                            border: '2px solid rgba(255,255,255,0.5)',
                        }}
                        onClick={() => {
                            localStorage.removeItem("adminToken");
                            navigate("/");
                        }}
                    >
                        🔙 Logout
                    </button>
                </div>
            </header>

            <main style={styles.main}>
                {message && (
                    <div style={{
                        ...styles.message,
                        ...(message.includes('❌') ? styles.messageError : styles.messageSuccess)
                    }}>
                        {message}
                    </div>
                )}

                {loading && view === 'pending' && pendingBookings.length === 0 ? (
                    <div style={styles.loadingContainer}>
                        <div style={styles.loadingSpinner}>⏳</div>
                        <p style={styles.loadingText}>Loading bookings...</p>
                    </div>
                ) : (
                    <>
                        {view === 'pending' ? (
                            pendingBookings.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <div style={styles.emptyIcon}>✅</div>
                                    <h3 style={styles.emptyTitle}>No Pending Bookings</h3>
                                    <p style={styles.emptyText}>All bookings have been processed!</p>
                                </div>
                            ) : (
                                <div style={styles.bookingsGrid}>
                                    {pendingBookings.map((booking) => (
                                        <div key={booking._id} style={styles.bookingCard}>
                                            <div style={styles.cardHeader}>
                                                <div style={styles.cardHeaderInfo}>
                                                    <h3 style={styles.cardTitle}>{booking.customerName}</h3>
                                                    <p style={styles.bookingId}>ID: {booking.bookingId}</p>
                                                </div>
                                                <div style={{
                                                    ...styles.statusBadge,
                                                    background: getStatusColor(booking.status)
                                                }}>
                                                    ⏳ PENDING
                                                </div>
                                            </div>

                                            <div style={styles.cardBody}>
                                                <div style={styles.infoRow}>
                                                    <span style={styles.infoLabel}>📧 Email:</span>
                                                    <span style={styles.infoValue}>{booking.email}</span>
                                                </div>
                                                <div style={styles.infoRow}>
                                                    <span style={styles.infoLabel}>📱 Phone:</span>
                                                    <span style={styles.infoValue}>{booking.phone}</span>
                                                </div>
                                                <div style={styles.infoRow}>
                                                    <span style={styles.infoLabel}>🎭 Event:</span>
                                                    <span style={styles.infoValue}>{booking.eventName}</span>
                                                </div>
                                                <div style={styles.infoRow}>
                                                    <span style={styles.infoLabel}>📅 Date:</span>
                                                    <span style={styles.infoValue}>
                                                        {new Date(booking.eventDate).toLocaleDateString('en-IN', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                <div style={styles.infoRow}>
                                                    <span style={styles.infoLabel}>🎫 Type:</span>
                                                    <span style={styles.infoValue}>{booking.ticketType}</span>
                                                </div>
                                                <div style={styles.infoRow}>
                                                    <span style={styles.infoLabel}>🎟️ Tickets:</span>
                                                    <span style={styles.infoValue}>{booking.numberOfTickets}</span>
                                                </div>
                                                <div style={{ ...styles.infoRow, ...styles.totalRow }}>
                                                    <span style={styles.infoLabel}>💰 Total:</span>
                                                    <span style={styles.infoValue}>₹{booking.totalPrice}</span>
                                                </div>
                                                <div style={styles.infoRow}>
                                                    <span style={styles.infoLabel}>📆 Requested:</span>
                                                    <span style={styles.infoValue}>
                                                        {new Date(booking.createdAt).toLocaleString('en-IN', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={styles.cardActions}>
                                                <button
                                                    onClick={() => handleApprove(booking.bookingId)}
                                                    disabled={loading}
                                                    style={styles.approveBtn}
                                                >
                                                    ✓ Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(booking.bookingId)}
                                                    disabled={loading}
                                                    style={styles.rejectBtn}
                                                >
                                                    ✗ Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            allBookings.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <div style={styles.emptyIcon}>📋</div>
                                    <h3 style={styles.emptyTitle}>No Bookings Yet</h3>
                                    <p style={styles.emptyText}>Bookings will appear here once customers start booking.</p>
                                </div>
                            ) : (
                                <div style={styles.mobileCardContainer}>
                                    {allBookings.map((booking) => (
                                        <div key={booking._id} style={styles.mobileCard}>
                                            <div style={styles.mobileCardHeader}>
                                                <div>
                                                    <div style={styles.mobileCardTitle}>{booking.customerName}</div>
                                                    <div style={styles.mobileCardSubtitle}>{booking.bookingId}</div>
                                                </div>
                                                <span style={{
                                                    ...styles.mobileStatusBadge,
                                                    background: getStatusColor(booking.status),
                                                }}>
                                                    {getStatusText(booking.status)}
                                                </span>
                                            </div>
                                            <div style={styles.mobileCardBody}>
                                                <div style={styles.mobileInfoGrid}>
                                                    <div style={styles.mobileInfoItem}>
                                                        <div style={styles.mobileInfoLabel}>Ticket Type</div>
                                                        <div style={styles.mobileInfoValue}>{booking.ticketType}</div>
                                                    </div>
                                                    <div style={styles.mobileInfoItem}>
                                                        <div style={styles.mobileInfoLabel}>Price/Ticket</div>
                                                        <div style={styles.mobileInfoValue}>₹{booking.pricePerTicket}</div>
                                                    </div>
                                                    <div style={styles.mobileInfoItem}>
                                                        <div style={styles.mobileInfoLabel}>Email</div>
                                                        <div style={styles.mobileInfoValue}>{booking.email}</div>
                                                    </div>
                                                    <div style={styles.mobileInfoItem}>
                                                        <div style={styles.mobileInfoLabel}>Phone</div>
                                                        <div style={styles.mobileInfoValue}>{booking.phone}</div>
                                                    </div>
                                                    <div style={styles.mobileInfoItem}>
                                                        <div style={styles.mobileInfoLabel}>Tickets</div>
                                                        <div style={styles.mobileInfoValue}>{booking.numberOfTickets}</div>
                                                    </div>
                                                    <div style={styles.mobileInfoItem}>
                                                        <div style={styles.mobileInfoLabel}>Total</div>
                                                        <div style={styles.mobilePriceValue}>₹{booking.totalPrice}</div>
                                                    </div>
                                                    {booking.ticketId && (
                                                        <div style={{ ...styles.mobileInfoItem, gridColumn: '1 / -1' }}>
                                                            <div style={styles.mobileInfoLabel}>Ticket ID</div>
                                                            <div style={styles.mobileTicketId}>{booking.ticketId}</div>
                                                        </div>
                                                    )}
                                                    <div style={{ ...styles.mobileInfoItem, gridColumn: '1 / -1' }}>
                                                        <div style={styles.mobileInfoLabel}>Date</div>
                                                        <div style={styles.mobileInfoValue}>
                                                            {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    },
    header: {
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(10px)',
        padding: '20px 15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    },
    headerContent: {
        maxWidth: '1400px',
        margin: '0 auto 20px',
        textAlign: 'center',
    },
    title: {
        margin: 0,
        fontSize: 'clamp(24px, 5vw, 36px)',
        color: 'white',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        fontWeight: '700',
    },
    subtitle: {
        margin: '8px 0 0 0',
        color: 'rgba(255,255,255,0.95)',
        fontSize: 'clamp(14px, 3vw, 18px)',
        textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
    },
    nav: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        maxWidth: '1400px',
        margin: '0 auto',
        flexWrap: 'wrap',
    },
    navButton: {
        padding: 'clamp(10px, 2vw, 14px) clamp(16px, 4vw, 32px)',
        border: '2px solid rgba(255,255,255,0.5)',
        background: 'rgba(255,255,255,0.2)',
        color: 'white',
        borderRadius: '50px',
        cursor: 'pointer',
        fontSize: 'clamp(13px, 2.5vw, 16px)',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
    },
    navButtonText: {
        display: 'inline',
    },
    navButtonBadge: {
        display: 'inline',
    },
    navButtonActive: {
        background: 'white',
        color: '#667eea',
        transform: 'scale(1.05)',
        boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
    },
    main: {
        maxWidth: '1400px',
        margin: '20px auto',
        padding: '0 15px 40px',
    },
    message: {
        padding: '15px',
        borderRadius: '12px',
        marginBottom: '20px',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 'clamp(13px, 2.5vw, 16px)',
    },
    messageSuccess: {
        background: '#d4edda',
        color: '#155724',
        border: '2px solid #c3e6cb',
    },
    messageError: {
        background: '#f8d7da',
        color: '#721c24',
        border: '2px solid #f5c6cb',
    },
    loadingContainer: {
        textAlign: 'center',
        padding: '60px 20px',
        background: 'white',
        borderRadius: '20px',
    },
    loadingSpinner: {
        fontSize: '48px',
        marginBottom: '20px',
    },
    loadingText: {
        color: '#666',
        fontSize: '16px',
        margin: 0,
    },
    emptyState: {
        textAlign: 'center',
        padding: 'clamp(40px, 10vw, 80px) 20px',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    },
    emptyIcon: {
        fontSize: 'clamp(50px, 12vw, 80px)',
        marginBottom: '20px',
    },
    emptyTitle: {
        margin: '0 0 10px 0',
        color: '#333',
        fontSize: 'clamp(20px, 5vw, 28px)',
    },
    emptyText: {
        margin: 0,
        color: '#666',
        fontSize: 'clamp(14px, 3vw, 16px)',
    },
    bookingsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 350px), 1fr))',
        gap: '20px',
    },
    bookingCard: {
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    cardHeader: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '18px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '10px',
    },
    cardHeaderInfo: {
        flex: 1,
        minWidth: 0,
    },
    cardTitle: {
        margin: '0 0 5px 0',
        fontSize: 'clamp(18px, 4vw, 22px)',
        fontWeight: '700',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    bookingId: {
        margin: 0,
        fontSize: 'clamp(11px, 2vw, 13px)',
        opacity: 0.9,
        fontFamily: 'monospace',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    statusBadge: {
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: 'clamp(10px, 2vw, 12px)',
        fontWeight: '700',
        color: 'white',
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    cardBody: {
        padding: '16px',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid #f0f0f0',
        gap: '10px',
    },
    infoLabel: {
        color: '#666',
        fontSize: 'clamp(12px, 2.5vw, 14px)',
        fontWeight: '500',
        flexShrink: 0,
    },
    infoValue: {
        color: '#333',
        fontSize: 'clamp(12px, 2.5vw, 14px)',
        fontWeight: '600',
        textAlign: 'right',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    totalRow: {
        borderTop: '2px solid #667eea',
        borderBottom: 'none',
        marginTop: '8px',
        paddingTop: '14px',
    },
    cardActions: {
        display: 'flex',
        gap: '10px',
        padding: '16px',
        background: '#f8f9fa',
    },
    approveBtn: {
        flex: 1,
        padding: '12px',
        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: 'clamp(14px, 3vw, 16px)',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(40,167,69,0.3)',
    },
    rejectBtn: {
        flex: 1,
        padding: '12px',
        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: 'clamp(14px, 3vw, 16px)',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(220,53,69,0.3)',
    },
    mobileCardContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    mobileCard: {
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
    },
    mobileCardHeader: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '10px',
    },
    mobileCardTitle: {
        fontSize: 'clamp(16px, 4vw, 18px)',
        fontWeight: '700',
        color: 'white',
        marginBottom: '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    mobileCardSubtitle: {
        fontSize: 'clamp(11px, 2.5vw, 12px)',
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'monospace',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    mobileStatusBadge: {
        padding: '5px 10px',
        borderRadius: '12px',
        fontSize: 'clamp(9px, 2vw, 10px)',
        fontWeight: '700',
        color: 'white',
        whiteSpace: 'nowrap',
        flexShrink: 0,
    },
    mobileCardBody: {
        padding: '16px',
    },
    mobileInfoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
    },
    mobileInfoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    mobileInfoLabel: {
        fontSize: 'clamp(11px, 2.5vw, 12px)',
        color: '#666',
        fontWeight: '500',
    },
    mobileInfoValue: {
        fontSize: 'clamp(12px, 3vw, 14px)',
        color: '#333',
        fontWeight: '600',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    mobilePriceValue: {
        fontSize: 'clamp(14px, 3.5vw, 16px)',
        color: '#667eea',
        fontWeight: '700',
    },
    mobileTicketId: {
        fontSize: 'clamp(11px, 2.5vw, 13px)',
        color: '#28a745',
        fontWeight: '700',
        fontFamily: 'monospace',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
};

export default AdminPanel;