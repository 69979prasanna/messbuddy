
import Navbar from "./components/Navbar";
import BestToday from "./components/BestToday";

export default function App() {
  return (
    <div className="app">
      <Navbar/>
      <h1>MessBuddy</h1>
      <p>Your daily food decision buddy</p>
      <BestToday />
    </div>
  );
}
