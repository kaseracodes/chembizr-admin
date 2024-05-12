// SignupPage.js

import React, { useState } from 'react';
import './SignUpPage.css';
import { doCreateUserWithEmailAndPassword } from '../firebase/auth';
import { Navigate } from "react-router-dom";

const SignUpPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleConfirmPasswordChange = (event) => {
        setConfirmPassword(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        // Email validation using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?#&]{8,}$/;
        if (!passwordRegex.test(password)) {
            setError(
                'Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 symbol, 1 digit, and be at least 8 characters long'
            );
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        console.log("Hi");
        if (!isRegistered) {
            console.log("Hello");
            await doCreateUserWithEmailAndPassword(email, password).then(
                () => {
                    setIsRegistered(true);
                }
            )
                .catch(
                    (err) => {
                        console.log(err);
                        setError("Email is already in use !!");
                    }
                )
        }
    };

    return (
        <div className="signup-container">
            {isRegistered && (<Navigate to={'/login'} replace={true} />)}
            <form className="signup-form" onSubmit={handleSubmit}>
                <h2>Sign Up</h2>
                
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
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
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        required
                    />
                </div>
                <button type="submit">Sign Up</button>
                {error && <div className="error">{error}</div>}
            </form>
        </div>
    );
};

export default SignUpPage;
