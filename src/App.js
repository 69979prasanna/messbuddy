import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import BestToday from "./components/BestToday";
import About from "./components/About";
import PlaceDetails from "./components/PlaceDetails";

export default function App() {
  return (
    <>
      <Navbar />
      <div className="app">
        <Routes>
          <Route path="/" element={<BestToday />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/contact"
            element={<p>📩 Contact page coming soon</p>}
          />
          <Route path="/place/:name" element={<PlaceDetails/>} />

        </Routes>
      </div>
    </>
  );
}
