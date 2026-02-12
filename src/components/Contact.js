import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.message.trim()) return;

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
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="container py-5 text-light">
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

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      type="email"
                      className="form-control bg-dark text-light border-secondary"
                      placeholder="you@example.com"
                    />
                  </div>

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

      <div className="text-center mt-4 text-secondary">
        <small>
          Feedback is stored locally. Backend coming soon 🚀
        </small>
      </div>
    </div>
  );
}
