import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import BestToday from "./components/BestToday";
import About from "./components/About";
import PlaceDetails from "./components/PlaceDetails";
import Contact from "./components/Contact";
import AIChat from "./components/AIChat";

export default function App() {
  return (
    <>
      <Navbar />
      <div className="app">
        <Routes>
          <Route path="/" element={<BestToday />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact/>}/>
          <Route path="/place/:name" element={<PlaceDetails/>} />
          
        </Routes>
        <AIChat/>
      </div>
    </>
  );
}
