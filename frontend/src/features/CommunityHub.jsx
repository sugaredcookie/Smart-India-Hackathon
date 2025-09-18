import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CommunityHub.css";

const CommunityHub = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState({
    communities: true,
    messages: false,
    sending: false,
    requests: false
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [pendingCommunity, setPendingCommunity] = useState(null);
  const [joinRequest, setJoinRequest] = useState({
    name: "",
    role: "",
    reason: ""
  });
  const [adminView, setAdminView] = useState(false);
  const [communityRequests, setCommunityRequests] = useState([]);
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    isPublic: true
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Get API URL safely
  const getApiUrl = () => {
    if (window._env_ && window._env_.REACT_APP_API_URL) {
      return window._env_.REACT_APP_API_URL;
    }
    return "http://localhost:5000";
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get current user info
  useEffect(() => {
    const getCurrentUser = () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return null;
        }

        // Try to get user info from token or localStorage
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const user = {
              _id: payload.id || `user-${Date.now()}`,
              companyName: payload.companyName || "User",
              email: payload.email || "user@example.com",
              role: payload.role || "user"
            };
            localStorage.setItem("user", JSON.stringify(user));
            return user;
          }
        } catch (decodeError) {
          console.log("Could not decode token");
        }

        // Check localStorage for existing user
        const savedUser = localStorage.getItem("user");
        if (savedUser && savedUser !== "undefined") {
          return JSON.parse(savedUser);
        }

        // Final fallback
        const demoUser = {
          _id: `user-${Date.now()}`,
          companyName: "Demo User",
          email: "demo@example.com",
          role: "user"
        };
        localStorage.setItem("user", JSON.stringify(demoUser));
        return demoUser;

      } catch (error) {
        console.error("Error getting user:", error);
        navigate("/login");
        return null;
      }
    };

    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      
      // Configure axios
      const token = localStorage.getItem("token");
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        axios.defaults.baseURL = getApiUrl();
      }
    }
  }, [navigate]);

  // Check if user is member of community
  const isUserMember = (community) => {
    if (!currentUser || !community.members) return false;
    return community.members.some(member => {
      const memberUserId = member.user?._id || member.user;
      return memberUserId === currentUser._id;
    });
  };

  // Check if user is the creator of the community
  const isUserCreator = (community) => {
    if (!currentUser || !community.createdBy) return false;
    const creatorId = community.createdBy._id || community.createdBy;
    return creatorId === currentUser._id;
  };

  // Check if user has a pending request
  const hasPendingRequest = (community) => {
    if (!currentUser || !community.joinRequests) return false;
    return community.joinRequests.some(request => {
      const requestUserId = request.user?._id || request.user;
      return requestUserId === currentUser._id && request.status === "pending";
    });
  };

  // Load communities
  const fetchCommunities = async () => {
    try {
      setLoading(prev => ({ ...prev, communities: true }));
      const response = await axios.get("/api/community");
      setCommunities(response.data.data.communities);
      
      // Auto-select first community if user is member or creator
      const userCommunities = response.data.data.communities.filter(community => 
        isUserMember(community) || isUserCreator(community)
      );
      if (userCommunities.length > 0 && !selectedCommunity) {
        setSelectedCommunity(userCommunities[0]);
      }
    } catch (error) {
      console.error("Error loading communities:", error);
      setError("Failed to load communities. Please check your connection.");
    } finally {
      setLoading(prev => ({ ...prev, communities: false }));
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchCommunities();
    }
  }, [currentUser]);

  // Load messages for selected community
  useEffect(() => {
    if (!selectedCommunity) return;
    
    const fetchMessages = async () => {
      try {
        setLoading(prev => ({ ...prev, messages: true }));
        const response = await axios.get(`/api/community/${selectedCommunity._id}/messages`);
        setMessages(response.data.data.messages || []);
      } catch (error) {
        console.error("Error loading messages:", error);
        setMessages([]);
      } finally {
        setLoading(prev => ({ ...prev, messages: false }));
      }
    };

    fetchMessages();
    
    // Refresh messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedCommunity]);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedCommunity || !currentUser) return;
    
    try {
      // Create optimistic UI update
      const tempMessage = {
        _id: Date.now().toString(),
        sender: { _id: currentUser._id, companyName: currentUser.companyName || "You" },
        content: message,
        createdAt: new Date(),
        isTemp: true
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setMessage("");
      setLoading(prev => ({ ...prev, sending: true }));
      
      await axios.post(`/api/community/${selectedCommunity._id}/messages`, {
        content: message
      });
      
      // Remove temp message (real one will come via refresh)
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => !msg.isTemp));
      }, 1000);
      
    } catch (error) {
      console.error("Failed to send message:", error);
      setError("Failed to send message. Please try again.");
      // Remove the temporary message on error
      setMessages(prev => prev.filter(msg => !msg.isTemp));
    } finally {
      setLoading(prev => ({ ...prev, sending: false }));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Open join request modal
  const openJoinModal = (community, e) => {
    if (e) e.stopPropagation();
    setPendingCommunity(community);
    setJoinRequest({
      name: currentUser.companyName || "",
      role: currentUser.role || "",
      reason: ""
    });
    setShowJoinModal(true);
  };

  // Submit join request
  const submitJoinRequest = async () => {
    if (!pendingCommunity) return;
    
    try {
      await axios.post(`/api/community/${pendingCommunity._id}/join-request`, joinRequest);
      
      setShowJoinModal(false);
      setSuccess("Join request sent! The community admin will review your request.");
      setTimeout(() => setSuccess(null), 5000);
      fetchCommunities(); // Refresh communities list
    } catch (error) {
      console.error("Failed to send join request:", error);
      setError("Failed to send join request. Please try again.");
    }
  };

  // Load join requests for admin view
  const loadJoinRequests = async (communityId) => {
    try {
      setLoading(prev => ({ ...prev, requests: true }));
      const response = await axios.get(`/api/community/${communityId}/join-requests`);
      setCommunityRequests(response.data.data.joinRequests);
    } catch (error) {
      console.error("Failed to load join requests:", error);
      setError("Failed to load join requests.");
    } finally {
      setLoading(prev => ({ ...prev, requests: false }));
    }
  };

  // Process join request (approve/reject)
  const processJoinRequest = async (communityId, requestId, action) => {
    try {
      await axios.post(
        `/api/community/${communityId}/join-requests/${requestId}/process`,
        { action }
      );
      
      setSuccess(`Join request ${action === "approve" ? "approved" : "rejected"} successfully`);
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh data
      loadJoinRequests(communityId);
      fetchCommunities();
    } catch (error) {
      console.error("Failed to process join request:", error);
      setError("Failed to process join request.");
    }
  };

  // Toggle admin view
  const toggleAdminView = () => {
    if (selectedCommunity && isUserCreator(selectedCommunity)) {
      setAdminView(!adminView);
      if (!adminView) {
        loadJoinRequests(selectedCommunity._id);
      }
    }
  };

  // Create new community
  const createCommunity = async () => {
    try {
      await axios.post("/api/community", newCommunity);
      setShowCreateModal(false);
      setNewCommunity({ name: "", description: "", isPublic: true });
      setSuccess("Community created successfully!");
      setTimeout(() => setSuccess(null), 3000);
      fetchCommunities(); // Refresh communities list
    } catch (error) {
      console.error("Failed to create community:", error);
      setError("Failed to create community. Please try again.");
    }
  };

  // Format message time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Toggle sidebar visibility on mobile
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // If no current user, show loading
  if (!currentUser) {
    return (
      <div className="community-hub">
        <div className="loading-fullscreen">
          <div className="loading-spinner"></div>
          <p>Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`community-hub ${darkMode ? "dark" : "light"}`}>
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      {success && (
        <div className="success-banner">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      <div className="community-container">
        {/* Mobile Toggle Button */}
        <button className="mobile-toggle-btn" onClick={toggleSidebar}>
          {sidebarVisible ? "✕" : "☰"}
        </button>

        {/* Sidebar */}
        <div className={`community-sidebar ${sidebarVisible ? "visible" : ""}`}>
          <div className="sidebar-header">
            <h2>💬 Nilara Community</h2>
            <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "🌙" : "☀️"}
            </button>
          </div>

          <div className="communities-list">
            <div className="communities-header">
              <h3>Communities</h3>
              <button 
                className="create-community-btn"
                onClick={() => setShowCreateModal(true)}
                title="Create New Community"
              >
                +
              </button>
            </div>
            
            {loading.communities ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading communities...</p>
              </div>
            ) : communities.length === 0 ? (
              <div className="empty-state">
                <p>No communities yet</p>
                <button 
                  className="create-btn"
                  onClick={() => setShowCreateModal(true)}
                >
                  Create Your First Community
                </button>
              </div>
            ) : (
              communities.map(community => (
                <div 
                  key={community._id}
                  className={`community-item ${selectedCommunity?._id === community._id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedCommunity(community);
                    if (window.innerWidth <= 768) setSidebarVisible(false);
                  }}
                >
                  <div className="community-avatar">
                    {community.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="community-info">
                    <h4>{community.name}</h4>
                    <p>{community.members?.length || 0} members</p>
                    {isUserCreator(community) && (
                      <span className="creator-badge">Creator</span>
                    )}
                    {hasPendingRequest(community) && (
                      <span className="pending-badge">Request Pending</span>
                    )}
                  </div>
                  {/* Show Join button ONLY if user is NOT a member AND NOT the creator AND no pending request */}
                  {!isUserMember(community) && !isUserCreator(community) && !hasPendingRequest(community) && (
                    <button 
                      className="join-btn"
                      onClick={(e) => openJoinModal(community, e)}
                    >
                      Join
                    </button>
                  )}
                  {/* Show Admin badge if user is creator */}
                  {isUserCreator(community) && (
                    <span className="admin-badge">Admin</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        {selectedCommunity ? (
          <div className="chat-area">
            <div className="chat-header">
              <div className="channel-info">
                <button className="back-to-communities" onClick={() => setSelectedCommunity(null)}>
                  ←
                </button>
                <div>
                  <h3>{selectedCommunity.name}</h3>
                  <p>{selectedCommunity.description}</p>
                  {isUserCreator(selectedCommunity) && (
                    <div>
                      <span className="you-created-badge">You created this community</span>
                      <button 
                        className="admin-view-btn"
                        onClick={toggleAdminView}
                      >
                        {adminView ? "Hide Requests" : "View Requests"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="chat-actions">
                <button className="action-btn">📌</button>
                <button className="action-btn">👥</button>
              </div>
            </div>

            <div className="messages-container">
              {loading.messages ? (
                <div className="loading">
                  <div className="loading-spinner"></div>
                  <p>Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="empty-state">
                  <h3>No messages yet</h3>
                  <p>Be the first to start the conversation!</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isCurrentUser = msg.sender?._id === currentUser._id;
                  return (
                    <div 
                      key={msg._id} 
                      className={`message ${isCurrentUser ? "current-user" : ""}`}
                    >
                      {!isCurrentUser && (
                        <div className="message-avatar">
                          {msg.sender?.companyName?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <div className="message-content">
                        <div className="message-header">
                          <span className="sender-name">{msg.sender?.companyName || "Unknown"}</span>
                          <span className="message-time">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                        <p>{msg.content}</p>
                      </div>
                      {isCurrentUser && (
                        <div className="message-avatar">
                          {msg.sender?.companyName?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-container">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message in ${selectedCommunity.name}`}
                disabled={loading.sending}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!message.trim() || loading.sending}
                className="send-button"
              >
                {loading.sending ? (
                  <div className="button-spinner"></div>
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="chat-placeholder">
            <div className="placeholder-content">
              <h2>Welcome to Nilara Community!</h2>
              <p>Select a community from the sidebar to start chatting</p>
              {communities.length === 0 && (
                <p>No communities yet. Create your first one to get started!</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Community</h2>
            <div className="form-group">
              <label>Community Name</label>
              <input
                type="text"
                value={newCommunity.name}
                onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                placeholder="Enter community name"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newCommunity.description}
                onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
                placeholder="Enter community description"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={newCommunity.isPublic}
                  onChange={(e) => setNewCommunity({...newCommunity, isPublic: e.target.checked})}
                />
                Public Community
              </label>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button 
                onClick={createCommunity}
                disabled={!newCommunity.name.trim()}
                className="primary"
              >
                Create Community
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Request Modal */}
      {showJoinModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Request to Join {pendingCommunity?.name}</h2>
            <p className="modal-description">Tell the community admin about yourself and why you want to join</p>
            
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                value={joinRequest.name}
                onChange={(e) => setJoinRequest({...joinRequest, name: e.target.value})}
                placeholder="Enter your name"
              />
            </div>
            
            <div className="form-group">
              <label>Your Role</label>
              <input
                type="text"
                value={joinRequest.role}
                onChange={(e) => setJoinRequest({...joinRequest, role: e.target.value})}
                placeholder="E.g. Logistics Manager, Freight Forwarder, etc."
              />
            </div>
            
            <div className="form-group">
              <label>Why do you want to join?</label>
              <textarea
                value={joinRequest.reason}
                onChange={(e) => setJoinRequest({...joinRequest, reason: e.target.value})}
                placeholder="Tell the community admin why you want to join and how you can contribute..."
                rows="4"
              />
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setShowJoinModal(false)}>Cancel</button>
              <button 
                onClick={submitJoinRequest}
                disabled={!joinRequest.name.trim() || !joinRequest.reason.trim()}
                className="primary"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin View for Join Requests */}
      {adminView && isUserCreator(selectedCommunity) && (
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h3>Join Requests for {selectedCommunity.name}</h3>
            <button onClick={toggleAdminView}>Close</button>
          </div>
          <div className="requests-list">
            {loading.requests ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading requests...</p>
              </div>
            ) : communityRequests.length === 0 ? (
              <p className="no-requests">No pending join requests</p>
            ) : (
              communityRequests.map(request => (
                <div key={request._id} className="request-item">
                  <div className="request-info">
                    <h4>{request.name}</h4>
                    <p><strong>Role:</strong> {request.role}</p>
                    <p><strong>Reason:</strong> {request.reason}</p>
                    <p><strong>Status:</strong> <span className={`status-${request.status}`}>{request.status}</span></p>
                    <p><strong>Requested:</strong> {new Date(request.requestedAt).toLocaleDateString()}</p>
                  </div>
                  {request.status === "pending" && (
                    <div className="request-actions">
                      <button 
                        onClick={() => processJoinRequest(selectedCommunity._id, request._id, "approve")}
                        className="approve-btn"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => processJoinRequest(selectedCommunity._id, request._id, "reject")}
                        className="reject-btn"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityHub;