import React, { useState, useEffect, useRef } from "react";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Initialize particles
    initParticles();
  }, []);

  const initParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 80;
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = 'rgba(255, 255, 255, 0.3)';
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
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        // Connect particles with lines
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
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
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      setAlert({
        show: true,
        message: "Please fill in all required fields",
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

    try {
      setIsLoading(true);
      setAlert({
        show: true,
        message: "Logging in...",
        type: "info"
      });

      const response = await fetch('https://smart-india-hackathon-816r.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const result = await response.json();

      if (response.ok) {
        setAlert({
          show: true,
          message: "Login successful! Redirecting...",
          type: "success"
        });
        
        if (result.token) {
          localStorage.setItem('token', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
        }

        setFormData({
          email: "",
          password: "",
          rememberMe: false
        });

        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        setAlert({
          show: true,
          message: result.message || "Invalid email or password",
          type: "error"
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      setAlert({
        show: true,
        message: "Wrong Password. Try again",
        type: "error"
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setAlert({ show: false, message: "", type: "" }), 5000);
    }
  };

  return (
    <div className="login-container">
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
      {alert.show && (
        <div className={`alert ${alert.type}`}>
          {alert.message}
          <button onClick={() => setAlert({ show: false, message: "", type: "" })}>×</button>
        </div>
      )}

      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <span className="logo-icon">🚚</span>
            <span className="logo-text">NILARA</span>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to your logistics account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
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
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <div className="form-options">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
            </div>
            
            <a href="/forgot-password" className="forgot-link">
              Forgot password?
            </a>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <div className="signup-redirect">
            <p>Don't have an account? <a href="/signup">Sign up here</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;