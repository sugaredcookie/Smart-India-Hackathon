import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Quote.css";
const backendURL = process.env.NODE_ENV === 'production' ? '' : 'https://smart-india-hackathon-816r.onrender.com';

const Quote = () => {
  const navigate = useNavigate();
  const [quoteRequests, setQuoteRequests] = useState([]);
  const [myQuoteRequests, setMyQuoteRequests] = useState([]);
  const [myQuoteResponses, setMyQuoteResponses] = useState([]);
  const [quoteResponses, setQuoteResponses] = useState([]);
  const [loading, setLoading] = useState({
    quoteRequests: true,
    myQuoteRequests: false,
    myQuoteResponses: false,
    quoteResponses: false,
    user: true
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filters, setFilters] = useState({
    goodsCategory: "",
    shipmentType: "",
    pickupLocation: "",
    deliveryLocation: "",
    searchQuery: ""
  });
  const [currentUser, setCurrentUser] = useState(null);

  // New quote request form state
  const [newQuoteRequest, setNewQuoteRequest] = useState({
    pickupLocation: "",
    deliveryLocation: "",
    goodsCategory: "",
    goodsType: "",
    packagingType: "",
    totalQuantity: "",
    isStackable: true,
    productDimensions: {
      length: "",
      width: "",
      height: "",
      unit: "cm"
    },
    volumetricWeight: "",
    pickupDate: "",
    shipmentType: "",
    contact: {
      mobileNumber: "",
      email: ""
    },
    notes: ""
  });

  // New quote response form state
  const [newQuoteResponse, setNewQuoteResponse] = useState({
    quoteAmount: "",
    currency: "INR",
    validity: "",
    termsAndConditions: "",
    estimatedDeliveryDays: "",
    notes: ""
  });

// Get current user info - FIXED VERSION
useEffect(() => {
  const getCurrentUser = async () => {
    try {
      setLoading(prev => ({ ...prev, user: true }));
      
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Configure axios with the token FIRST before any API calls
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Clear any potentially corrupted user data first
      localStorage.removeItem("user");

      // Fetch fresh user data from API
      try {
        console.log("Fetching user data from /api/auth/me");
        const backendUrl = process.env.NODE_ENV === 'production' ? '' : 'https://smart-india-hackathon-816r.onrender.com';
        const response = await axios.get(`${backendUrl}/api/auth/me`);
        // console.log("Full API response:", response);
        
        // Handle different possible response structures more carefully
        let userData = null;
        
        // Check if response.data exists and is an object
        if (response.data && typeof response.data === 'object') {
          // Check nested structures
          if (response.data.data && response.data.data.user) {
            userData = response.data.data.user;
            console.log("Using response.data.data.user structure");
          } else if (response.data.data && typeof response.data.data === 'object') {
            userData = response.data.data;
            console.log("Using response.data.data structure");
          } else if (response.data.user) {
            userData = response.data.user;
            console.log("Using response.data.user structure");
          } else {
            // If none of the above, use the entire data object
            userData = response.data;
            // console.log("Using response.data structure");
          }
        } else {
          // console.error("Invalid response structure:", response);
          throw new Error("Invalid API response format");
        }
        
        // console.log("Extracted userData:", userData);
        
        // Validate the extracted user data
        if (!userData || typeof userData !== 'object' || !userData._id) {
          console.error("Invalid user data structure:", userData);
          throw new Error("Invalid user data received from server");
        }
        
        // Ensure role field exists and is correct
        if (!userData.role) {
          // console.warn("No role field found in user data, checking alternatives");
          if (userData.userType) {
            userData.role = userData.userType;
          } else if (userData.type) {
            userData.role = userData.type;
          } else {
            // Try to infer role from other fields
            if (userData.licenseNumber) {
              userData.role = "transporter";
            } else if (userData.networkId) {
              userData.role = "freight-forwarder";
            } else if (userData.businessType) {
              userData.role = "company";
            } else {
              // Default to company if we can't determine
              userData.role = "company";
            }
            // console.log("Inferred role as:", userData.role);
          }
        }
        
        // console.log("Final user role:", userData.role);
        
        setCurrentUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        
      } catch (fetchError) {
        // console.error("Failed to fetch user data:", fetchError);
        
        // More detailed error handling
        if (fetchError.response) {
          console.error("Response status:", fetchError.response.status);
          console.error("Response data:", fetchError.response.data);
          
          if (fetchError.response.status === 401) {
            setError("Your session has expired. Please log in again.");
          } else if (fetchError.response.status === 404) {
            setError("User not found. Please log in again.");
          } else {
            setError(`Server error (${fetchError.response.status}). Please try again.`);
          }
        } else if (fetchError.request) {
          console.error("No response received:", fetchError.request);
          setError("Network error. Please check your connection and try again.");
        } else {
          setError("Failed to load user data. Please try again.");
        }
        
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      
      setLoading(prev => ({ ...prev, user: false }));
    } catch (error) {
      // console.error("Error in getCurrentUser:", error);
      setLoading(prev => ({ ...prev, user: false }));
      setError(error.message);
    }
  };

  getCurrentUser();
}, [navigate]);

  // Load data based on active tab
  useEffect(() => {
    if (!currentUser) return;

    if (activeTab === "browse" && (currentUser.role === "freight-forwarder" || currentUser.role === "transporter")) {
      loadQuoteRequests();
    } else if (activeTab === "myRequests" && currentUser.role === "company") {
      loadMyQuoteRequests();
    } else if (activeTab === "myResponses" && (currentUser.role === "freight-forwarder" || currentUser.role === "transporter")) {
      loadMyQuoteResponses();
    }
  }, [activeTab, currentUser, filters]);

  // Load all quote requests (for freight forwarders/transporters to browse)
  const loadQuoteRequests = async () => {
    try {
      setLoading(prev => ({ ...prev, quoteRequests: true }));
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await axios.get(`${backendURL}/api/quote-requests?${params.toString()}`);
      const requestsData = response.data.data?.quoteRequests || [];
      setQuoteRequests(requestsData);
    } catch (error) {
      console.error("Error loading quote requests:", error);
      setError("Failed to load quote requests. Please check your connection.");
    } finally {
      setLoading(prev => ({ ...prev, quoteRequests: false }));
    }
  };

  // Load quote requests created by the current company
  const loadMyQuoteRequests = async () => {
    try {
      setLoading(prev => ({ ...prev, myQuoteRequests: true }));
      const response = await axios.get(`${backendURL}/api/quote-requests/my`);
      const requestsData = response.data.data?.quoteRequests || [];
      setMyQuoteRequests(requestsData);
    } catch (error) {
      console.error("Error loading my quote requests:", error);
      setError("Failed to load your quote requests.");
    } finally {
      setLoading(prev => ({ ...prev, myQuoteRequests: false }));
    }
  };

  // Load quote responses created by the current freight forwarder/transporter
  const loadMyQuoteResponses = async () => {
    try {
      setLoading(prev => ({ ...prev, myQuoteResponses: true }));
      const response = await axios.get(`${backendURL}/api/quote-responses/my`);
      const responsesData = response.data.data?.quoteResponses || [];
      setMyQuoteResponses(responsesData);
    } catch (error) {
      console.error("Error loading my quote responses:", error);
      setError("Failed to load your quote responses.");
    } finally {
      setLoading(prev => ({ ...prev, myQuoteResponses: false }));
    }
  };

  // Load responses for a specific quote request
  const loadQuoteResponses = async (requestId) => {
    try {
      setLoading(prev => ({ ...prev, quoteResponses: true }));
      const response = await axios.get(`${backendURL}/api/quote-requests/${requestId}/responses`);
      const responsesData = response.data.data?.quoteResponses || [];
      setQuoteResponses(responsesData);
      return responsesData;
    } catch (error) {
      console.error("Error loading quote responses:", error);
      setError("Failed to load quote responses.");
      return [];
    } finally {
      setLoading(prev => ({ ...prev, quoteResponses: false }));
    }
  };

  // Create a new quote request
  const createQuoteRequest = async () => {
    try {
      const requestData = {
        ...newQuoteRequest,
        totalQuantity: parseInt(newQuoteRequest.totalQuantity),
        volumetricWeight: parseFloat(newQuoteRequest.volumetricWeight),
        productDimensions: {
          length: parseFloat(newQuoteRequest.productDimensions.length),
          width: parseFloat(newQuoteRequest.productDimensions.width),
          height: parseFloat(newQuoteRequest.productDimensions.height),
          unit: newQuoteRequest.productDimensions.unit
        }
      };

      await axios.post(`${backendURL}/api/quote-requests`, requestData);
      
      setShowCreateModal(false);
      setSuccess("Quote request created successfully!");
      setTimeout(() => setSuccess(null), 3000);
      
      // Reset form
      setNewQuoteRequest({
        pickupLocation: "",
        deliveryLocation: "",
        goodsCategory: "",
        goodsType: "",
        packagingType: "",
        totalQuantity: "",
        isStackable: true,
        productDimensions: {
          length: "",
          width: "",
          height: "",
          unit: "cm"
        },
        volumetricWeight: "",
        pickupDate: "",
        shipmentType: "",
        contact: {
          mobileNumber: "",
          email: ""
        },
        notes: ""
      });

      // Reload my quote requests if on that tab
      if (activeTab === "myRequests") {
        loadMyQuoteRequests();
      }
    } catch (error) {
      console.error("Failed to create quote request:", error);
      setError("Failed to create quote request. Please try again.");
    }
  };

  // Create a new quote response
  const createQuoteResponse = async () => {
    try {
      const responseData = {
        ...newQuoteResponse,
        quoteAmount: parseFloat(newQuoteResponse.quoteAmount),
        estimatedDeliveryDays: newQuoteResponse.estimatedDeliveryDays ? parseInt(newQuoteResponse.estimatedDeliveryDays) : undefined
      };

      await axios.post(`${backendURL}/api/quote-requests/${selectedRequest._id}/respond`, responseData);
      
      setShowRespondModal(false);
      setSuccess("Quote response submitted successfully!");
      setTimeout(() => setSuccess(null), 3000);
      
      // Reset form
      setNewQuoteResponse({
        quoteAmount: "",
        currency: "INR",
        validity: "",
        termsAndConditions: "",
        estimatedDeliveryDays: "",
        notes: ""
      });

      setSelectedRequest(null);
      
      // Reload quote requests if on browse tab
      if (activeTab === "browse") {
        loadQuoteRequests();
      }
    } catch (error) {
      console.error("Failed to create quote response:", error);
      setError("Failed to submit quote response. Please try again.");
    }
  };

  // Accept a quote response
  const acceptQuoteResponse = async (responseId) => {
    try {
      await axios.post(`${backendURL}/api/quote-responses/${responseId}/accept`);
      
      setSuccess("Quote response accepted successfully!");
      setTimeout(() => setSuccess(null), 3000);
      
      // Reload responses
      const updatedResponses = await loadQuoteResponses(selectedRequest._id);
      setSelectedRequest({...selectedRequest, responses: updatedResponses});
      
      // Reload my quote requests to see updated status
      if (activeTab === "myRequests") {
        loadMyQuoteRequests();
      }
    } catch (error) {
      console.error("Failed to accept quote response:", error);
      setError("Failed to accept quote response. Please try again.");
    }
  };

  // Update filter values
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Update new quote request form values
  const handleRequestInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith("contact.")) {
      const contactField = name.split(".")[1];
      setNewQuoteRequest(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          [contactField]: value
        }
      }));
    } else if (name.startsWith("productDimensions.")) {
      const dimensionField = name.split(".")[1];
      setNewQuoteRequest(prev => ({
        ...prev,
        productDimensions: {
          ...prev.productDimensions,
          [dimensionField]: value
        }
      }));
    } else {
      setNewQuoteRequest(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  // Update new quote response form values
  const handleResponseInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuoteResponse(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount, currency) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR'
    }).format(amount);
  };

  // Filter quote requests based on search query
  const filteredQuoteRequests = quoteRequests.filter(request => {
    if (!filters.searchQuery) return true;
    
    const searchTerm = filters.searchQuery.toLowerCase();
    return (
      (request.pickupLocation?.toLowerCase() || "").includes(searchTerm) ||
      (request.deliveryLocation?.toLowerCase() || "").includes(searchTerm) ||
      (request.goodsCategory?.toLowerCase() || "").includes(searchTerm) ||
      (request.goodsType?.toLowerCase() || "").includes(searchTerm) ||
      (request.company?.companyName?.toLowerCase() || "").includes(searchTerm)
    );
  });

  if (loading.user) {
    return (
      <div className="quote-container">
        <div className="loading-fullscreen">
          <p>Loading user information...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="quote-container">
        <div className="error-banner">
          <span>Please log in to access quotes</span>
        </div>
      </div>
    );
  }

  return (
    <div className="quote-container">
      {error && (
        <div className="error-banner">
          <div>
            <span>{error}</span>
            <button 
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
              }}
              className="login-again-btn"
            >
              Login Again
            </button>
          </div>
          <button onClick={() => setError(null)} className="close-error-btn">×</button>
        </div>
      )}
      
      {success && (
        <div className="success-banner">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      <div className="quote-header">
        <h1>💼 Quotation Management</h1>
        <p>Manage shipment requests and quotes between companies and transporters</p>
      </div>

      {/* Tabs Navigation */}
      <div className="quote-tabs">
        {(currentUser?.role === "freight-forwarder" || currentUser?.role === "transporter") && (
          <button 
            className={activeTab === "browse" ? "active" : ""}
            onClick={() => setActiveTab("browse")}
          >
            Browse Requests
          </button>
        )}
        
        {currentUser?.role === "company" && (
          <button 
            className={activeTab === "myRequests" ? "active" : ""}
            onClick={() => setActiveTab("myRequests")}
          >
            My Requests
          </button>
        )}
        
        {(currentUser?.role === "freight-forwarder" || currentUser?.role === "transporter") && (
          <button 
            className={activeTab === "myResponses" ? "active" : ""}
            onClick={() => setActiveTab("myResponses")}
          >
            My Responses
          </button>
        )}
      </div>

      
      {/* {console.log('Current user:', currentUser)} */}

      {/* Browse Requests Tab (for freight forwarders/transporters) */}
      {activeTab === "browse" && (currentUser.role === "freight-forwarder" || currentUser.role === "transporter") && (
        <div className="tab-content">
          <div className="filters-section">
            <h3>Filter Requests</h3>
            
            {/* Search Bar */}
            <div className="search-bar">
              <input
                type="text"
                name="searchQuery"
                value={filters.searchQuery}
                onChange={handleFilterChange}
                placeholder="Search by location, goods, or company..."
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            
            <div className="filter-grid">
              <div className="filter-group">
                <label>Goods Category</label>
                <select 
                  name="goodsCategory" 
                  value={filters.goodsCategory}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Food">Food</option>
                  <option value="Machinery">Machinery</option>
                  <option value="Chemicals">Chemicals</option>
                  <option value="Construction Materials">Construction Materials</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Pharmaceuticals">Pharmaceuticals</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Shipment Type</label>
                <select 
                  name="shipmentType" 
                  value={filters.shipmentType}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  <option value="Road">Road</option>
                  <option value="Rail">Rail</option>
                  <option value="Air">Air</option>
                  <option value="Sea">Sea</option>
                  <option value="Multimodal">Multimodal</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Pickup Location</label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={filters.pickupLocation}
                  onChange={handleFilterChange}
                  placeholder="Enter location"
                />
              </div>
              
              <div className="filter-group">
                <label>Delivery Location</label>
                <input
                  type="text"
                  name="deliveryLocation"
                  value={filters.deliveryLocation}
                  onChange={handleFilterChange}
                  placeholder="Enter location"
                />
              </div>
            </div>
          </div>
          
          {loading.quoteRequests ? (
            <div className="loading">Loading quote requests...</div>
          ) : filteredQuoteRequests.length === 0 ? (
            <div className="empty-state">
              <h3>No quote requests available</h3>
              <p>There are currently no quote requests matching your filters.</p>
            </div>
          ) : (
            <div className="quotes-grid">
              {filteredQuoteRequests.map(request => (
                <div key={request._id} className="quote-card">
                  <div className="quote-header">
                    <h3>{request.goodsCategory} Shipment</h3>
                    <span className={`status-badge status-${request.status}`}>
                      {request.status}
                    </span>
                  </div>
                  
                  <div className="quote-details">
                    <div className="route">
                      <span className="from">{request.pickupLocation}</span>
                      <span className="arrow">→</span>
                      <span className="to">{request.deliveryLocation}</span>
                    </div>
                    
                    <div className="quote-meta">
                      <div className="meta-item">
                        <span className="label">Goods Type:</span>
                        <span>{request.goodsType}</span>
                      </div>
                      <div className="meta-item">
                        <span className="label">Quantity:</span>
                        <span>{request.totalQuantity} units</span>
                      </div>
                      <div className="meta-item">
                        <span className="label">Pickup Date:</span>
                        <span>{formatDate(request.pickupDate)}</span>
                      </div>
                      <div className="meta-item">
                        <span className="label">Shipment Type:</span>
                        <span>{request.shipmentType}</span>
                      </div>
                    </div>
                    
                    <div className="company-info">
                      <span className="company-name">By: {request.company?.companyName || "Unknown Company"}</span>
                    </div>
                  </div>
                  
                  <div className="quote-actions">
                    <button 
                      className="accept-btn"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowRespondModal(true);
                      }}
                    >
                      Submit Quote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Requests Tab (for companies) */}
      {activeTab === "myRequests" && currentUser.role === "company" && (
        <div className="tab-content">
          {/* FIXED: Only show Create button for company role */}
          <div className="create-quote-btn-container">
            <button 
              className="create-quote-btn"
              onClick={() => setShowCreateModal(true)}
            >
              + Create New Request
            </button>
          </div>
          
          {loading.myQuoteRequests ? (
            <div className="loading">Loading your quote requests...</div>
          ) : myQuoteRequests.length === 0 ? (
            <div className="empty-state">
              <h3>You haven't created any quote requests yet</h3>
              <p>Create your first request to get quotes from transporters.</p>
            </div>
          ) : (
            <div className="quotes-grid">
              {myQuoteRequests.map(request => (
                <div key={request._id} className="quote-card">
                  <div className="quote-header">
                    <h3>{request.goodsCategory} Shipment</h3>
                    <span className={`status-badge status-${request.status}`}>
                      {request.status}
                    </span>
                  </div>
                  
                  <div className="quote-details">
                    <div className="route">
                      <span className="from">{request.pickupLocation}</span>
                      <span className="arrow">→</span>
                      <span className="to">{request.deliveryLocation}</span>
                    </div>
                    
                    <div className="quote-meta">
                      <div className="meta-item">
                        <span className="label">Goods Type:</span>
                        <span>{request.goodsType}</span>
                      </div>
                      <div className="meta-item">
                        <span className="label">Quantity:</span>
                        <span>{request.totalQuantity} units</span>
                      </div>
                      <div className="meta-item">
                        <span className="label">Pickup Date:</span>
                        <span>{formatDate(request.pickupDate)}</span>
                      </div>
                      <div className="meta-item">
                        <span className="label">Status:</span>
                        <span>{request.status}</span>
                      </div>
                    </div>

                    <div className="quote-actions">
                      <button 
                        className="accept-btn"
                        onClick={async () => {
                          const responses = await loadQuoteResponses(request._id);
                          setSelectedRequest({...request, responses});
                          setShowResponsesModal(true);
                        }}
                      >
                        View Quotes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Responses Tab (for freight forwarders/transporters) */}
      {activeTab === "myResponses" && (currentUser.role === "freight-forwarder" || currentUser.role === "transporter") && (
        <div className="tab-content">
          {/* FIXED: Hide Create button for non-company roles */}
          {loading.myQuoteResponses ? (
            <div className="loading">Loading your quote responses...</div>
          ) : myQuoteResponses.length === 0 ? (
            <div className="empty-state">
              <h3>You haven't submitted any quote responses yet</h3>
              <p>Browse available requests and submit quotes to get started.</p>
            </div>
          ) : (
            <div className="quotes-grid">
              {myQuoteResponses.map(response => (
                <div key={response._id} className="quote-card">
                  <div className="quote-header">
                    <h3>{response.quoteRequest?.goodsCategory} Shipment</h3>
                    <span className={`status-badge status-${response.status}`}>
                      {response.status}
                    </span>
                  </div>
                  
                  <div className="quote-details">
                    <div className="route">
                      <span className="from">{response.quoteRequest?.pickupLocation}</span>
                      <span className="arrow">→</span>
                      <span className="to">{response.quoteRequest?.deliveryLocation}</span>
                    </div>
                    
                    <div className="quote-meta">
                      <div className="meta-item">
                        <span className="label">Goods Type:</span>
                        <span>{response.quoteRequest?.goodsType}</span>
                      </div>
                      <div className="meta-item">
                        <span className="label">Quantity:</span>
                        <span>{response.quoteRequest?.totalQuantity} units</span>
                      </div>
                      <div className="meta-item">
                        <span className="label">Pickup Date:</span>
                        <span>{formatDate(response.quoteRequest?.pickupDate)}</span>
                      </div>
                      <div className="meta-item">
                        <span className="label">Shipment Type:</span>
                        <span>{response.quoteRequest?.shipmentType}</span>
                      </div>
                    </div>
                    
                    <div className="quote-amount">
                      {formatCurrency(response.quoteAmount, response.currency)}
                      <span className="validity">Valid until: {formatDate(response.validity)}</span>
                    </div>
                    
                    <div className="company-info">
                      <span className="company-name">For: {response.quoteRequest?.company?.companyName || "Unknown Company"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Quote Request Modal - FIXED: Added all required fields */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <h2>Create New Quote Request</h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Pickup Location *</label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={newQuoteRequest.pickupLocation}
                  onChange={handleRequestInputChange}
                  placeholder="Enter pickup location"
                  required
                />
              </div>

              <div className="form-group">
                <label>Delivery Location *</label>
                <input
                  type="text"
                  name="deliveryLocation"
                  value={newQuoteRequest.deliveryLocation}
                  onChange={handleRequestInputChange}
                  placeholder="Enter delivery location"
                  required
                />
              </div>

              <div className="form-group">
                <label>Goods Category *</label>
                <select
                  name="goodsCategory"
                  value={newQuoteRequest.goodsCategory}
                  onChange={handleRequestInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Food">Food</option>
                  <option value="Machinery">Machinery</option>
                  <option value="Chemicals">Chemicals</option>
                  <option value="Construction Materials">Construction Materials</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Pharmaceuticals">Pharmaceuticals</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Goods Type *</label>
                <select
                  name="goodsType"
                  value={newQuoteRequest.goodsType}
                  onChange={handleRequestInputChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Perishable">Perishable</option>
                  <option value="Non-Perishable">Non-Perishable</option>
                  <option value="Fragile">Fragile</option>
                  <option value="Hazardous">Hazardous</option>
                  <option value="Temperature Controlled">Temperature Controlled</option>
                  <option value="Oversized">Oversized</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="form-group">
                <label>Packaging Type *</label>
                <select
                  name="packagingType"
                  value={newQuoteRequest.packagingType}
                  onChange={handleRequestInputChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Cartons">Cartons</option>
                  <option value="Pallets">Pallets</option>
                  <option value="Crates">Crates</option>
                  <option value="Drums">Drums</option>
                  <option value="Bags">Bags</option>
                  <option value="Loose">Loose</option>
                  <option value="Container">Container</option>
                </select>
              </div>

              <div className="form-group">
                <label>Total Quantity *</label>
                <input
                  type="number"
                  name="totalQuantity"
                  value={newQuoteRequest.totalQuantity}
                  onChange={handleRequestInputChange}
                  placeholder="Number of units"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Stackable</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="isStackable"
                      value={true}
                      checked={newQuoteRequest.isStackable === true}
                      onChange={handleRequestInputChange}
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="isStackable"
                      value={false}
                      checked={newQuoteRequest.isStackable === false}
                      onChange={handleRequestInputChange}
                    />
                    No
                  </label>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Product Dimensions *</label>
                <div className="dimensions-input">
                  <input
                    type="number"
                    name="productDimensions.length"
                    value={newQuoteRequest.productDimensions.length}
                    onChange={handleRequestInputChange}
                    placeholder="Length"
                    step="0.01"
                    min="0"
                    required
                  />
                  <span>×</span>
                  <input
                    type="number"
                    name="productDimensions.width"
                    value={newQuoteRequest.productDimensions.width}
                    onChange={handleRequestInputChange}
                    placeholder="Width"
                    step="0.01"
                    min="0"
                    required
                  />
                  <span>×</span>
                  <input
                    type="number"
                    name="productDimensions.height"
                    value={newQuoteRequest.productDimensions.height}
                    onChange={handleRequestInputChange}
                    placeholder="Height"
                    step="0.01"
                    min="0"
                    required
                  />
                  <select
                    name="productDimensions.unit"
                    value={newQuoteRequest.productDimensions.unit}
                    onChange={handleRequestInputChange}
                  >
                    <option value="cm">cm</option>
                    <option value="inch">inch</option>
                    <option value="m">m</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Volumetric Weight (kg) *</label>
                <input
                  type="number"
                  name="volumetricWeight"
                  value={newQuoteRequest.volumetricWeight}
                  onChange={handleRequestInputChange}
                  placeholder="Weight in kg"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Pickup Date *</label>
                <input
                  type="date"
                  name="pickupDate"
                  value={newQuoteRequest.pickupDate}
                  onChange={handleRequestInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Shipment Type *</label>
                <select
                  name="shipmentType"
                  value={newQuoteRequest.shipmentType}
                  onChange={handleRequestInputChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Road">Road</option>
                  <option value="Rail">Rail</option>
                  <option value="Air">Air</option>
                  <option value="Sea">Sea</option>
                  <option value="Multimodal">Multimodal</option>
                </select>
              </div>

              <div className="form-group">
                <label>Contact Email *</label>
                <input
                  type="email"
                  name="contact.email"
                  value={newQuoteRequest.contact.email}
                  onChange={handleRequestInputChange}
                  placeholder="Email for contact"
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Mobile *</label>
                <input
                  type="tel"
                  name="contact.mobileNumber"
                  value={newQuoteRequest.contact.mobileNumber}
                  onChange={handleRequestInputChange}
                  placeholder="Mobile number"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Additional Notes</label>
                <textarea
                  name="notes"
                  value={newQuoteRequest.notes}
                  onChange={handleRequestInputChange}
                  placeholder="Any additional information"
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button 
                onClick={createQuoteRequest}
                className="primary"
                disabled={!newQuoteRequest.pickupLocation || !newQuoteRequest.deliveryLocation || !newQuoteRequest.goodsCategory}
              >
                Create Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Respond to Quote Request Modal */}
      {showRespondModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Submit Quote for {selectedRequest.goodsCategory} Shipment</h2>
            <p>{selectedRequest.pickupLocation} → {selectedRequest.deliveryLocation}</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Quote Amount *</label>
                <div className="amount-input">
                  <input
                    type="number"
                    name="quoteAmount"
                    value={newQuoteResponse.quoteAmount}
                    onChange={handleResponseInputChange}
                    placeholder="Amount"
                    step="0.01"
                    min="0"
                    required
                  />
                  <select
                    name="currency"
                    value={newQuoteResponse.currency}
                    onChange={handleResponseInputChange}
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Validity Until *</label>
                <input
                  type="date"
                  name="validity"
                  value={newQuoteResponse.validity}
                  onChange={handleResponseInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Estimated Delivery Days</label>
                <input
                  type="number"
                  name="estimatedDeliveryDays"
                  value={newQuoteResponse.estimatedDeliveryDays}
                  onChange={handleResponseInputChange}
                  placeholder="Days"
                  min="1"
                />
              </div>

              <div className="form-group full-width">
                <label>Terms and Conditions</label>
                <textarea
                  name="termsAndConditions"
                  value={newQuoteResponse.termsAndConditions}
                  onChange={handleResponseInputChange}
                  placeholder="Enter terms and conditions"
                />
              </div>

              <div className="form-group full-width">
                <label>Additional Notes</label>
                <textarea
                  name="notes"
                  value={newQuoteResponse.notes}
                  onChange={handleResponseInputChange}
                  placeholder="Any additional information"
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button onClick={() => {
                setShowRespondModal(false);
                setSelectedRequest(null);
              }}>Cancel</button>
              <button 
                onClick={createQuoteResponse}
                className="primary"
                disabled={!newQuoteResponse.quoteAmount || !newQuoteResponse.validity}
              >
                Submit Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Responses Modal */}
      {showResponsesModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <h2>Quotes for {selectedRequest.goodsCategory} Shipment</h2>
            <p>{selectedRequest.pickupLocation} → {selectedRequest.deliveryLocation}</p>
            
            {loading.quoteResponses ? (
              <div className="loading">Loading quotes...</div>
            ) : quoteResponses.length > 0 ? (
              <div className="quotes-grid">
                {quoteResponses.map(response => (
                  <div key={response._id} className="quote-card">
                    <div className="quote-header">
                      <h3>Quote from {response.responder?.companyName}</h3>
                      <span className={`status-badge status-${response.status}`}>
                                             {response.status}
                    </span>
                  </div>
                  
                  <div className="quote-details">
                    <div className="quote-meta">
                      <div className="meta-item">
                        <span className="label">Quote Amount:</span>
                        <span className="amount">{formatCurrency(response.quoteAmount, response.currency)}</span>
                      </div>
                      <div className="meta-item">
                        <span className="label">Valid Until:</span>
                        <span>{formatDate(response.validity)}</span>
                      </div>
                      <div className="meta-item">
                        <span className="label">Estimated Delivery:</span>
                        <span>{response.estimatedDeliveryDays ? `${response.estimatedDeliveryDays} days` : "N/A"}</span>
                      </div>
                      {response.notes && (
                        <div className="meta-item full-width">
                          <span className="label">Notes:</span>
                          <span>{response.notes}</span>
                        </div>
                      )}
                      {response.termsAndConditions && (
                        <div className="meta-item full-width">
                          <span className="label">Terms:</span>
                          <span>{response.termsAndConditions}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="company-info">
                      <span className="company-name">From: {response.responder?.companyName || "Unknown Transporter"}</span>
                    </div>
                  </div>
                  
                  {response.status === "pending" && selectedRequest.status === "open" && (
                    <div className="quote-actions">
                      <button 
                        className="accept-btn"
                        onClick={() => acceptQuoteResponse(response._id)}
                      >
                        Accept Quote
                      </button>
                    </div>
                  )}
                  
                  {response.status === "accepted" && (
                    <div className="accepted-badge">
                      ✓ Accepted
                    </div>
                  )}
                </div>
              ))}
            </div>
            ) : (
              <div className="empty-state">
                <h3>No quotes received yet</h3>
                <p>Your request hasn't received any quotes from transporters yet.</p>
              </div>
            )}
            
            <div className="modal-actions">
              <button onClick={() => {
                setShowResponsesModal(false);
                setSelectedRequest(null);
              }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quote;