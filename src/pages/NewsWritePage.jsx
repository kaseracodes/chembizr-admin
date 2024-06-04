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
        date: ''
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
                date: formData.date,
                timestamp: serverTimestamp(),
            });
            // Reset form data
            setFormData({
                heading: '',
                description: '',
                category: '',
                date: ''
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
                    <label htmlFor="date">Date:</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
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
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Category</option>
                        <option value="Adhesives and Sealants">Adhesives and Sealants</option>
                        <option value="Animal Feed and Nutrition">Animal Feed and Nutrition</option>
                        <option value="Composites">Composites</option>
                        <option value="Construction">Construction</option>
                        <option value="Clean Energy And Resources">Clean Energy And Resources</option>
                        <option value="Food and Nutrition">Food and Nutrition</option>
                        <option value="Microbials">Microbials</option>
                        <option value="Mobility">Mobility</option>
                        <option value="Paints & Coating">Paints & Coating</option>
                        <option value="Personal Care & Cosmetics">Personal Care & Cosmetics</option>
                        <option value="Petrochemicals & Downstream">Petrochemicals & Downstream</option>
                        <option value="Speciality Polymers">Speciality Polymers</option>
                        <option value="Surfactants">Surfactants</option>
                        <option value="Plastic Additives and Plasticizers">Plastic Additives and Plasticizers</option>
                    </select>
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
