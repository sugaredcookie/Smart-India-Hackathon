import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import logo from '../assets/logo.png';
import { 
  FaComments,
  FaChartLine,
  FaBox,
  FaBolt,
  FaGlobe,
  FaFileAlt,
  FaTruck,
  FaMoneyBillWave,
  FaCog,
  FaSignOutAlt,
  FaArrowRight,
  FaChartBar,
  FaUsers,
  FaClock,
  FaStar
} from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(null);
  const canvasRef = useRef(null);

  // Particles animation effect
  useEffect(() => {
    initParticles();
  }, []);

  const initParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 50;
    
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
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = 'rgba(42, 157, 143, 0.1)';
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > canvas.width || this.x < 0) {
          this.speedX = -this.speedX;
        }
        if (this.y > canvas.height || this.y < 0) {
          this.speedY = -this.speedY;
        }
      }
      
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
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
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(42, 157, 143, 0.05)';
            ctx.lineWidth = 0.5;
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

  const features = [
    {
      id: 1,
      icon: <FaComments />,
      title: "Nilara Hub",
      description: "Connect and collaborate with logistics partners in real-time",
      path: "/community-hub",
      status: "active"
    },
    {
      id: 2,
      icon: <FaChartLine />,
      title: "Request Quote",
      description: "Get competitive pricing for your shipments instantly",
      path: "/quote",
      status: "active"
    },
    {
      id: 3,
      icon: <FaBox />,
      title: "Freight Management",
      description: "End-to-end shipment tracking and management system",
      path: "/fms",
      status: "soon"
    },
    {
      id: 4,
      icon: <FaBolt />,
      title: "Bidding Platform",
      description: "Optimize costs with our competitive bidding system",
      path: "/analytics",
      status: "soon"
    },
    {
      id: 5,
      icon: <FaGlobe />,
      title: "IoT Tracking",
      description: "Real-time GPS and sensor-based shipment monitoring",
      path: "/iot-tracking",
      status: "soon"
    },
    {
      id: 6,
      icon: <FaFileAlt />,
      title: "Document Management",
      description: "Secure digital documentation and compliance tracking",
      path: "/documents",
      status: "soon"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "quote",
      message: "New quote request for Delhi-Mumbai route",
      time: "10 min ago",
      icon: <FaChartBar />
    },
    {
      id: 2,
      type: "shipment",
      message: "Shipment #DL-7842 reached distribution center",
      time: "2 hours ago",
      icon: <FaTruck />
    },
    {
      id: 3,
      type: "payment",
      message: "Payment confirmed for invoice #INV-4591",
      time: "5 hours ago",
      icon: <FaMoneyBillWave />
    },
    {
      id: 4,
      type: "system",
      message: "System maintenance completed successfully",
      time: "1 day ago",
      icon: <FaCog />
    }
  ];

  return (
    <div className="dashboard">
      {/* Particles Background */}
      <canvas 
        ref={canvasRef} 
        className="particles-background"
      />
      
      {/* Background Elements */}
      <div className="background-elements">
        <div className="bg-element-1"></div>
        <div className="bg-element-2"></div>
        <div className="bg-element-3"></div>
      </div>

      {/* Fixed Navigation Bar */}
      <nav className="dashboard-nav">
        <div className="nav-container">
          <div className="logo">
            <img 
              src={logo}
              alt="Nilara Logo" 
              className="logo-image"
            />
            <span className="logo-text">NILARA</span>
          </div>
          <div className="nav-actions">
            <button className="nav-btn logout" onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
            }}>
              <FaSignOutAlt className="nav-btn-icon" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Improved Header Section */}
          <header className="dashboard-header">
            <div className="header-content">
              <div className="welcome-section">
                <h1 className="welcome-title">Welcome Back</h1>
                <p className="welcome-subtitle">
                  Manage your logistics operations efficiently with our integrated platform
                </p>
              </div>
              
              <div className="stats-overview">
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaBox />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">24</div>
                    <div className="stat-label">Active Shipments</div>
                    <div className="stat-trend positive">+12% this week</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaClock />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">10</div>
                    <div className="stat-label">Scheduled Shipments</div>
                    <div className="stat-trend positive">+2.3% this month</div>
                  </div>
                </div>
                
                <div className="stat-card"> 
                  <div className="stat-icon">
                    <FaStar />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">4.4/5</div>
                    <div className="stat-label">Reliability Score of Carriers</div>
                    <div className="stat-trend positive">+8% from last month</div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Features Grid */}
          <section className="features-section">
            <h2 className="section-title">Platform Features</h2>
            <div className="features-grid">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className={`feature-card ${feature.status === 'active' ? 'feature-active' : 'feature-coming'} ${activeFeature === feature.id ? 'feature-active' : ''}`}
                  onClick={() => feature.status === 'active' && navigate(feature.path)}
                  onMouseEnter={() => setActiveFeature(feature.id)}
                  onMouseLeave={() => setActiveFeature(null)}
                >
                  <div className="feature-header">
                    <div className="feature-icon">{feature.icon}</div>
                    {feature.status === 'soon' && (
                      <span className="feature-badge">Coming Soon</span>
                    )}
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                  {feature.status === 'active' && (
                    <div className="feature-cta">
                      <span>Explore</span>
                      <FaArrowRight className="cta-arrow" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Activity Sidebar */}
          <aside className="dashboard-sidebar">
            {/* Uncomment if you want to show recent activities */}
            {/* <div className="activity-panel">
              <div className="panel-header">
                <h3 className="panel-title">Recent Activity</h3>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="activity-list">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">{activity.icon}</div>
                    <div className="activity-content">
                      <p className="activity-message">{activity.message}</p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}

            <div className="quick-actions-panel">
              <h3 className="panel-title">Quick Actions</h3>
              <div className="action-buttons">
                <button 
                  className="action-btn primary-action"
                  onClick={() => navigate('/quote')}
                >
                  <span className="action-icon">
                    <FaChartLine />
                  </span>
                  Request Quote
                </button>
                <button 
                  className="action-btn secondary-action"
                  onClick={() => navigate('/community-hub')}
                >
                  <span className="action-icon">
                    <FaComments />
                  </span>
                  Open Hub
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;