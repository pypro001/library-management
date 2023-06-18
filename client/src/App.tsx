import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import { Route, Routes } from "react-router-dom";
import { UserContext } from "./context/UserContext";
import Loader from "./components/Loader";
import { useContext, useCallback, useEffect } from "react";
import "./App.css";

function App() {
  const { user, setUser } = useContext(UserContext);

  const newUser = user;

  const verifyUser = useCallback(async () => {
    try {
      const response = await fetch("/api/users/refreshToken", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser({ ...newUser, token: data.token });
      } else {
        setUser({ ...newUser, token: null });
      }

      // call refreshToken every 5 minutes to renew the authentication token.
      setTimeout(verifyUser, 5 * 60 * 1000);
    } catch (error) {
      console.log(`in verifyUser, App component: ${error}`);
    }
  }, [setUser, newUser]);

  useEffect(() => {
    verifyUser();
  }, [verifyUser]);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={user.token === null ? (
          <Login />
         ) : user.token ? (
          <Home />
         ) : <Loader />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;