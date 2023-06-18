import "./Header.css";
import logo from "../logo.png";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { useContext } from "react";

const Header = () => {
  const { user, setUser } = useContext(UserContext);

  return (
    <header>
      <nav
        className="navbar navbar-brand navbar-expand-sm
                  navbar-expand-md navbar-expand-lg
                  navbar-expand-xl navbar-expand-xxl"
      >
        <img
          src={logo}
          alt="dragon logo"
          className="logo navbar-brand"
        />
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
            {!user.token ?
              (
                <>
                  <li className="nav-item">
                    <Link to="/login" className="nav-link">
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/register" className="nav-link">
                      Register
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    Profile {/* Todo: create user profile page and add link here */}
                  </li>
                  <li className="nav-link">
                    <button type="button" onClick={async e => {
                      try {
                        await fetch("/api/users/logout", {
                          method: "POST",
                          credentials: "include",
                          headers: {
                            "Content-Type": "application/json"
                          }
                        });
                        const newUser = user;
                        setUser({ ...newUser, token: null });
                      } catch (err) {
                        console.log(`Header component, logout button code error: ${err}`);
                      }
                    }}></button>
                  </li>
                </>
              )}

          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;