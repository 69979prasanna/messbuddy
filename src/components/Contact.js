export default function Contact() {
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
              <form>
                {/* Name */}
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Message */}
                <div className="mb-3">
                  <label className="form-label">Message</label>
                  <textarea
                    rows="4"
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="Your message..."
                  ></textarea>
                </div>

                {/* Submit */}
                <button
                  type="button"
                  className="btn btn-info w-100 fw-semibold"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center mt-4 text-secondary">
        <small>
          This form is currently for feedback purposes only.
        </small>
      </div>
    </div>
  );
}
