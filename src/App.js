import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import BestToday from "./components/BestToday";
import About from "./components/About";
import PlaceDetails from "./components/PlaceDetails";
import Contact from "./components/Contact";
import AIChat from "./components/AIChat";
import Favorites from "./components/Favorites";
import { useState } from "react";
import AuthModal from "./components/AuthModal";

export default function App() {
  const [showAuthModal, setShowAuthModal] = useState(true);

  return (
    <>
      <Navbar />
      <div className="app">
        <Routes>
          <Route path="/" element={<BestToday />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/place/:name" element={<PlaceDetails />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>

        <AIChat />

        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}
      </div>
    </>
  );
}