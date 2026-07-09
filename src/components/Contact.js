import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "Suggestion",
    message: "",
    rating: 0,
  })
  const api = process.env.REACT_APP_APIKEY
  const [hoverRating, setHoverRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleRating = (value) => {
    setForm({
      ...form,
      rating: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.message.trim() || form.rating === 0) {
      alert("Please provide a rating and message.");
      return;
    }

    try {
      const res = await fetch(
        `${api}/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      )

      if (!res.ok) {
        throw new Error("Failed to send feedback")
      }

      setSubmitted(true)

      setForm({
        name: "",
        email: "",
        type: "Suggestion",
        message: "",
        rating: 0,
      })

      setHoverRating(0);

      setTimeout(() => {
        setSubmitted(false)
      }, 4000)
    } catch (err) {
      console.error(err)
      alert("Something went wrong.")
    }
  }

  return (
    <div className="container py-5 text-light">

      <div className="text-center mb-5">
        <h1 className="fw-bold">
          ⭐ Feedback & Support
        </h1>

        <p className="text-secondary fs-5 mt-3">
          Help us improve MessBuddy by reporting bugs,
          suggesting features, or recommending restaurants.
        </p>
      </div>

      <div className="row justify-content-center">

        <div className="col-lg-8">

          <div
            className="card bg-dark text-light shadow-lg border-secondary"
            style={{ borderRadius: "18px" }}
          >
            <div className="card-body p-4">

              {submitted ? (
                <div className="alert alert-success text-center fs-5">
                  🎉 Thank you for your feedback!
                  <br />
                  We appreciate your support ❤️
                </div>
              ) : (
                <form onSubmit={handleSubmit}>

                  <div className="mb-3">
                    <label className="form-label">
                      Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="form-control bg-dark text-light border-secondary"
                      placeholder="Your Name"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="form-control bg-dark text-light border-secondary"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Feedback Type
                    </label>

                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="form-select bg-dark text-light border-secondary"
                    >
                      <option>Suggestion</option>
                      <option>Bug Report</option>
                      <option>Restaurant Request</option>
                      <option>Wrong Price</option>
                      <option>Wrong Timing</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="mb-4">

                    <label className="form-label">
                      Rate MessBuddy
                    </label>

                    <div className="d-flex gap-2 fs-2">

                      {[1, 2, 3, 4, 5].map((star) => {
                        const active =
                          hoverRating >= star ||
                          form.rating >= star;

                        return (
                          <span
                            key={star}
                            onClick={() =>
                              handleRating(star)
                            }
                            onMouseEnter={() =>
                              setHoverRating(star)
                            }
                            onMouseLeave={() =>
                              setHoverRating(0)
                            }
                            className={
                              active
                                ? "text-warning"
                                : "text-secondary"
                            }
                            style={{
                              cursor: "pointer",
                              transition: "0.2s",
                              transform:
                                hoverRating === star
                                  ? "scale(1.2)"
                                  : "scale(1)",
                            }}
                          >
                            ★
                          </span>
                        );
                      })}
                    </div>

                    {form.rating === 0 && (
                      <small className="text-danger">
                        Please select a rating.
                      </small>
                    )}

                  </div>

                  <div className="mb-4">

                    <label className="form-label">
                      Message
                    </label>

                    <textarea
                      rows="5"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      className="form-control bg-dark text-light border-secondary"
                      placeholder="Tell us your suggestion, bug report, or restaurant recommendation..."
                    />

                  </div>

                  <button
                    type="submit"
                    className="btn btn-info fw-bold w-100 py-2"
                  >
                    🚀 Send Feedback
                  </button>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>

      <div className="text-center mt-4 text-secondary">
        <small>
          Your feedback helps us improve MessBuddy ❤️
        </small>
      </div>

    </div>
  );
}