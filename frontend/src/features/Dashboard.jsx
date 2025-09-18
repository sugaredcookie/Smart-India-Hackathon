import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const canvasRef = useRef(null);

  useEffect(() => {
    initParticles();
  }, [darkMode]);

  const handleBackClick = () => {
    if (adminView) {
      setAdminView(false);
    } else if (selectedCommunity) {
      setSelectedCommunity(null);
    } else {
      navigate(-1);
    }
  };  

  const initParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 80;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.8 - 0.4;
        this.speedY = Math.random() * 0.8 - 0.4;
        this.color = darkMode ? 'rgba(60, 207, 189, 0.6)' : 'rgba(60, 207, 189, 0.4)';
        this.alpha = Math.random() * 0.5 + 0.3;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
      }
      
      draw() {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = darkMode ? `rgba(60, 207, 189, ${0.2 - distance/600})` : `rgba(60, 207, 189, ${0.1 - distance/1200})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  };

  return (
    <div className={`dashboard ${darkMode ? "dark" : "light"}`}>


      <canvas 
        ref={canvasRef} 
        className="particles-background"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">
              <span className="title-icon">🚚</span>
              Nilara Dashboard
            </h1>
            <p className="dashboard-subtitle">Your logistics management hub</p>
          </div>
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "🌙" : "☀️"}
          </button>
        </div>

        <div className="dashboard-welcome">
          <h2>Welcome back to Nilara! 👋</h2>
          <p>Your logistics management hub for seamless operations and optimized shipping</p>
        </div>

        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>24</h3>
              <p>Active Shipments</p>
              <span className="stat-trend">↑ 12% this week</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>₹1,42,800</h3>
              <p>Monthly Savings</p>
              <span className="stat-trend">↑ 8% from last month</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <h3>98.7%</h3>
              <p>On-time Delivery</p>
              <span className="stat-trend">↑ 2.3% this quarter</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🤝</div>
            <div className="stat-content">
              <h3>12</h3>
              <p>New Partners</p>
              <span className="stat-trend">3 awaiting approval</span>
            </div>
          </div>
        </div>

        <div className="dashboard-main">
          <div className="features-container">
            <h2 className="section-title">Platform Features</h2>
            <div className="features-grid">
              <div
                className="feature-card"
                onClick={() => navigate("/community-hub")}
              >
                <div className="feature-icon">💬</div>
                <h3>Nilara Hub</h3>
                <p>Chat in real-time with other transporters, forwarders & SMEs.</p>
                <div className="feature-cta">Connect Now →</div>
              </div>

              <div
                className="feature-card"
                onClick={() => navigate("/quote")}
              >
                <div className="feature-icon">📈</div>
                <h3>Request Quote</h3>
                <p>Find the best rates for your shipments with our quotation system.</p>
                <div className="feature-cta">Get Quotes →</div>
              </div>

              <div
                className="feature-card"
                onClick={() => navigate("/fms")}
              >
                <div className="feature-icon">📦</div>
                <h3>Freight Management</h3>
                <p>Manage all your shipments in one place with our FMS solution.</p>
                <div className="feature-badge">Coming Soon</div>
              </div>

              <div
                className="feature-card"
                onClick={() => navigate("/analytics")}
              >
                <div className="feature-icon">📊</div>
                <h3>Bidding Platform</h3>
                <p>Find the best rates with our bidding system.</p>
                <div className="feature-badge">Coming Soon</div>
              </div>

              <div
                className="feature-card"
                onClick={() => navigate("/iot-tracking")}
              >
                <div className="feature-icon">🌐</div>
                <h3>IoT Tracking</h3>
                <p>Real-time tracking of your shipments with our IoT solutions.</p>
                <div className="feature-badge">Coming Soon</div>
              </div>

              <div
                className="feature-card"
                onClick={() => navigate("/documents")}
              >
                <div className="feature-icon">📄</div>
                <h3>Document Management</h3>
                <p>Store and manage all your logistics documents securely.</p>
                <div className="feature-badge">Coming Soon</div>
              </div>
            </div>
          </div>

          <div className="dashboard-sidebar">
            <div className="recent-activity">
              <div className="section-header">
                <h3>Recent Activity</h3>
                <span className="view-all">View All</span>
              </div>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon">🚛</div>
                  <div className="activity-content">
                    <p>New bid received for Mumbai-Delhi route</p>
                    <span>10 minutes ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">📦</div>
                  <div className="activity-content">
                    <p>Shipment #4563 has been delivered</p>
                    <span>2 hours ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">🤝</div>
                  <div className="activity-content">
                    <p>New connection request from ABC Logistics</p>
                    <span>5 hours ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">💰</div>
                  <div className="activity-content">
                    <p>Payment received for Invoice #7892</p>
                    <span>1 day ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button className="action-btn">
                  <span className="action-icon">➕</span>
                  Create Shipment
                </button>
                <button className="action-btn">
                  <span className="action-icon">💰</span>
                  Post a Bid
                </button>
                <button className="action-btn">
                  <span className="action-icon">👥</span>
                  Invite Partner
                </button>
                <button className="action-btn">
                  <span className="action-icon">📊</span>
                  Generate Report
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;