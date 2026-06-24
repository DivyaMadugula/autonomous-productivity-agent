import {
  FiTarget,
  FiCalendar,
  FiMessageSquare,
  FiBarChart2,
  FiZap,
  FiSettings
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";
import "../styles/landing.css";

const Home = () => {
  const navigate = useNavigate();

  // 🔥 Scroll function
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="home">

      {/* NAVBAR */}
      <nav className="nav">
        <h2 className="logo">▲ Aura</h2>

        <div className="nav-links">
          <span onClick={() => scrollToSection("features")}>
            Features
          </span>
          <span onClick={() => scrollToSection("how-it-works")}>
            How it Works
          </span>
        </div>

        <div className="nav-btns">
          <button className="login" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="start" onClick={() => navigate("/register")}>
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="badge">
          ✨ Autonomous Personal Productivity AI
        </div>

        <h1>
          Your productivity,<br />
          <span>on autopilot.</span>
        </h1>

        <p>
          Aura is an AI that learns how you work — it schedules your tasks,
          tracks your goals, and optimizes your day.
        </p>

        <div className="hero-buttons">
          {/* ✅ FIXED */}
          <button
            className="primary"
            onClick={() => navigate("/login")}
          >
            Start Free →
          </button>

          {/* ✅ FIXED */}
          <button
            className="secondary"
            onClick={() => scrollToSection("how-it-works")}
          >
            See How It Works
          </button>
        </div>

        {/* STATS */}
        <div className="stats">
          <div><h2>10K+</h2><p>Active Users</p></div>
          <div><h2>2M+</h2><p>Tasks Managed</p></div>
          <div><h2>98%</h2><p>Satisfaction</p></div>
        </div>
      </section>

      {/* IMAGE */}
      <div className="hero-image">
        <img src="/dashboard.png" alt="Dashboard" />
      </div>

      {/* FEATURES */}
      <section id="features" className="features">
        <h2>
          Everything you need to <span>stay ahead</span>
        </h2>

        <p className="subtitle">
          Aura combines AI intelligence with beautiful design.
        </p>

        <div className="grid">

          <div className="card">
            <div className="icon-box"><FiSettings /></div>
            <h3>AI Task Scheduling</h3>
            <p>Schedules tasks at optimal times automatically.</p>
          </div>

          <div className="card">
            <div className="icon-box"><FiTarget /></div>
            <h3>Smart Goals</h3>
            <p>Break goals into daily actionable steps.</p>
          </div>

          <div className="card">
            <div className="icon-box"><FiBarChart2 /></div>
            <h3>Deep Analytics</h3>
            <p>Track performance and productivity trends.</p>
          </div>

          <div className="card">
            <div className="icon-box"><FiCalendar /></div>
            <h3>Adaptive Schedule</h3>
            <p>Reschedules tasks automatically in real-time.</p>
          </div>

          <div className="card">
            <div className="icon-box"><FiMessageSquare /></div>
            <h3>AI Assistant</h3>
            <p>Ask anything and plan your workflow smarter.</p>
          </div>

          <div className="card">
            <div className="icon-box"><FiZap /></div>
            <h3>Instant Sync</h3>
            <p>Sync data across all devices instantly.</p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="how">
        <h2>
          Get started in <span>3 simple steps</span>
        </h2>

        <div className="steps">

          <div className="step">
            <div className="num">01</div>
            <div className="step-text">
              <h3>Create your account</h3>
              <p>Sign up and set your preferences.</p>
            </div>
          </div>

          <div className="step">
            <div className="num">02</div>
            <div className="step-text">
              <h3>Add your goals & tasks</h3>
              <p>Aura builds your schedule automatically.</p>
            </div>
          </div>

          <div className="step">
            <div className="num">03</div>
            <div className="step-text">
              <h3>Watch your productivity soar</h3>
              <p>Track progress and improve daily.</p>
            </div>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Ready to take control of your time?</h2>
        <p>
          Join thousands of professionals who let Aura handle planning so they can focus on doing.
        </p>

        {/* ✅ FIXED */}
        <button
          className="cta-btn"
          onClick={() => navigate("/login")}
        >
          Get Started — It's Free →
        </button>
      </section>

    </div>
  );
};

export default Home;