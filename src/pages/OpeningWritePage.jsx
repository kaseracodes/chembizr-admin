import React, { useState } from 'react';
import './OpeningWritePage.css';
import { firestore } from '../firebase/firebase';
import { addDoc, collection } from "firebase/firestore";
import uniqid from 'uniqid';

const OpeningWritePage = () => {
    // State for form inputs
    const [formData, setFormData] = useState({
        name: '',
        overview: '',
        responsibilities: '',
        requiredQualifications: '',
        additionalQualifications: '',
        gform: '',
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
            await addDoc(collection(firestore, "job_openings"), {
                id: uniqid(),
                name: formData.name,
                overview: formData.overview,
                responsibilities: formData.responsibilities,
                requiredQualifications: formData.requiredQualifications,
                additionalQualifications: formData.additionalQualifications,
                gform: formData.gform,
                date: formData.date,
            });
            // Reset form data
            setFormData({
                name: '',
                overview: '',
                responsibilities: '',
                requiredQualifications: '',
                additionalQualifications: '',
                gform: '',
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
            <h2>Create a New Job Opening</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Job Role:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
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
                    <label htmlFor="overview">Job Description:</label>
                    <input
                        type="text"
                        id="overview"
                        name="overview"
                        value={formData.overview}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="responsibilities">Responsibilities:</label>
                    <textarea
                        type="text"
                        id="responsibilities"
                        name="responsibilities"
                        value={formData.responsibilities}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="requiredQualifications">Required Qualifications:</label>
                    <textarea
                        type="text"
                        id="requiredQualifications"
                        name="requiredQualifications"
                        value={formData.requiredQualifications}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="additionalQualifications">Additional Qualifications:</label>
                    <textarea
                        type="text"
                        id="additionalQualifications"
                        name="additionalQualifications"
                        value={formData.additionalQualifications}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="gform">Add Link to Google Form:</label>
                    <input
                        type="text"
                        id="gform"
                        name="gform"
                        value={formData.gform}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <button type="submit">Submit</button>
                {isformsubmitted && (
                    <div>
                        <p style={{ color: 'green', fontSize: '18px' }}>The Job Opening is uploaded !!</p>
                    </div>
                )
                }
            </form>
        </div>
    );
};

export default OpeningWritePage;
