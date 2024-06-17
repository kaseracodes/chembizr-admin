import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { useAuth } from '../contexts/authContext';
import { Navigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { doSignOut } from '../firebase/auth';
import { firestore, auth } from '../firebase/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const HomePage = () => {
    const { userLoggedIn } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const handleLogoutClick = async () => {
        await doSignOut();
    };

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userEmail = user.email;
                console.log(userEmail);

                // Check if the user email exists in the "admins" collection
                const q = query(collection(firestore, "admins"), where("user", "==", userEmail));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }

                setLoading(false);
            } else {
                setIsAdmin(false);
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    if (loading) {
        return (
            <div>
                <h1>Loading...</h1>
            </div>
        );
    }

    return (
        <div className="home-container">
            {!userLoggedIn && (<Navigate to={'/login'} replace={true} />)}
            {isAdmin ? (
                <div className="tabs-container">
                    <div className="tab"><Link to="/writeblog">Add Blogs</Link></div>
                    <div className="tab"><Link to="/writeevent">Add Events</Link></div>
                    <div className="tab"><Link to="/writenews">Add News</Link></div>
                    <div className="tab"><Link to="/writeopening">Add Job Openings</Link></div>
                    <div className="tab"><Link to="/writecompendium">Add Compendiums</Link></div>
                    <div className="tab"><Link to="/comments">View Comments on Events</Link></div>
                    <div className="tab"><Link to="/queries">View Queries</Link></div>
                    <div className="tab"><Link to="/subscribers">View Subscribers</Link></div>
                    <div className="tab"><Link to="/banners">Change Banners</Link></div>
                    {userLoggedIn && (
                        <button onClick={handleLogoutClick}>Logout</button>
                    )}
                </div>
            ) : (
                <div>
                    <p>You are not an admin!!</p>
                    {userLoggedIn && (
                    <button onClick={handleLogoutClick}>Logout</button>
                )}
                </div>
            )}
        </div>
    );
};

export default HomePage;
