import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import logo from '../assets/logo.png'
import { 
  FaTwitter, 
  FaLinkedin, 
  FaFacebook, 
  FaInstagram, 
  FaGithub,
  FaBox,
  FaSearch,
  FaChartLine,
  FaGlobe,
  FaBolt,
  FaHandshake,
  FaBriefcase,
  FaUsers,
  FaChartBar,
  FaNetworkWired,
  FaShieldAlt,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaArrowUp,
  FaUserPlus,
  FaLink,
  FaUsersCog,
  FaRocket
} from 'react-icons/fa';

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [contactAlert, setContactAlert] = useState({ show: false, message: "", type: "" });
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [betaForm, setBetaForm] = useState({ email: ""});
  const [betaAlert, setBetaAlert] = useState({ show: false, message: "", type: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        setIsLoggedIn(true);
        try {
          const userData = JSON.parse(user);
          setUserName(userData.companyName || userData.email || 'User');
        } catch (error) {
          console.error('Error parsing user data:', error);
          setUserName('User');
        }
      } else {
        setIsLoggedIn(false);
        setUserName('');
      }
    };

    checkAuthStatus();

    document.body.classList.add('light-mode');

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsVisible(scrollTop > 100);
      
      const sections = document.querySelectorAll('.section');
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollTop > sectionTop - window.innerHeight / 1.3) {
          section.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserName('');
    navigate('/');
    window.location.reload();
  };

  const redirectToSignup = function() {
    navigate('/signup');
  }

  const redirectToLogin = function() {
    navigate('/login');
  }

  const redirectToDashboard = function() {
    navigate('/dashboard');
  }

  const redirectToCommunityHub = function() {
    navigate('/community-hub');
  }

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitBeta = async (e) => {
    e.preventDefault();
    const { email } = betaForm;

    if (!email) {
        setBetaAlert({
        show: true,
        message: "Please fill in the email",
        type: "error"
        });
        setTimeout(() => {
        setBetaAlert({ show: false, message: "", type: "" })
        }, 3000);
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setBetaAlert({
        show: true,
        message: "Please enter a valid email address",
        type: "error"
        });
        setTimeout(() => setBetaAlert({ show: false, message: "", type: "" }), 3000);
        return;
    }

    try {
        setBetaAlert({
        show: true,
        message: "Signing you up for beta access...",
        type: "info"
        });

        const response = await fetch('https://smart-india-hackathon-816r.onrender.com/api/beta', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
        });

        if (response.ok) {
        const result = await response.json();
        setBetaAlert({
            show: true,
            message: result.message || "Successfully signed up for beta testing!",
            type: "success"
        });
        
        setBetaForm({ email: "" });
        } else {
        const errorData = await response.json().catch(() => ({}));
        setBetaAlert({
            show: true,
            message: errorData.message || "Failed to sign up for beta. Please try again.",
            type: "error"
        });
        }
        
        setTimeout(() => setBetaAlert({ show: false, message: "", type: "" }), 5000);
    } catch (err) {
        console.log("Error occurred", err);
        setBetaAlert({
        show: true,
        message: "Cannot connect to server. Please check if your backend server is running on port 5000.",
        type: "error"
        });
        setTimeout(() => setBetaAlert({ show: false, message: "", type: "" }), 5000);
    }
    };

  const handleSubmitContact = async (e) => {
    e.preventDefault();
    const { name, email, message } = contactForm;

    if (!name || !email || !message) {
      setContactAlert({
        show: true,
        message: "Please fill in all fields",
        type: "error"
      });
      setTimeout(() => setContactAlert({ show: false, message: "", type: "" }), 3000);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setContactAlert({
        show: true,
        message: "Please enter a valid email address",
        type: "error"
      });
      setTimeout(() => setContactAlert({ show: false, message: "", type: "" }), 3000);
      return;
    }

    try {
      setContactAlert({
        show: true,
        message: "Sending your message...",
        type: "info"
      });

      const response = await fetch('https://smart-india-hackathon-816r.onrender.com/api/contact', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, message })
      });

      if (response.ok) {
        const result = await response.json();
        setContactAlert({
          show: true,
          message: result.message || "Message sent successfully! We'll get back to you soon.",
          type: "success"
        });
        
        setContactForm({ name: "", email: "", message: "" });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setContactAlert({
          show: true,
          message: errorData.message || "Failed to send message. Please try again.",
          type: "error"
        });
      }
      
      setTimeout(() => setContactAlert({ show: false, message: "", type: "" }), 5000);
    } catch (err) {
      console.log("Error occurred", err);
      setContactAlert({
        show: true,
        message: "Cannot connect to server. Please check if your backend server is running on port 5000.",
        type: "error"
      });
      setTimeout(() => setContactAlert({ show: false, message: "", type: "" }), 5000);
    }
  };

  return (
    <div className="landing-container light-mode">
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
      {contactAlert.show && (
        <div className={`alert ${contactAlert.type}`}>
          {contactAlert.message}
          <button onClick={() => setContactAlert({ show: false, message: "", type: "" })}>×</button>
        </div>
      )}
      <nav className={`navbar ${isVisible ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="logo">
            <img 
              src={logo}
              alt="Nilara Logo" 
              className="logo-image"
            />
            <span className="logo-text">NILARA</span>
          </div>
          <div className="nav-links">
            <a href="#vision">Vision</a>
            <a href="#problem">Problem</a>
            <a href="#solution">Solution</a>
            <a href="#features">Features</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="nav-buttons">
            {isLoggedIn ? (
              <div className="user-menu">
                <span className="welcome-text">Welcome, {userName}</span>
                <button onClick={redirectToDashboard} className="dashboard-btn">Dashboard</button>
                {/* <button onClick={redirectToCommunityHub} className="community-btn">Community</button> */}
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            ) : (
              <>
                <button onClick={redirectToLogin} className="login-btn">Log In</button>
                <button onClick={redirectToSignup} className="demo-btn">Sign Up</button>
              </>
            )}
          </div>
        </div>
      </nav>
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Revolutionizing Indian Logistics</h1>
              <p className="hero-description">
                Nilara connects manufacturers, freight forwarders, and transporters on a single, 
                super-connected platform. Simple. Transparent. Efficient.
              </p>
              <div className="hero-buttons">
                {isLoggedIn ? (
                  <>
                    <button onClick={redirectToDashboard} className="cta-btn primary">Go to Dashboard</button>
                    <button onClick={redirectToCommunityHub} className="cta-btn secondary">Explore Community</button>
                  </>
                ) : (
                  <>
                    <button onClick={redirectToSignup} className="cta-btn primary">Get Started</button>
                  </>
                )}
              </div>
              <div className="stats">
                <div className="stat">
                  <span className="stat-number">50+</span>
                  <span className="stat-label">Early Partners</span>
                </div>
                <div className="stat">
                  <span className="stat-number">40%</span>
                  <span className="stat-label">Avg. Cost Savings</span>
                </div>
                <div className="stat">
                  <span className="stat-number">99.5%</span>
                  <span className="stat-label">Uptime</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="floating-card card-1">
                <FaBox className="floating-card-icon" />
                <p>Seamless Freight Management</p>
              </div>
              <div className="floating-card card-2">
                <FaSearch className="floating-card-icon" />
                <p>Transparent Bidding</p>
              </div>
              <div className="floating-card card-3">
                <FaChartLine className="floating-card-icon" />
                <p>Real-time Analytics</p>
              </div>
              <div className="main-visual">
                <div className="network-animation">
                  <div className="node"></div>
                  <div className="node"></div>
                  <div className="node"></div>
                  <div className="node"></div>
                  <div className="connecting-lines"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hero-background-elements">
          <div className="bg-element-1"></div>
          <div className="bg-element-2"></div>
          <div className="bg-element-3"></div>
        </div>
      </section>
      <section className="section vision" id="vision">
        <div className="section-container">
          <h2 className="section-title">Our Vision</h2>
          <p className="section-description">
            At Nilara, we are building the future of Indian logistics by democratizing technology. 
            Our platform enables SMEs, MSMEs, and enterprises to connect seamlessly, reduce costs, 
            and scale faster than ever before.
          </p>
          <div className="vision-cards">
            <div className="vision-card">
              <div className="vision-icon">
                <FaGlobe />
              </div>
              <h3>Democratize Access</h3>
              <p>Making logistics technology accessible to businesses of all sizes</p>
            </div>
            <div className="vision-card">
              <div className="vision-icon">
                <FaBolt />
              </div>
              <h3>Increase Efficiency</h3>
              <p>Reducing delays and operational costs across the supply chain</p>
            </div>
            <div className="vision-card">
              <div className="vision-icon">
                <FaHandshake />
              </div>
              <h3>Create Connections</h3>
              <p>Building a network that connects all players in the logistics ecosystem</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section problem" id="problem">
        <div className="section-container">
          <h2 className="section-title">The Challenges We Solve</h2>
          <div className="problem-grid">
            <div className="problem-item">
              <div className="problem-number">01</div>
              <h3>Extreme Reliance on Middlemen</h3>
              <p>Driving costs up and creating inefficiencies in the supply chain</p>
            </div>
            <div className="problem-item">
              <div className="problem-number">02</div>
              <h3>No Organized Digital Network</h3>
              <p>Transporters & forwarders operate in silos with minimal connectivity</p>
            </div>
            <div className="problem-item">
              <div className="problem-number">03</div>
              <h3>SMEs Locked Out of Platforms</h3>
              <p>Existing solutions have strict compliance that excludes smaller businesses</p>
            </div>
            <div className="problem-item">
              <div className="problem-number">04</div>
              <h3>Lack of Affordable Technology</h3>
              <p>Current logistics software is too expensive and complex for MSMEs</p>
            </div>
          </div>
        </div>
      </section>
      <section className="section solution" id="solution">
        <div className="section-container">
          <h2 className="section-title">The Nilara Solution</h2>
          <p className="section-description">
            We're building an all-in-one platform that addresses the core challenges in Indian logistics
          </p>
          <div className="solution-cards">
            <div className="solution-card">
              <div className="solution-image">
                <div className="solution-icon">
                  <FaBriefcase />
                </div>
              </div>
              <h3>Online Networking Platform</h3>
              <p>Connect freight forwarders, transporters, and manufacturers in a collaborative ecosystem</p>
            </div>
            <div className="solution-card">
              <div className="solution-image">
                <div className="solution-icon">
                  <FaUsers />
                </div>
              </div>
              <h3>Coworking Space</h3>
              <p>A collaborative environment to foster partnerships and knowledge sharing</p>
            </div>
            <div className="solution-card">
              <div className="solution-image">
                <div className="solution-icon">
                  <FaChartBar />
                </div>
              </div>
              <h3>Bidding Platform</h3>
              <p>Enables direct interaction between freight forwarders and transporters</p>
            </div>
            <div className="solution-card">
              <div className="solution-image">
                <div className="solution-icon">
                  <FaChartLine />
                </div>
              </div>
              <h3>FMS & TMS Solutions</h3>
              <p>Tiered packages ensuring MSMEs can integrate seamlessly without long transitions</p>
            </div>
            <div className="solution-card">
              <div className="solution-image">
                <div className="solution-icon">
                  <FaNetworkWired />
                </div>
              </div>
              <h3>IoT Integration</h3>
              <p>Smart solutions for freight warehousing and transport management</p>
            </div>
            <div className="solution-card">
              <div className="solution-image">
                <div className="solution-icon">
                  <FaShieldAlt />
                </div>
              </div>
              <h3>Secure Ecosystem</h3>
              <p>Built with trust and transparency at the core of all transactions</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section features" id="features">
        <div className="section-container">
          <h2 className="section-title">How Nilara Works</h2>
          <div className="features-process">
            <div className="process-step">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Create your company profile in minutes</p>
            </div>
            <div className="process-connector"></div>
            <div className="process-step">
              <div className="step-number">2</div>
              <h3>Connect</h3>
              <p>Find and connect with logistics partners</p>
            </div>
            <div className="process-connector"></div>
            <div className="process-step">
              <div className="step-number">3</div>
              <h3>Collaborate</h3>
              <p>Use our tools to manage shipments and bids</p>
            </div>
            <div className="process-connector"></div>
            <div className="process-step">
              <div className="step-number">4</div>
              <h3>Grow</h3>
              <p>Scale your business with our analytics and insights</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to Transform Your Logistics?</h2>
          <p>Join the growing network of logistics professionals using Nilara</p>
          <div className="cta-buttons">
            {isLoggedIn ? (
              <>
                <button onClick={redirectToDashboard} className="cta-btn primary">Go to Dashboard</button>
                <button onClick={redirectToCommunityHub} className="cta-btn secondary">Explore Community</button>
              </>
            ) : (
              <>
                <button onClick={redirectToSignup} className="cta-btn primary">Sign Up Free</button>
                <button className="cta-btn secondary">Schedule a Demo</button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="section contact" id="contact">
        <div className="section-container">
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-description">
            Have questions or want to learn more about how Nilara can help your business?
          </p>
          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">
                  <FaEnvelope />
                </div>
                <div className="contact-details">
                  <h3>Email</h3>
                  <p>info@nilara.com</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <FaPhone />
                </div>
                <div className="contact-details">
                  <h3>Phone</h3>
                  <p>+91 9136746515</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="contact-details">
                  <h3>Office</h3>
                  <p>Mumbai, India</p>
                </div>
              </div>
            </div>
            <div className="contact-form">
              <h3>Send us a message</h3>
              <form onSubmit={handleSubmitContact}>
                <div className="form-group">
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Your Name" 
                    value={contactForm.name}
                    onChange={handleContactChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Your Email" 
                    value={contactForm.email}
                    onChange={handleContactChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <textarea 
                    name="message" 
                    placeholder="Your Message" 
                    rows="5" 
                    value={contactForm.message}
                    onChange={handleContactChange}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="submit-btn">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="newsletter">
        <div className="newsletter-container">
          <h2>Beta Tester Signup</h2>
          <p>"Become a beta tester and help shape our product"</p>
          
          {betaAlert.show && (
            <div className={`alert ${betaAlert.type}`}>
              {betaAlert.message}
              <button onClick={() => setBetaAlert({ show: false, message: "", type: "" })}>×</button>
            </div>
          )}
          
          <form onSubmit={handleSubmitBeta} className="newsletter-form">
            <input 
              type="email" 
              name="email" 
              placeholder="Enter your email" 
              value={betaForm.email}
              onChange={(e) => setBetaForm({ email: e.target.value })}
              required 
            />
            <button type="submit">Register</button>
          </form>
          {subscribed && <p className="subscription-message">We look forward to working with you!</p>}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="logo">
                <img 
                  src={logo}
                  alt="Nilara Logo" 
                  className="logo-image"
                />
                <span className="logo-text">NILARA</span>
              </div>
              <p>Democratizing logistics technology for businesses of all sizes</p>
              <div className="social-links">
                <a href="#" aria-label="Twitter">
                  <FaTwitter className="social-icon" />
                </a>
                <a href="#" aria-label="LinkedIn">
                  <FaLinkedin className="social-icon" />
                </a>
                <a href="#" aria-label="Facebook">
                  <FaFacebook className="social-icon" />
                </a>
                <a href="https://www.instagram.com/nilara.freight/" aria-label="Instagram">
                  <FaInstagram className="social-icon" />
                </a>
              </div>
            </div>
            <div className="footer-section">
              <h3>Company</h3>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Blog</a>
              <a href="#">Press</a>
            </div>
            <div className="footer-section">
              <h3>Solutions</h3>
              <a href="#">For Manufacturers</a>
              <a href="#">For Forwarders</a>
              <a href="#">For Transporters</a>
              <a href="#">For SMEs</a>
            </div>
            <div className="footer-section">
              <h3>Resources</h3>
              <a href="#">Help Center</a>
              <a href="#">API Documentation</a>
              <a href="#">Community</a>
              <a href="#">Partners</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Nilara. All rights reserved.</p>
            <div className="legal-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      <div className={`scroll-top ${isVisible ? 'visible' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <FaArrowUp />
      </div>
    </div>
  );
};

export default LandingPage;