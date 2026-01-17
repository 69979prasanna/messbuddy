
import { useState } from "react";

export default function Navbar() {
  const [active, setActive] = useState("Home");

  const links = ["Home", "About", "Contact"];

  return (
    <nav className="navbar">
      <div className="logo">
        🍽️ <span>MessBuddy</span>
      </div>

      <ul className="nav-links">
        {links.map(link => (
          <li
            key={link}
            className={active === link ? "active" : ""}
            onClick={() => setActive(link)}
          >
            {link}
          </li>
        ))}
      </ul>
    </nav>
  );
}
