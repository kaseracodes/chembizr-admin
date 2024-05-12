// LoginPage.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css';
import { doSignInWithEmailAndPassword } from "../firebase/auth";
import { useAuth } from '../contexts/authContext';
import { Navigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { userLoggedIn } = useAuth();
  const [isSigningIn,setIsSigningIn] = useState(false);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if(!isSigningIn) {
        await doSignInWithEmailAndPassword(email, password).then(
          () => {
            setIsSigningIn(true);
          }
        )
          .catch(
            (err) => {
              console.log(err);
              setError("Please check the credentials again !!");
            }
          )
      }
  };

  return (
    <div className="login-container">
    {userLoggedIn && (<Navigate to={'/'} replace={true}/>)}
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>
        <button type="submit">Login</button>
        <div className="signup-link">
        Don't have an account? <Link to="/signup">Sign Up Here</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
