import { useEffect, useState } from "react";
import StatCard from "../../components/admin/StatCard";
import ActionCard from "../../components/admin/ActionCard";

const API = process.env.REACT_APP_APIKEY;

export default function Dashboard() {

  const [stats, setStats] = useState({
    restaurants: 0,
    menus: 0,
    reviews: 0,
    feedback: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {

      const restaurantRes = await fetch(`${API}/restaurants`);
      const restaurants = await restaurantRes.json();

      // We'll make these dynamic later
      setStats({
        restaurants: restaurants.length,
        menus: 0,
        reviews: 0,
        feedback: 0,
      });

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container py-5 text-light">

      <h1 className="fw-bold text-center mb-5">
        🍽 Admin Dashboard
      </h1>

      <div className="row g-4 mb-5">

        <StatCard
          title="Restaurants"
          value={stats.restaurants}
          icon="🍽"
          color="#0dcaf0"
        />

        <StatCard
          title="Menus"
          value={stats.menus}
          icon="📋"
          color="#ffc107"
        />

        <StatCard
          title="Reviews"
          value={stats.reviews}
          icon="⭐"
          color="#198754"
        />

        <StatCard
          title="Feedback"
          value={stats.feedback}
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
  );
}