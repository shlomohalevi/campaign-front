

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {login, logOut} from '../requests/ApiRequests';
import Spinner from './Spinner';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // true until we check with backend




  // // ✅ Secure login: backend sets HttpOnly cookie
  const loginUser = async (credentials) => {

     try
     {
      const res = await login(credentials);
      console.log(res);
      setUser(res.data.user);
      return res;
     }
     catch(err)
     {
      setUser(null);
      throw err
     }
  };

  // ✅ Secure logout: backend clears cookie
  const logoutUser = async () => {
    try {
     const res =  await logOut();
     console.log(res);
    } catch (error) {
      throw error
      console.error(error);
    }
    setUser(null);


  };

  if (loading) return <Spinner />;

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}





// import React, { createContext, useContext, useState, useEffect } from 'react';
// import Spinner from './Spinner';

// // 1. Create a context to hold our auth data.
// const AuthContext = createContext(null);

// // 2. Define a provider component that holds and provides auth state to the app.
// export function AuthProvider({ children }) {
//   // Initialize state directly from session storage
//   const [user, setUser] = useState(() => {
//     const storedUser = sessionStorage.getItem('user');
//     return storedUser ? JSON.parse(storedUser) : null;
//   });

//   const [token, setToken] = useState(() => sessionStorage.getItem('token') || null);
//   const [loading, setLoading] = useState(false);

//   // Sync state with session storage if it changes later
//   useEffect(() => {
//     setLoading(true);

//     const storedToken = sessionStorage.getItem('token');
//     const storedUser = sessionStorage.getItem('user');

//     if (storedToken) setToken(storedToken);
//     if (storedUser) setUser(JSON.parse(storedUser));

//     setLoading(false);
//   }, []);

//   // Login function saves the token and user data.
//   const loginUser = (token, userData) => {
//     setToken(token);
//     setUser(userData);

//     sessionStorage.setItem('token', token);
//     sessionStorage.setItem('user', JSON.stringify(userData));
//   };

//   // Logout function clears the token and user data.
//   const logoutUser = () => {
//     setToken(null);
//     setUser(null);

//     sessionStorage.removeItem('token');
//     sessionStorage.removeItem('user');
//   };

//   // If loading, return a loading indicator
//   if (loading) {
//     return <Spinner />;
//   }

//   // 3. Return the provider component, sharing user, token, and login/logout functions.
//   return (
//     <AuthContext.Provider value={{ user, token, loginUser, logoutUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// // Helper hook to use our AuthContext in any component.
// export function useAuth() {
//   return useContext(AuthContext);
// }
