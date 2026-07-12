import StatCard from "../../components/admin/StatCard"
import ActionCard from "../../components/admin/ActionCard"

export default function Dashboard() {

  return (
    <div className="container py-5 text-light">

      <h1
        className="fw-bold text-center mb-5"
      >
        🍽 Admin Dashboard
      </h1>

      <div className="row g-4 mb-5">

        <StatCard
          title="Restaurants"
          value="0"
          icon="🍽"
          color="#0dcaf0"
        />

        <StatCard
          title="Menus"
          value="0"
          icon="📋"
          color="#ffc107"
        />

        <StatCard
          title="Reviews"
          value="0"
          icon="⭐"
          color="#198754"
        />

        <StatCard
          title="Feedback"
          value="0"
          icon="💬"
          color="#dc3545"
        />

      </div>

      <h3 className="mb-4">
        Quick Actions
      </h3>

      <div className="row g-4">

        <ActionCard
          title="Add Restaurant"
          icon="➕"
          path="/admin/restaurants/new"
        />

        <ActionCard
          title="Manage Restaurants"
          icon="🍽"
          path="/admin/restaurants"
        />

        <ActionCard
          title="Menu Manager"
          icon="📋"
          path="/admin/menu"
        />

        <ActionCard
          title="Feedback"
          icon="💬"
          path="/admin/feedback"
        />

      </div>

    </div>
  )
}