import React, { useState, useRef } from 'react';
import './EventWritePage.css';
import { firestore, storage } from '../firebase/firebase';
import { getDownloadURL } from "firebase/storage";
import { ref as ref_storage, uploadBytesResumable } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import uniqid from 'uniqid';
import JoditEditor from 'jodit-react';

const EventWritePage = () => {
    // State for form inputs
    const [formData, setFormData] = useState({
        heading: '',
        description: '',
        category: '',
        date: '',
        images: []
    });

    const [imageFile, setImageFile] = useState(null);
    const [imgError, setImgError] = useState(false);
    const [imageUrls,setImageUrls] = useState([]);
    const [content, SetContent] = useState('');
    const [firebaseImageUrl, SetFirebaseImageUrl] = useState('');
    const [isimguploading, SetIsImageUploading] = useState(false);
    const [isformsubmitted, SetIsFormSubmitted] = useState(false);
    const fileRef = useRef(null);
    const editor = useRef(null);


    // Function to handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Function to handle image file selection
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0] && e.target.files[0].name) {
            const fileName = e.target.files[0].name;
            const fileTypeArray = fileName.split(".");
            const fileMimeType = fileTypeArray[fileTypeArray.length - 1];
            if (fileMimeType === "JPG" || fileMimeType === "jpg" || fileMimeType === "PNG" || fileMimeType === "png" || fileMimeType === "jfif" || fileMimeType === "JFIF" || fileMimeType === "JPEG" || fileMimeType === "jpeg") {
                setImgError(false);
                const reader = new FileReader();
                if (e.target.files[0]) {
                    reader.readAsDataURL(e.target.files[0]);
                }
                reader.onload = (readerEvent) => {
                    const uploadedFile = e.target.files[0];
                    setImageFile(uploadedFile);
                    console.log(uploadedFile); // Log uploadedFile directly
                };
            } else {
                setImgError(true);
                return;
            }
        }
    };


    const handleURLFetchSubmit = async (e) => {
        e.preventDefault();

        // Check if imageFile is null (no image selected)
        if (!imageFile) {
            setImgError(true);
            return; // Exit function early since no image is selected
        }

        // If image is selected, proceed with image upload
        try {

            const filePath = `assets/${imageFile.name}`;
            const folderRef = ref_storage(storage, filePath);
            const uploadedFile = uploadBytesResumable(folderRef, imageFile);
            uploadedFile.on(
                "state_changed",
                (snapshot) => {
                    SetIsImageUploading(true);
                    // Progress tracking if needed
                    console.log('snapshot: ', snapshot);
                },
                (error) => {
                    console.log(error);
                },
                async () => {
                    try {
                        const downloadUrl = await getDownloadURL(uploadedFile.snapshot.ref);
                        console.log(downloadUrl);
                        SetFirebaseImageUrl(downloadUrl);
                        setImgError(false);
                        SetIsImageUploading(false);

                        setImageUrls((prevUrls) => [...prevUrls, downloadUrl]);
                    } catch (error) {
                        console.error("Error getting download URL:", error);
                    }
                }

            );
        } catch (error) {
            console.error("Error uploading image:", error);
        }

    }

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Create a new document in the "events" collection with the form data
            await addDoc(collection(firestore, "events"), {
                id: uniqid(),
                heading: formData.heading,
                description: content,
                category: formData.category,
                date: formData.date,
                images: imageUrls,
                timestamp: serverTimestamp()
            });
    
            // Reset form data
            setFormData({
                heading: '',
                author: '',
                description: '',
                category: '',
                date: '',
                images: []
            });
    
            // Reset imageFile and imgError states
            setImageFile(null);
            SetContent('');
            fileRef.current.value = '';
            setImgError(false);
            setImageUrls([]);
            SetIsFormSubmitted(true);
    
        } catch (error) {
            console.error("Error adding document to Firestore:", error);
        }
    };

    return (
        <div className="form-container">
            <h2>Create a New Event</h2>
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
                    <JoditEditor
                        id="description"
                        name="description"
                        ref={editor}
                        value={content}
                        onChange={newContent => {
                            SetContent(newContent)
                            console.log(newContent)
                        }}
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
                        <option value="Food, Nutrition & Beverages">Food, Nutrition & Beverages</option>
                        <option value="Microbials">Microbials</option>
                        <option value="Mobility">Mobility</option>
                        <option value="Petrochemicals & Downstream">Petrochemicals & Downstream</option>
                        <option value="Paints & Coating">Paints & Coating</option>
                        <option value="Personal Care & Cosmetics">Personal Care & Cosmetics</option>
                        <option value="Petrochemicals & Downstream">Petrochemicals & Downstream</option>
                        <option value="Speciality Polymers">Speciality Polymers</option>
                        <option value="Surfactants">Surfactants</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="imageFile">Upload Image from Device:</label>
                    <input
                        type="file"
                        id="imageFile"
                        name="imageFile"
                        src={imageFile}
                        accept="image/jpeg, image/png"
                        ref={fileRef}
                        onChange={handleImageChange}
                    />
                    {imageFile && (
                        
                            <button onClick={handleURLFetchSubmit} type="button">Upload</button>
                        
                    )}
                    {isimguploading && (
                        <div>
                            <p style={{ color: 'red', fontSize: '18px' }}>Image is being uploaded...</p>
                        </div>
                    )
                    }

                    <h6 className="imgError"> {imgError && "Sorry, only jpg/jpeg/png/jfif images are allowed"} </h6>

                </div>
            
                <button type="submit">Submit</button>
                {isformsubmitted && (
                    <div>
                        <p style={{ color: 'green', fontSize: '18px' }}>The Event is uploaded !!</p>
                    </div>
                )
                }
            </form>
        </div>
    );
};

export default EventWritePage;
