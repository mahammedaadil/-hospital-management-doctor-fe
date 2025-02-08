import React, { createContext, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

export const Context = createContext({
  isAuthenticated: false,
  user: null, // Store Doctor details here
  setIsAuthenticated: () => {},
  setUser: () => {},
});

const AppWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // Store the logged-in Doctor's data

  return (
    <Context.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser }}>
      <App />
    </Context.Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);
