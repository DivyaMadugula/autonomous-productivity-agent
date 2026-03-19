import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(
    localStorage.getItem("userEmail") || ""
  );

  const login = (email) => {
    localStorage.setItem("userEmail", email);
    setUserEmail(email);
  };

  const logout = () => {
    localStorage.removeItem("userEmail");
    setUserEmail("");
  };

  return (
    <AuthContext.Provider value={{ userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};