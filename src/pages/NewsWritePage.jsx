import React, { useState } from 'react';
import './NewsWritePage.css';
import { firestore } from '../firebase/firebase';
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import uniqid from 'uniqid';

const NewsWritePage = () => {
    // State for form inputs
    const [formData, setFormData] = useState({
        heading: '',
        description: '',
        category: '',
    });

    const [isformsubmitted, SetIsFormSubmitted] = useState(false);

    // Function to handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(firestore, "news"), {
                id: uniqid(),
                heading: formData.heading,
                desc: formData.description,
                category: formData.category,
                date: new Date(),
                timestamp: serverTimestamp(),
            });
            // Reset form data
            setFormData({
                heading: '',
                description: '',
                category: ''
            });
            SetIsFormSubmitted(true);

        }
        catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="form-container">
            <h2>Add recent News</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="heading">Heading:</label>
                    <input
                        type="text"
                        id="heading"
                        name="heading"
                        value={formData.heading}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <textarea
                        type="text"
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="category">Category:</label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <button type="submit">Submit</button>
                {isformsubmitted && (
                    <div>
                        <p style={{ color: 'green', fontSize: '18px' }}>The News is uploaded !!</p>
                    </div>
                )
                }
            </form>
        </div>
    );
};

export default NewsWritePage;
