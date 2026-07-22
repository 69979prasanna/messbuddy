import { Routes, Route } from "react-router-dom"
import Navbar from "./components/common/Navbar"
import BestToday from "./components/home/BestToday"
import About from "./pages/About"
import PlaceDetails from "./pages/PlaceDetails"
import Contact from "./pages/Contact"
import AIChat from "./components/common/AIChat"
import Favorites from "./pages/Favorites"
import { useState } from "react"
import AuthModal from "./components/common/AuthModal"
import Dashboard from "./pages/admin/Dashboard"
import AddRestaurant from "./pages/admin/AddRestaurant"
import ManageRestaurants from "./pages/admin/ManageRestaurants"
import MenuManager from "./pages/admin/MenuManager"
import FeedbackManager from "./pages/admin/FeedbackManager"
import EditRestaurant from "./pages/admin/EditRestaurant"
export default function App() {
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <>
      <Navbar setShowAuthModal={setShowAuthModal}/>
      <div className="app">
        <Routes>
          <Route path="/admin/restaurants/edit/:id" element={<EditRestaurant />}/>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/restaurants/new"element={<AddRestaurant />}/>
          <Route path="/admin/restaurants"element={<ManageRestaurants />}/>
          <Route path="/admin/menu"element={<MenuManager />}/>
          <Route path="/admin/feedback"element={<FeedbackManager />}/>
          <Route path="/" element={<BestToday setShowAuthModal={setShowAuthModal} />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/place/:id" element={<PlaceDetails setShowAuthModal={setShowAuthModal}/>} />
          <Route path="/favorites" element={<Favorites setShowAuthModal={setShowAuthModal}  />} />
        </Routes>

        <AIChat />

        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}
      </div>
    </>
  )
}