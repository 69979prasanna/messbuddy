export default function StatCard({
  title,
  value,
  icon,
  color
}) {
  return (
    <div className="col-md-3">
      <div
        className="card bg-dark text-light shadow h-100"
        style={{
          borderLeft: `5px solid ${color}`
        }}
      >
        <div className="card-body text-center">

          <div
            style={{
              fontSize: "2rem"
            }}
          >
            {icon}
          </div>

          <h5 className="mt-2">
            {title}
          </h5>

          <h2>{value}</h2>

        </div>
      </div>
    </div>
  )
}