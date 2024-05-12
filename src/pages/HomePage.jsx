// HomePage.js

import React from 'react';
import './HomePage.css';
import { useAuth } from '../contexts/authContext';
import { Navigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { doSignOut } from '../firebase/auth';

const HomePage = () => {
    const { userLoggedIn } = useAuth();
    const handleLogoutClick = async () => {
        await doSignOut();
    };
    return (
        <div className="home-container">
            {!userLoggedIn && (<Navigate to={'/login'} replace={true} />)}
            <div className="tabs-container">
                <div className="tab"><Link to="/writeblog">Add Blogs</Link></div>
                <div className="tab"><Link to="/writeevent">Add Events</Link></div>
                <div className="tab"><Link to="/writenews">Add News</Link></div>
                <div className="tab"><Link to="/writeopening">Add Job Openings</Link></div>
                <div className="tab"><Link to="/writecompendium">Add Compendiums</Link></div>
                {userLoggedIn && (
                    <button onClick={handleLogoutClick}>Logout</button>
                )}
            </div>
        </div>
    );
};

export default HomePage;
