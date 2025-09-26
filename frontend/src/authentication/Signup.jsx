import React, { useState, useEffect, useRef } from "react";
import "./Signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    role: "",
    companyName: "",
    gstNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactPerson: "",
    phoneNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: ""
    },
    licenseNumber: "",   
    networkId: "",       
    businessType: "",    
    acceptTerms: false
  });

  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    initParticles();
  }, []);

  // Particle background
  const initParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const particles = [];
    const particleCount = 80;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = "rgba(255, 255, 255, 0.3)";
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
      }
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

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
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
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
    return () => window.removeEventListener("resize", resizeCanvas);
  };

  // Handle input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.role) {
      return setAlert({ show: true, message: "Please select your role", type: "error" });
    }
    if (formData.password !== formData.confirmPassword) {
      return setAlert({ show: true, message: "Passwords do not match", type: "error" });
    }

    // Role-specific validation
    if (formData.role === "transporter" && !formData.licenseNumber) {
      return setAlert({ show: true, message: "Please enter your License Number", type: "error" });
    }
    if (formData.role === "freight-forwarder" && !formData.networkId) {
      return setAlert({ show: true, message: "Please enter your Network ID", type: "error" });
    }
    if (formData.role === "company" && !formData.businessType) {
      return setAlert({ show: true, message: "Please enter your Business Type", type: "error" });
    }

    try {
      setIsLoading(true);
      setAlert({ show: true, message: "Creating your account...", type: "info" });

      // prepare payload for backend (exclude confirmPassword & acceptTerms)
      const payload = {
        role: formData.role,
        companyName: formData.companyName,
        gstNumber: formData.gstNumber,
        email: formData.email,
        password: formData.password,
        contactPerson: formData.contactPerson,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        licenseNumber: formData.role === "transporter" ? formData.licenseNumber : undefined,
        networkId: formData.role === "freight-forwarder" ? formData.networkId : undefined,
        businessType: formData.role === "company" ? formData.businessType : undefined
      };

      const response = await fetch("https://smart-india-hackathon-816r.onrender.com/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        setAlert({
          show: true,
          message: "Account created successfully! Redirecting...",
          type: "success"
        });
        setTimeout(() => (window.location.href = "/login"), 2000);
      } else {
        setAlert({ show: true, message: result.message || "Signup failed", type: "error" });
      }
    } catch (err) {
      setAlert({ show: true, message: "Server error", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <canvas
        ref={canvasRef}
        className="particles-background"
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}
      />

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
          <h1>Create Your Account</h1>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {/* Role Selection */}
          <div className="form-group">
            <label htmlFor="role">Registering as *</label>
            <select id="role" name="role" value={formData.role} onChange={handleInputChange} required>
              <option value="">-- Select Role --</option>
              <option value="company">Company</option>
              <option value="freight-forwarder">Freight Forwarder</option>
              <option value="transporter">Transporter</option>
            </select>
          </div>

          {/* Role-specific fields */}
          {formData.role === "transporter" && (
            <div className="form-group">
              <label htmlFor="licenseNumber">License Number *</label>
              <input type="text" id="licenseNumber" name="licenseNumber" value={formData.licenseNumber}
                onChange={handleInputChange} placeholder="Enter your transport license number" />
            </div>
          )}

          {formData.role === "freight-forwarder" && (
            <div className="form-group">
              <label htmlFor="networkId">Freight Network ID *</label>
              <input type="text" id="networkId" name="networkId" value={formData.networkId}
                onChange={handleInputChange} placeholder="Enter your freight network ID" />
            </div>
          )}

          {formData.role === "company" && (
            <div className="form-group">
              <label htmlFor="businessType">Business Type *</label>
              <input type="text" id="businessType" name="businessType" value={formData.businessType}
                onChange={handleInputChange} placeholder="e.g. Manufacturing, Retail, Export" />
            </div>
          )}

          {/* Existing Fields */}
          <div className="form-group">
            <label htmlFor="companyName">Company Name *</label>
            <input type="text" id="companyName" name="companyName" value={formData.companyName}
              onChange={handleInputChange} required placeholder="Enter your company name" />
          </div>

          <div className="form-group">
            <label htmlFor="gstNumber">GST Number *</label>
            <input type="text" id="gstNumber" name="gstNumber" value={formData.gstNumber}
              onChange={handleInputChange} required placeholder="Enter your GST number" style={{ textTransform: "uppercase" }} />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input type="email" id="email" name="email" value={formData.email}
              onChange={handleInputChange} required placeholder="Enter your email" />
          </div>

          <div className="form-group">
            <label htmlFor="contactPerson">Contact Person *</label>
            <input type="text" id="contactPerson" name="contactPerson" value={formData.contactPerson}
              onChange={handleInputChange} required placeholder="Enter contact person name" />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number *</label>
            <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber}
              onChange={handleInputChange} required placeholder="Enter 10-digit phone number" pattern="[0-9]{10}" />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input type="password" id="password" name="password" value={formData.password}
              onChange={handleInputChange} required placeholder="Create a password" minLength="8" />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword}
              onChange={handleInputChange} required placeholder="Confirm your password" />
          </div>

          {/* Address Section */}
          <div className="address-section">
            <h3>Address Information</h3>
            <div className="form-group">
              <label htmlFor="street">Street Address *</label>
              <input type="text" id="street" name="address.street" value={formData.address.street}
                onChange={handleInputChange} required placeholder="Enter street address" />
            </div>

            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input type="text" id="city" name="address.city" value={formData.address.city}
                onChange={handleInputChange} required placeholder="Enter city" />
            </div>

            <div className="form-group">
              <label htmlFor="state">State *</label>
              <input type="text" id="state" name="address.state" value={formData.address.state}
                onChange={handleInputChange} required placeholder="Enter state" />
            </div>

            <div className="form-group">
              <label htmlFor="pincode">Pincode *</label>
              <input type="text" id="pincode" name="address.pincode" value={formData.address.pincode}
                onChange={handleInputChange} required placeholder="Enter 6-digit pincode" pattern="[1-9][0-9]{5}" />
            </div>
          </div>

          {/* Terms */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input type="checkbox" name="acceptTerms" checked={formData.acceptTerms}
                onChange={handleInputChange} required />
              <span className="checkmark"></span>
              I accept the <a href="/terms">Terms</a> & <a href="/privacy">Privacy Policy</a>
            </label>
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;