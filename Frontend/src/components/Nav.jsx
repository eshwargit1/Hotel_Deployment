import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Nav.css";

const NavIcon = ({ name }) => {
  const icons = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
    add: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
    update: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3" /></>,
    delete: <><path d="M4 7h16M10 11v6M14 11v6" /><path d="m6 7 1 13h10l1-13M9 7V4h6v3" /></>,
  };
  return <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>;
};

const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="site-header">
      <nav className={isMenuOpen ? "menu-open" : ""}>
        <Link to="/" className="logo" onClick={closeMenu}>
          <img src="/RHS Hotels Management Logo.png" alt="" />
          <span><strong>RHS</strong><small>Hotels Management</small></span>
        </Link>
        <button
          type="button"
          className="menu-toggle"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="site-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <ul id="site-navigation">
          <li className="drawer-close-item">
            <button
              type="button"
              className="drawer-close"
              aria-label="Close navigation menu"
              onClick={closeMenu}
            >
              <span />
              <span />
            </button>
          </li>
          <li>
            <NavLink to="/" end onClick={closeMenu}><NavIcon name="home" />Home</NavLink>
          </li>
          <li>
            <NavLink to="/add" onClick={closeMenu}><NavIcon name="add" />Add Hotel</NavLink>
          </li>
          <li>
            <NavLink to="/update" onClick={closeMenu}><NavIcon name="update" />Update Hotel</NavLink>
          </li>
          <li>
            <NavLink to="/delete" onClick={closeMenu}><NavIcon name="delete" />Delete Hotel</NavLink>
          </li>
        </ul>
      </nav>
      {isMenuOpen ? (
        <button
          type="button"
          className="nav-overlay"
          aria-label="Close navigation menu"
          onClick={closeMenu}
        />
      ) : null}
    </header>
  );
};

export default Nav;
