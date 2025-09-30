import React, { useState, useEffect, useRef } from "react";
import "./Signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    phone: "",
    companyName: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India" // Default to India
    },
    termsAccepted: false
  });
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef(null);

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.role) {
      setAlert({
        show: true,
        message: "Please fill in all required fields",
        type: "error"
      });
      setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
      return;
    }

    if (formData.password.length < 8) {
      setAlert({
        show: true,
        message: "Password must be at least 8 characters",
        type: "error"
      });
      setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setAlert({
        show: true,
        message: "Passwords do not match",
        type: "error"
      });
      setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
      return;
    }

    if (!formData.termsAccepted) {
      setAlert({
        show: true,
        message: "Please accept the terms and conditions",
        type: "error"
      });
      setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      setAlert({
        show: true,
        message: "Please enter a valid email address",
        type: "error"
      });
      setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
      return;
    }

    // Phone validation (if provided)
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      setAlert({
        show: true,
        message: "Please enter a valid 10-digit phone number",
        type: "error"
      });
      setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
      return;
    }

    try {
      setIsLoading(true);
      setAlert({
        show: true,
        message: "Creating your account...",
        type: "info"
      });

      const response = await fetch('https://smart-india-hackathon-816r.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json().catch(() => ({}));
      console.log("Server Response:", response.status, result);


      if (response.ok) {
        setAlert({
          show: true,
          message: result.message || "Account created successfully! Redirecting to login...",
          type: "success"
        });

        // Store token in localStorage
        if (result.token) {
          localStorage.setItem('token', result.token);
        }

        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        // Handle different error response formats
        const errorMessage = result.message || 
                           result.error || 
                           "Error creating account. Please try again.";
        
        setAlert({
          show: true,
          message: errorMessage,
          type: "error"
        });
      }
    } catch (err) {
      console.error("Signup error:", err);
      setAlert({
        show: true,
        message: "Network error. Please check your connection and try again.",
        type: "error"
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setAlert({ show: false, message: "", type: "" }), 5000);
    }
  };

  return (
    <div className="signup-container">
      <canvas 
        ref={canvasRef} 
        className="particles-background"
      />
      
      <div className="background-elements">
        <div className="bg-element-1"></div>
        <div className="bg-element-2"></div>
        <div className="bg-element-3"></div>
      </div>

      {alert.show && (
        <div className={`alert ${alert.type}`}>
          {alert.message}
          <button onClick={() => setAlert({ show: false, message: "", type: "" })}>×</button>
        </div>
      )}

      <div className="signup-card">
        <div className="signup-header">
          <div className="logo">
            <span className="logo-icon">🚚</span>
            <span className="logo-text">NILARA</span>
          </div>
          <h1>Create Account</h1>
          <p>Join our logistics platform today</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                placeholder="Enter your first name"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                placeholder="Enter your last name"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter 10-digit phone number"
                disabled={isLoading}
                maxLength="10"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Create a password (min 8 characters)"
                disabled={isLoading}
                minLength="8"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="Confirm your password"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            >
              <option value="">Select your role</option>
              <option value="shipper">Shipper</option>
              <option value="carrier">Carrier</option>
              <option value="driver">Driver</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {formData.role && (
            <div className="role-specific-section">
              <h3>{formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} Information</h3>
              <div className="form-group">
                <label htmlFor="companyName">Company Name</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder={`Enter your ${formData.role} company name`}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <div className="address-section">
            <h3>Address Information</h3>
            <div className="form-group">
              <label htmlFor="street">Street Address</label>
              <input
                type="text"
                id="street"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                placeholder="Enter street address"
                disabled={isLoading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  placeholder="Enter state"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                  placeholder="Enter ZIP code"
                  disabled={isLoading}
                  maxLength="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                  placeholder="Enter country"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              <span className="checkmark"></span>
              I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> *
            </label>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="login-redirect">
            <p>Already have an account? <a href="/login">Login here</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;