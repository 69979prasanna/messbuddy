
import React from "react"
import { FiGrid, FiStar, FiDollarSign, FiAlertTriangle, FiTarget } from "react-icons/fi"
import "../styles/About.css"

export default function About() {
  const features = [
    {
      icon: <FiGrid className="about-icon icon-cyan" />,
      title: "Unified Daily View",
      desc: "All food options in one place.",
    },
    {
      icon: <FiStar className="about-icon icon-amber" />,
      title: "Crowd Ratings",
      desc: "Students rate today’s food quality.",
    },
    {
      icon: <FiDollarSign className="about-icon icon-emerald" />,
      title: "Price vs Quality",
      desc: "Compare value across options.",
    },
    {
      icon: <FiAlertTriangle className="about-icon icon-coral" />,
      title: "Bad Food Alerts",
      desc: "Avoid items getting poor reviews.",
    },
  ]

  return (
    <div className="about-page-wrapper">
      {/* 1. Hero / Page Header */}
      <section className="about-hero">
        <span className="about-kicker">About</span>
        <h1 className="about-hero-title">
          About <span className="brand-highlight">MessBuddy</span>
        </h1>
        <p className="about-hero-subtitle">
          Helping college students decide what food is worth eating
          <strong> today</strong>.
        </p>
      </section>

      {/* 2. The Problem Section */}
      <section className="about-problem-wrapper">
        <div className="about-problem-card">
          <div className="about-section-label">The Problem</div>
          <p className="about-problem-text">
            Students rely on WhatsApp messages, friends, or pure guesswork to
            choose between mess food, tiffins, and canteens—often leading to
            wasted money and bad meals.
          </p>
        </div>
      </section>

      {/* 3. Feature Cards */}
      <section className="about-features-section">
        <div className="about-features-grid">
          {features.map((f, i) => (
            <div className="about-feature-card" key={i}>
              <div className="about-icon-container">{f.icon}</div>
              <h3 className="about-feature-title">{f.title}</h3>
              <p className="about-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Goal Section */}
      <section className="about-goal-wrapper">
        <div className="about-goal-icon-badge">
          <FiTarget />
        </div>
        <p className="about-goal-text">
          Our goal is simple: help students make faster, smarter food decisions
          without wasting money or meals.
        </p>
      </section>
    </div>
  )
}

