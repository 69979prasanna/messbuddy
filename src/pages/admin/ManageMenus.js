import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import MenuCard from "../../components/admin/MenuCard"
import EditMenuModal from "../../components/admin/EditMenuModal"
const API = process.env.REACT_APP_APIKEY
export default function ManageMenus() {
  const [menus, setMenus] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedRestaurant, setSelectedRestaurant] =
    useState("all")
  const [editingMenu, setEditingMenu] =
    useState(null)
  const [showEditModal, setShowEditModal] =
    useState(false)
  useEffect(() => {
    fetchMenus()
    fetchRestaurants()
  }, [])
  const fetchMenus = async () => {
    try {
      const res = await axios.get(
        `${API}/menus`
      )
      setMenus(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  const fetchRestaurants = async () => {
    try {
      const res = await axios.get(
        `${API}/restaurants`
      )
      setRestaurants(res.data)
    } catch (err) {
      console.error(err)
    }
  }
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this menu item?"
    )
    if (!confirmDelete) return
    try {
      await axios.delete(
        `${API}/menus/${id}`
      )
      setMenus((prev) =>
        prev.filter(
          (menu) => menu._id !== id
        )
      )
    } catch (err) {
      console.error(err)
      alert("Unable to delete menu.")
    }
  }
  const handleEdit = (menu) => {
    setEditingMenu(menu)
    setShowEditModal(true)
  }
  const filteredMenus = useMemo(() => {
    return menus.filter((menu) => {
      const matchesSearch =
        menu.dish
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesRestaurant = selectedRestaurant === "all" || menu.restaurant?._id === selectedRestaurant
      return (
        matchesSearch &&
        matchesRestaurant
      )
    })
  }, [
    menus,
    search,
    selectedRestaurant,
  ])

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">
          Manage Menus
        </h2>

      </div>
      <div className="row mb-4">
        <div className="col-md-6">
          <input type="text" className="form-control" placeholder="Search menu..." value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select className="form-select" value={selectedRestaurant} onChange={(e) =>
              setSelectedRestaurant(
                e.target.value
              )}>
            <option value="all">
              All Restaurants
            </option>
            {restaurants.map((r) => (
              <option
                key={r._id}
                value={r._id}
              >
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {loading ? (
        <div className="text-center">
          Loading...
        </div>

      ) : (
        <div className="row">
          {filteredMenus.length === 0 ? (
            <div className="text-center mt-5">
              <h5>No menu found.</h5>
            </div>
          ) : (
            filteredMenus.map((menu) => (
              <div
                className="col-lg-4 col-md-6 mb-4"
                key={menu._id}
              >
                <MenuCard menu={menu} onEdit={handleEdit} onDelete={handleDelete}/>
              </div>
            ))
          )}
        </div>
      )}
      {showEditModal && (
        <EditMenuModal
          show={showEditModal}
          menu={editingMenu}
          restaurants={restaurants}
          onClose={() =>
            setShowEditModal(false)
          }
          refreshMenus={fetchMenus}
        />
      )}
    </div>
  )
}