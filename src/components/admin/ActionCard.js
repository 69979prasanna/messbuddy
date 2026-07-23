import { useNavigate } from "react-router-dom"
export default function ActionCard({
  title,
  icon,
  path
}) {
  const navigate = useNavigate()

  return (
    <div className="col-md-6">
      <div
        className="card bg-dark text-light shadow"
        style={{
          cursor: "pointer",
          borderRadius: "15px"
        }}
        onClick={() => navigate(path)}
      >
        <div className="card-body text-center">

          <div
            style={{
              fontSize: "3rem"
            }}
          >
            {icon}
          </div>

          <h4 className="mt-3">
            {title}
          </h4>

        </div>
      </div>
    </div>
  )
}