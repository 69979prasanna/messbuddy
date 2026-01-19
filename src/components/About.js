
export default function About() {
  return (
    <div className="container py-5 text-light">
      {/* Hero */}
      <div className="text-center mb-5">
        <h1 className="fw-bold">
          About <span className="text-info">MessBuddy</span>
        </h1>
        <p className="text-secondary fs-5 mt-2">
          Helping college students decide what food is worth eating
          <strong> today</strong>.
        </p>
      </div>

      {/* Problem */}
      <div className="row justify-content-center mb-5">
        <div className="col-md-8">
          <div className="card bg-dark text-light shadow-sm">
            <div className="card-body">
              <h4 className="text-info">The Problem</h4>
              <p className="text-secondary mb-0">
                Students rely on WhatsApp messages, friends, or pure
                guesswork to choose between mess food, tiffins, and
                canteens—often leading to wasted money and bad meals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="row g-4 mb-5">
        {[
          { icon: "📋", title: "Unified Daily View", desc: "All food options in one place." },
          { icon: "⭐", title: "Crowd Ratings", desc: "Students rate today’s food quality." },
          { icon: "💰", title: "Price vs Quality", desc: "Compare value across options." },
          { icon: "⚠️", title: "Bad Food Alerts", desc: "Avoid items getting poor reviews." }
        ].map((f, i) => (
          <div className="col-md-3 col-sm-6" key={i}>
            <div className="card bg-dark text-light h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="fs-2 mb-2">{f.icon}</div>
                <h6 className="fw-bold">{f.title}</h6>
                <p className="text-secondary small">{f.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="fs-5">
          🎯 Our goal is simple: help students make faster, smarter food
          decisions without wasting money or meals.
        </p>
      </div>
    </div>
  );
}
