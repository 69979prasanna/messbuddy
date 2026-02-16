import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    rating: 0
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRating = (value) => {
    setForm({ ...form, rating: value });
  };

  const handleSubmit = () => {
    if (!form.message.trim() || form.rating === 0) return;

    const feedbacks =
      JSON.parse(localStorage.getItem("messbuddy-feedback")) || [];

    feedbacks.push({
      ...form,
      date: new Date().toLocaleString()
    });

    localStorage.setItem(
      "messbuddy-feedback",
      JSON.stringify(feedbacks)
    );

    setSubmitted(true);
    setForm({
      name: "",
      email: "",
      message: "",
      rating: 0
    });
  };

  return (
    <div className="container py-5 text-light">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="fw-bold">
          Contact <span className="text-info">MessBuddy</span>
        </h1>
        <p className="text-secondary fs-5 mt-2">
          Have feedback, suggestions, or ideas? We’d love to hear from you.
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card bg-dark text-light shadow-sm">
            <div className="card-body">
              {submitted ? (
                <div className="alert alert-success text-center">
                  ✅ Thanks for your feedback!
                </div>
              ) : (
                <form>
                  {/* Name */}
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="form-control bg-dark text-light border-secondary"
                      placeholder="Your name"
                    />
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="form-control bg-dark text-light border-secondary"
                      placeholder="you@example.com"
                    />
                  </div>

                  {/* Rating */}
                  <div className="mb-3">
                    <label className="form-label">
                      Rate MessBuddy
                    </label>

                    <div className="d-flex gap-2 fs-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          style={{ cursor: "pointer" }}
                          className={
                            star <= form.rating
                              ? "text-warning"
                              : "text-secondary"
                          }
                          onClick={() => handleRating(star)}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    {form.rating === 0 && (
                      <small className="text-danger">
                        Please select a rating
                      </small>
                    )}
                  </div>

                  {/* Message */}
                  <div className="mb-3">
                    <label className="form-label">Message</label>
                    <textarea
                      name="message"
                      rows="4"
                      value={form.message}
                      onChange={handleChange}
                      className="form-control bg-dark text-light border-secondary"
                      placeholder="Your message..."
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="button"
                    className="btn btn-info w-100 fw-semibold"
                    onClick={handleSubmit}
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center mt-4 text-secondary">
        <small>
          Feedback is stored locally. Backend coming soon 🚀
        </small>
      </div>
    </div>
  );
}
