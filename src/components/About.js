// src/components/About.jsx

export default function About() {
  return (
    <div className="about-container">
      {/* Hero */}
      <div className="about-hero">
        <h1>About <span>MessBuddy</span></h1>
        <p>
          MessBuddy helps college students decide what food is worth eating
          <strong> today</strong> — without guesswork.
        </p>
      </div>

      {/* Problem */}
      <div className="about-section">
        <h2>The Problem</h2>
        <p>
          Students usually rely on WhatsApp forwards, friends, or pure guesswork
          to choose between mess food, tiffins, and canteens.
          This often leads to wasted money and bad meals.
        </p>
      </div>

      {/* Features */}
      <div className="features-grid">
        <div className="feature-card">
          <span>📋</span>
          <h3>Unified Daily View</h3>
          <p>See all food options for today in one place.</p>
        </div>

        <div className="feature-card">
          <span>⭐</span>
          <h3>Student Ratings</h3>
          <p>Rate today’s food quality and help others decide.</p>
        </div>

        <div className="feature-card">
          <span>💰</span>
          <h3>Price vs Quality</h3>
          <p>Compare mess, tiffins, and restaurants easily.</p>
        </div>

        <div className="feature-card warning">
          <span>⚠️</span>
          <h3>Bad Food Alerts</h3>
          <p>Know instantly when something is not good today.</p>
        </div>
      </div>

      {/* Goal */}
      <div className="about-footer">
        <p>
          🎯 Our goal is simple: help students make faster, smarter food decisions
          without wasting money or meals.
        </p>
      </div>
    </div>
  );
}
