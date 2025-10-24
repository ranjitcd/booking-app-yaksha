import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';
const WHATSAPP_NUMBER = '+918618030423';

function LoginPage() {
    const [view, setView] = useState('book');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPayment, setShowPayment] = useState(false);
    const [bookingId, setBookingId] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        customerName: '',
        email: '',
        phone: '',
        eventName: 'Chaduranga - Yakshagana Performance',
        eventDate: '2025-11-23',
        ticketType: 'ಫಸ್ಟ್ ಕ್ಲಾಸ್',
        numberOfTickets: 1,
        pricePerTicket: 500,
    });

    const [searchId, setSearchId] = useState('');
    const [foundTicket, setFoundTicket] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProceedToPayment = (e) => {
        e.preventDefault();
        if (formData.customerName && formData.email && formData.phone) {
            setShowPayment(true);
            setMessage('');
        }
    };

    const handleTicketTypeChange = (e) => {
        const selectedType = e.target.value;
        let price = 500;

        if (selectedType === 'ಗೌರವ ಪ್ರವೇಶ') price = 1000;
        else if (selectedType === 'ಫಸ್ಟ್ ಕ್ಲಾಸ್') price = 500;
        else if (selectedType === 'ಸೆಕೆಂಡ್ ಕ್ಲಾಸ್') price = 250;

        setFormData(prev => ({
            ...prev,
            ticketType: selectedType,
            pricePerTicket: price
        }));
    };

    const handleSubmitPayment = async () => {
        setLoading(true);
        setMessage('');

        try {
            const response = await axios.post(`${API_URL}/bookings/create`, formData);

            if (response.data.success) {
                setBookingId(response.data.bookingId);
                setMessage(`✅ Booking request created! Booking ID: ${response.data.bookingId}`);
            }
        } catch (error) {
            setMessage(`❌ Error: ${error.response?.data?.error || 'Booking request failed'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsAppRedirect = () => {
        const totalPrice = formData.numberOfTickets * formData.pricePerTicket;
        const whatsappMessage = `Hi! I have made a payment of ₹${totalPrice} for Yakshagana ticket booking.
    
*Booking ID:* ${bookingId}
*Name:* ${formData.customerName}
*Email:* ${formData.email}
*Phone:* ${formData.phone}
*Event:* ${formData.eventName}
*Tickets:* ${formData.numberOfTickets}
*Total Amount:* ₹${totalPrice}

I will send the payment screenshot in the next message.`;

        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
    };

    const handleStartNewBooking = () => {
        setFormData({
            customerName: '',
            email: '',
            phone: '',
            eventName: 'Chaduranga - Yakshagana Performance',
            eventDate: '2025-11-23',
            ticketType: 'ಫಸ್ಟ್ ಕ್ಲಾಸ್', // Add this
            numberOfTickets: 1,
            pricePerTicket: 500, // Change to 500
        });
        setShowPayment(false);
        setBookingId('');
        setMessage('');
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFoundTicket(null);
        setMessage('');

        try {
            const response = await axios.get(`${API_URL}/bookings/${searchId}`);
            if (response.data.success) {
                setFoundTicket(response.data.ticket);
            }
        } catch (error) {
            setMessage(`❌ ${error.response?.data?.error || 'Booking not found'}`);
        } finally {
            setLoading(false);
        }
    };

    const totalPrice = formData.numberOfTickets * formData.pricePerTicket;

    return (
        <div style={styles.app}>
            <div style={styles.headerPattern}></div>

            <header style={styles.header}>
                <div style={styles.logoContainer}>
                    <div style={styles.logoCircle}>🎭</div>
                    <div>
                        <h1 style={styles.title}>ಯಕ್ಷಗಾನ Yakshagana</h1>
                        <p style={styles.subtitle}>Traditional Dance Drama of Karnataka</p>
                    </div>
                </div>

                <div style={styles.nav}>
                    <button
                        style={{ ...styles.navButton, ...(view === 'book' ? styles.navButtonActive : {}) }}
                        onClick={() => {
                            setView('book');
                            setMessage('');
                            handleStartNewBooking();
                        }}
                    >
                        📅 Book
                    </button>
                    <button
                        style={{ ...styles.navButton, ...(view === 'view' ? styles.navButtonActive : {}) }}
                        onClick={() => {
                            setView('view');
                            setMessage('');
                            setFoundTicket(null);
                            setSearchId('');
                        }}
                    >
                        🔍 Status
                    </button>
                    <button
                        style={{ ...styles.navButton, ...(view === 'admin' ? styles.navButtonActive : {}) }}
                        onClick={() => {
                            setView('admin');
                            setMessage('');
                        }}
                    >
                        🔐 Admin
                    </button>
                </div>
            </header>

            {view === 'admin' && (
                <div style={styles.adminContainer}>
                    <h2 style={styles.viewTitle}>🔐 Admin Login</h2>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            setLoading(true);
                            setMessage('');

                            try {
                                const res = await axios.post(`${API_URL}/admin/login`, {
                                    username: username,
                                    password
                                });

                                localStorage.setItem('adminToken', res.data.token);
                                setMessage('✅ Logged in successfully!');
                                setTimeout(() => {
                                    navigate('/admin');
                                }, 500);
                            } catch (error) {
                                setMessage('❌ ' + (error.response?.data?.message || 'Invalid credentials'));
                            } finally {
                                setLoading(false);
                            }
                        }}
                        style={styles.form}
                    >
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={styles.input}
                            />
                        </div>
                        <button type="submit" style={styles.submitBtn} disabled={loading}>
                            {loading ? '⏳ Logging in...' : 'Login'}
                        </button>
                    </form>

                    {message && (
                        <div style={{
                            ...styles.message,
                            ...(message.includes('❌') ? styles.messageError : styles.messageSuccess),
                        }}>
                            {message}
                        </div>
                    )}
                </div>
            )}

            <main style={styles.main}>
                {view === 'book' ? (
                    <div style={styles.bookingContainer}>
                        <div style={styles.eventBanner}>
                            <div style={styles.eventIcon}>🎪</div>
                            <div style={styles.eventInfo}>
                                <h2 style={styles.eventTitle}>Chaduranga</h2>
                                <p style={styles.eventSubtitle}>A Mythological Tale of Devotion and Valor</p>
                                <div style={styles.eventDetails}>
                                    <span style={styles.eventDetail}>📅 Nov 23, 2025</span>
                                    <span style={styles.eventDetail}>⏰ 7:00 PM</span>
                                    <span style={styles.eventDetail}>💰 ₹250 - ₹1000</span>
                                </div>
                            </div>
                        </div>

                        {!showPayment ? (
                            <form onSubmit={handleProceedToPayment} style={styles.form}>
                                <h3 style={styles.formTitle}>Book Your Tickets</h3>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Full Name *</label>
                                    <input
                                        type="text"
                                        name="customerName"
                                        value={formData.customerName}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter your full name"
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="your.email@example.com"
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="+91 98765 43210"
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Ticket Type *</label>
                                    <select
                                        name="ticketType"
                                        value={formData.ticketType}
                                        onChange={handleTicketTypeChange}
                                        required
                                        style={styles.select}
                                    >
                                        <option value="ಗೌರವ ಪ್ರವೇಶ">ಗೌರವ ಪ್ರವೇಶ - ₹1000</option>
                                        <option value="ಫಸ್ಟ್ ಕ್ಲಾಸ್">ಫಸ್ಟ್ ಕ್ಲಾಸ್ - ₹500</option>
                                        <option value="ಸೆಕೆಂಡ್ ಕ್ಲಾಸ್">ಸೆಕೆಂಡ್ ಕ್ಲಾಸ್ - ₹250</option>
                                    </select>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Number of Tickets *</label>
                                    <input
                                        type="number"
                                        name="numberOfTickets"
                                        value={formData.numberOfTickets}
                                        onChange={handleInputChange}
                                        min="1"
                                        max="10"
                                        required
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.priceDisplay}>
                                    <span style={styles.priceLabel}>Total Amount:</span>
                                    <span style={styles.priceAmount}>₹{totalPrice}</span>
                                </div>

                                <button type="submit" style={styles.submitBtn}>
                                    Proceed to Payment →
                                </button>
                            </form>
                        ) : !bookingId ? (
                            <div style={styles.paymentContainer}>
                                <h3 style={styles.formTitle}>Complete Payment</h3>

                                <div style={styles.paymentSummary}>
                                    <div style={styles.summaryRow}>
                                        <span>Name:</span>
                                        <strong>{formData.customerName}</strong>
                                    </div>
                                    <div style={styles.summaryRow}>
                                        <span>Ticket Type:</span>
                                        <strong>{formData.ticketType}</strong>
                                    </div>
                                    <div style={styles.summaryRow}>
                                        <span>Tickets:</span>
                                        <strong>{formData.numberOfTickets} × ₹{formData.pricePerTicket}</strong>
                                    </div>
                                    <div style={{ ...styles.summaryRow, ...styles.totalRow }}>
                                        <span>Total Amount:</span>
                                        <strong>₹{totalPrice}</strong>
                                    </div>
                                </div>

                                <div style={styles.qrContainer}>
                                    <h4 style={styles.qrTitle}>Scan to Pay</h4>
                                    <div style={styles.qrBox}>
                                        <div style={styles.qrPlaceholder}>
                                            <div style={styles.qrIcon}>📱</div>
                                            <img src="/QrCode.jpeg" alt="UPI QR Code" style={styles.qrImage} />
                                            <p style={styles.qrSubtext}>GPay • PhonePe • Paytm</p>
                                        </div>
                                    </div>
                                    <p style={styles.upiId}>UPI ID: yakshagana@upi</p>
                                </div>

                                <div style={styles.paymentInstructions}>
                                    <p style={styles.instructionTitle}>📋 Payment Process:</p>
                                    <ol style={styles.instructionList}>
                                        <li>Scan QR code with UPI app</li>
                                        <li>Pay exactly ₹{totalPrice}</li>
                                        <li>Screenshot payment confirmation</li>
                                        <li>Click "I have paid" below</li>
                                        <li>Send screenshot on WhatsApp</li>
                                        <li>Wait for approval (2-4 hours)</li>
                                        <li>Get Ticket ID via email</li>
                                    </ol>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSubmitPayment}
                                    disabled={loading}
                                    style={styles.confirmPaymentBtn}
                                >
                                    {loading ? '⏳ Processing...' : '✓ I have paid ₹' + totalPrice}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowPayment(false)}
                                    style={styles.backBtn}
                                >
                                    ← Back to Form
                                </button>
                            </div>
                        ) : (
                            <div style={styles.successContainer}>
                                <div style={styles.successIcon}>✅</div>
                                <h3 style={styles.successTitle}>Booking Request Submitted!</h3>

                                <div style={styles.bookingIdBox}>
                                    <p style={styles.bookingIdLabel}>Your Booking ID:</p>
                                    <p style={styles.bookingIdValue}>{bookingId}</p>
                                </div>

                                <div style={styles.nextStepsContainer}>
                                    <h4 style={styles.nextStepsTitle}>📲 Next Steps:</h4>
                                    <ol style={styles.nextStepsList}>
                                        <li>Click button to open WhatsApp</li>
                                        <li>Send payment screenshot</li>
                                        <li>Wait for verification (2-4 hours)</li>
                                        <li>Receive Ticket ID via email</li>
                                    </ol>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleWhatsAppRedirect}
                                    style={styles.whatsappBtn}
                                >
                                    <span style={styles.whatsappIcon}>💬</span>
                                    Send Payment Proof
                                </button>

                                <div style={styles.statusCheckInfo}>
                                    <p style={styles.statusCheckText}>
                                        💡 <strong>Track booking:</strong> Use ID ({bookingId}) to check status
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleStartNewBooking}
                                    style={styles.newBookingBtn}
                                >
                                    🎫 Book Another Ticket
                                </button>
                            </div>
                        )}

                        {message && (
                            <div style={{ ...styles.message, ...(message.includes('❌') ? styles.messageError : styles.messageSuccess) }}>
                                {message}
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={styles.viewContainer}>
                        <h2 style={styles.viewTitle}>🔍 Check Status</h2>
                        <p style={styles.viewSubtitle}>Enter Booking or Ticket ID</p>

                        <form onSubmit={handleSearch} style={styles.searchForm}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Booking ID or Ticket ID</label>
                                <input
                                    type="text"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    placeholder="BKG-xxxxx or TKT-xxxxx"
                                    required
                                    style={styles.input}
                                />
                            </div>
                            <button type="submit" disabled={loading} style={styles.submitBtn}>
                                {loading ? '⏳ Searching...' : '🔎 Check Status'}
                            </button>
                        </form>

                        {message && <div style={styles.messageError}>{message}</div>}

                        {foundTicket && (
                            <div style={styles.ticketCard}>
                                <div style={styles.ticketHeader}>
                                    <h3 style={styles.ticketTitle}>
                                        {foundTicket.status === 'confirmed' ? '✅ Confirmed' :
                                            foundTicket.status === 'pending_payment' ? '⏳ Pending' :
                                                foundTicket.status === 'rejected' ? '❌ Failed' :
                                                    '🚫 Cancelled'}
                                    </h3>
                                    <span style={{
                                        ...styles.ticketStatus,
                                        background: foundTicket.status === 'confirmed' ? 'rgba(40,167,69,0.3)' :
                                            foundTicket.status === 'pending_payment' ? 'rgba(255,193,7,0.3)' :
                                                'rgba(220,53,69,0.3)',
                                        color: foundTicket.status === 'confirmed' ? '#155724' :
                                            foundTicket.status === 'pending_payment' ? '#856404' :
                                                '#721c24'
                                    }}>
                                        {foundTicket.status === 'confirmed' ? 'CONFIRMED' :
                                            foundTicket.status === 'pending_payment' ? 'PENDING' :
                                                foundTicket.status === 'rejected' ? 'REJECTED' : 'CANCELLED'}
                                    </span>
                                </div>

                                <div style={styles.ticketBody}>
                                    {foundTicket.ticketId && (
                                        <div style={styles.detailRow}>
                                            <span style={styles.detailLabel}>🎫 Ticket ID:</span>
                                            <span style={styles.detailValue}>{foundTicket.ticketId}</span>
                                        </div>
                                    )}
                                    <div style={styles.detailRow}>
                                        <span style={styles.detailLabel}>📋 Booking ID:</span>
                                        <span style={styles.detailValue}>{foundTicket.bookingId}</span>
                                    </div>
                                    <div style={styles.detailRow}>
                                        <span style={styles.detailLabel}>👤 Name:</span>
                                        <span style={styles.detailValue}>{foundTicket.customerName}</span>
                                    </div>
                                    <div style={styles.detailRow}>
                                        <span style={styles.detailLabel}>📧 Email:</span>
                                        <span style={styles.detailValue}>{foundTicket.email}</span>
                                    </div>
                                    <div style={styles.detailRow}>
                                        <span style={styles.detailLabel}>📱 Phone:</span>
                                        <span style={styles.detailValue}>{foundTicket.phone}</span>
                                    </div>
                                    <div style={styles.detailRow}>
                                        <span style={styles.detailLabel}>🎭 Event:</span>
                                        <span style={styles.detailValue}>{foundTicket.eventName}</span>
                                    </div>
                                    <div style={styles.detailRow}>
                                        <span style={styles.detailLabel}>📅 Date:</span>
                                        <span style={styles.detailValue}>
                                            {new Date(foundTicket.eventDate).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div style={styles.detailRow}>
                                        <span style={styles.detailLabel}>🎟️ Tickets:</span>
                                        <span style={styles.detailValue}>{foundTicket.numberOfTickets}</span>
                                    </div>
                                    <div style={styles.detailRow}>
                                        <span style={styles.detailLabel}>💰 Total:</span>
                                        <span style={styles.detailValue}>₹{foundTicket.totalPrice}</span>
                                    </div>
                                </div>

                                {foundTicket.status === 'pending_payment' && (
                                    <div style={styles.ticketFooter}>
                                        <p style={{ margin: 0, color: '#856404', fontWeight: '600', fontSize: '14px' }}>
                                            ⏳ Payment verification in progress. Ticket ID will be sent via email (2-4 hours).
                                        </p>
                                    </div>
                                )}
                                {foundTicket.status === 'confirmed' && (
                                    <div style={{ ...styles.ticketFooter, background: '#d4edda', borderTop: '2px dashed #28a745' }}>
                                        <p style={{ margin: 0, color: '#155724', fontWeight: '600', fontSize: '14px' }}>
                                            ✅ Ticket confirmed! Check email. Carry Ticket ID and valid ID to venue.
                                        </p>
                                    </div>
                                )}
                                {foundTicket.status === 'rejected' && (
                                    <div style={{ ...styles.ticketFooter, background: '#f8d7da', borderTop: '2px dashed #dc3545' }}>
                                        <p style={{ margin: 0, color: '#721c24', fontWeight: '600', fontSize: '14px' }}>
                                            ❌ Payment verification failed. Contact +91 98765 43210 with payment proof.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>

            <footer style={styles.footer}>
                <div style={styles.footerPattern}></div>
                <p style={styles.footerText}>🎭 Yakshagana Cultural Trust</p>
                <p style={styles.footerSubtext}>Preserving Karnataka's Rich Heritage</p>
                <p style={styles.footerSubtext}>Contact: +91 98765 43210</p>
            </footer>
        </div>
    );
}

const styles = {
    app: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 50%, #4ECDC4 100%)',
        position: 'relative',
        fontFamily: '"Segoe UI", "Noto Sans Kannada", sans-serif',
    },
    headerPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '200px',
        background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 2px, transparent 2px, transparent 10px)',
        pointerEvents: 'none',
    },
    header: {
        position: 'relative',
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px 15px',
    },
    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '20px',
    },
    logoCircle: {
        width: '60px',
        height: '60px',
        background: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '30px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
        flexShrink: 0,
    },
    title: {
        margin: 0,
        fontSize: 'clamp(20px, 5vw, 36px)',
        color: 'white',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        fontWeight: '700',
        lineHeight: 1.2,
    },
    subtitle: {
        margin: '5px 0 0 0',
        color: 'rgba(255,255,255,0.95)',
        fontSize: 'clamp(12px, 3vw, 16px)',
        textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
    },
    nav: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    navButton: {
        padding: '12px 20px',
        border: '3px solid white',
        background: 'rgba(255,255,255,0.2)',
        color: 'white',
        borderRadius: '50px',
        cursor: 'pointer',
        fontSize: 'clamp(13px, 3vw, 16px)',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        whiteSpace: 'nowrap',
    },
    navButtonActive: {
        background: 'white',
        color: '#FF6B6B',
        transform: 'scale(1.05)',
        boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
    },
    main: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '10px 15px 20px',
    },
    bookingContainer: {
        background: 'white',
        borderRadius: '20px',
        padding: 'clamp(20px, 5vw, 40px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden',
    },
    adminContainer: {
        background: 'white',
        borderRadius: '20px',
        padding: 'clamp(20px, 5vw, 40px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '800px',
        margin: '0 auto',
    },
    eventBanner: {
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
        borderRadius: '15px',
        padding: 'clamp(20px, 4vw, 30px)',
        marginBottom: '25px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '15px',
        color: 'white',
        boxShadow: '0 10px 30px rgba(255,107,107,0.3)',
    },
    eventIcon: {
        fontSize: 'clamp(40px, 10vw, 60px)',
        flexShrink: 0,
    },
    eventInfo: {
        flex: 1,
        minWidth: 0,
    },
    eventTitle: {
        margin: 0,
        fontSize: 'clamp(22px, 5vw, 32px)',
        fontWeight: '700',
        textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
    },
    eventSubtitle: {
        margin: '8px 0',
        fontSize: 'clamp(13px, 3vw, 16px)',
        opacity: 0.95,
    },
    eventDetails: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        marginTop: '12px',
    },
    eventDetail: {
        background: 'rgba(255,255,255,0.25)',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: 'clamp(11px, 2.5vw, 14px)',
        fontWeight: '600',
        backdropFilter: 'blur(10px)',
        whiteSpace: 'nowrap',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
    },
    formTitle: {
        margin: '0 0 10px 0',
        color: '#333',
        fontSize: 'clamp(20px, 4vw, 24px)',
        textAlign: 'center',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        fontSize: 'clamp(14px, 3vw, 15px)',
        fontWeight: '600',
        color: '#555',
    },
    input: {
        padding: '14px 16px',
        border: '2px solid #e0e0e0',
        borderRadius: '12px',
        fontSize: 'clamp(14px, 3vw, 16px)',
        transition: 'all 0.3s ease',
        fontFamily: 'inherit',
        width: '100%',
        boxSizing: 'border-box',
    },
    priceDisplay: {
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
        padding: '20px',
        borderRadius: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white',
        boxShadow: '0 5px 20px rgba(255,107,107,0.3)',
        flexWrap: 'wrap',
        gap: '10px',
    },
    priceLabel: {
        fontSize: 'clamp(16px, 4vw, 20px)',
        fontWeight: '600',
    },
    priceAmount: {
        fontSize: 'clamp(24px, 6vw, 32px)',
        fontWeight: '700',
    },
    submitBtn: {
        padding: '16px',
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '15px',
        fontSize: 'clamp(16px, 3.5vw, 18px)',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 5px 20px rgba(255,107,107,0.4)',
        width: '100%',
    },
    paymentContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    paymentSummary: {
        background: '#f9f9f9',
        padding: '18px',
        borderRadius: '15px',
        border: '2px solid #e0e0e0',
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: '1px solid #e0e0e0',
        fontSize: 'clamp(14px, 3vw, 16px)',
        gap: '10px',
    },
    totalRow: {
        borderBottom: 'none',
        fontSize: 'clamp(18px, 4vw, 20px)',
        color: '#FF6B6B',
        paddingTop: '15px',
        marginTop: '10px',
        borderTop: '2px solid #FF6B6B',
    },
    qrContainer: {
        textAlign: 'center',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        color: 'white',
    },
    qrTitle: {
        margin: '0 0 20px 0',
        fontSize: 'clamp(18px, 4vw, 22px)',
    },
    qrPlaceholder: {
        border: '3px dashed #ccc',
        borderRadius: '10px',
        padding: '30px 15px',
        textAlign: 'center',
    },
    qrIcon: {
        fontSize: '40px',
        marginBottom: '10px',
    },
    qrText: {
        margin: '10px 0',
        color: '#666',
        fontSize: 'clamp(12px, 3vw, 14px)',
    },
    qrSubtext: {
        margin: 0,
        color: '#999',
        fontSize: 'clamp(11px, 2.5vw, 12px)',
    },
    upiId: {
        margin: '10px 0 0 0',
        fontSize: 'clamp(14px, 3vw, 16px)',
        fontWeight: '600',
    },
    paymentInstructions: {
        background: '#fff8dc',
        padding: '18px',
        borderRadius: '15px',
        border: '2px solid #FFE66D',
    },
    instructionTitle: {
        margin: '0 0 10px 0',
        fontWeight: '700',
        color: '#FF6B6B',
        fontSize: 'clamp(14px, 3vw, 16px)',
    },
    instructionList: {
        margin: '10px 0 0 20px',
        padding: 0,
        color: '#555',
        lineHeight: '1.8',
        fontSize: 'clamp(13px, 3vw, 15px)',
    },
    confirmPaymentBtn: {
        padding: '16px',
        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '15px',
        fontSize: 'clamp(16px, 3.5vw, 18px)',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 5px 20px rgba(40,167,69,0.4)',
        width: '100%',
    },
    backBtn: {
        padding: '14px',
        background: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: 'clamp(14px, 3vw, 16px)',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        width: '100%',
    },
    successContainer: {
        textAlign: 'center',
        padding: '10px',
    },
    successIcon: {
        fontSize: 'clamp(60px, 15vw, 80px)',
        marginBottom: '20px',
    },
    successTitle: {
        margin: '0 0 25px 0',
        color: '#28a745',
        fontSize: 'clamp(22px, 5vw, 28px)',
    },
    bookingIdBox: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        borderRadius: '15px',
        marginBottom: '25px',
        color: 'white',
    },
    bookingIdLabel: {
        margin: '0 0 10px 0',
        fontSize: 'clamp(14px, 3vw, 16px)',
        opacity: 0.9,
    },
    bookingIdValue: {
        margin: 0,
        fontSize: 'clamp(20px, 5vw, 28px)',
        fontWeight: '700',
        letterSpacing: '1px',
        wordBreak: 'break-all',
    },
    nextStepsContainer: {
        background: '#fff8dc',
        padding: '18px',
        borderRadius: '15px',
        marginBottom: '20px',
        textAlign: 'left',
        border: '2px solid #FFE66D',
    },
    nextStepsTitle: {
        margin: '0 0 12px 0',
        color: '#FF6B6B',
        fontSize: 'clamp(16px, 4vw, 20px)',
    },
    nextStepsList: {
        margin: '0',
        padding: '0 0 0 20px',
        color: '#555',
        lineHeight: '1.8',
        fontSize: 'clamp(13px, 3vw, 15px)',
    },
    whatsappBtn: {
        padding: '16px',
        background: '#25D366',
        color: 'white',
        border: 'none',
        borderRadius: '15px',
        fontSize: 'clamp(16px, 3.5vw, 18px)',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 5px 20px rgba(37,211,102,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        width: '100%',
    },
    whatsappIcon: {
        fontSize: 'clamp(20px, 5vw, 24px)',
    },
    statusCheckInfo: {
        background: '#e3f2fd',
        padding: '15px',
        borderRadius: '12px',
        margin: '20px 0',
        border: '2px solid #90caf9',
    },
    statusCheckText: {
        margin: 0,
        color: '#1565c0',
        fontSize: 'clamp(12px, 3vw, 14px)',
        lineHeight: 1.6,
    },
    newBookingBtn: {
        padding: '14px',
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: 'clamp(14px, 3vw, 16px)',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        width: '100%',
    },
    message: {
        marginTop: '20px',
        padding: '16px',
        borderRadius: '15px',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 'clamp(13px, 3vw, 15px)',
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
        padding: '16px',
        borderRadius: '15px',
        textAlign: 'center',
        fontWeight: '600',
        marginTop: '20px',
        fontSize: 'clamp(13px, 3vw, 15px)',
    },
    viewContainer: {
        background: 'white',
        borderRadius: '20px',
        padding: 'clamp(20px, 5vw, 40px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    viewTitle: {
        margin: '0 0 10px 0',
        color: '#333',
        fontSize: 'clamp(22px, 5vw, 28px)',
        textAlign: 'center',
    },
    viewSubtitle: {
        margin: '0 0 25px 0',
        color: '#666',
        fontSize: 'clamp(13px, 3vw, 16px)',
        textAlign: 'center',
    },
    searchForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
    },
    ticketCard: {
        marginTop: '25px',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '3px solid #FF6B6B',
        boxShadow: '0 10px 30px rgba(255,107,107,0.2)',
    },
    ticketHeader: {
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white',
        flexWrap: 'wrap',
        gap: '12px',
    },
    ticketTitle: {
        margin: 0,
        fontSize: 'clamp(18px, 4vw, 24px)',
    },
    ticketStatus: {
        padding: '6px 16px',
        borderRadius: '20px',
        fontSize: 'clamp(12px, 3vw, 14px)',
        fontWeight: '700',
        backdropFilter: 'blur(10px)',
        whiteSpace: 'nowrap',
    },
    ticketBody: {
        padding: 'clamp(20px, 4vw, 30px)',
    },
    detailRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: '1px solid #dee2e6',
        fontSize: 'clamp(13px, 3vw, 15px)',
        gap: '15px',
    },
    detailLabel: {
        color: '#666',
        fontWeight: '500',
        minWidth: '100px',
        flexShrink: 0,
    },
    detailValue: {
        color: '#333',
        fontWeight: '700',
        textAlign: 'right',
        wordBreak: 'break-word',
    },
    ticketFooter: {
        background: '#fff8dc',
        padding: '18px',
        textAlign: 'center',
        borderTop: '2px dashed #FFE66D',
    },
    footer: {
        position: 'relative',
        textAlign: 'center',
        padding: '30px 20px',
        color: 'white',
        marginTop: '30px',
    },
    footerPattern: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
        background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 2px, transparent 2px, transparent 15px)',
        pointerEvents: 'none',
    },
    footerText: {
        position: 'relative',
        margin: '0 0 8px 0',
        fontSize: 'clamp(16px, 4vw, 18px)',
        fontWeight: '600',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    },
    footerSubtext: {
        position: 'relative',
        margin: '0 0 5px 0',
        fontSize: 'clamp(12px, 3vw, 14px)',
        opacity: 0.9,
    },
    qrBox: {
        background: 'white',
        padding: '20px',
        borderRadius: '15px',
        margin: '0 auto 15px',
        maxWidth: '400px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },

    qrImage: {
        width: '100%',
        maxWidth: '350px',
        height: 'auto',
        objectFit: 'contain',
        display: 'block',
    },
    select: {
        padding: '14px 16px',
        border: '2px solid #e0e0e0',
        borderRadius: '12px',
        fontSize: 'clamp(14px, 3vw, 16px)',
        transition: 'all 0.3s ease',
        fontFamily: 'inherit',
        width: '100%',
        boxSizing: 'border-box',
        appearance: 'none',
        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        backgroundSize: '20px',
        paddingRight: '40px',
        cursor: 'pointer',
    }

};

export default LoginPage;