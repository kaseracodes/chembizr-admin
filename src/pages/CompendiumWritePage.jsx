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
        subheading: '',
        category: '',
        pdf: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [imgError, setImgError] = useState(false);
    const [logoImgError, setLogoImgError] = useState(false);
    const [content, SetContent] = useState('');
    const [firebaseImageUrl, SetFirebaseImageUrl] = useState('');
    const [logoimageFile, SetLogoImageFile] = useState(null);
    const [isimguploading, SetIsImageUploading] = useState(false);
    const [isbgimguploading, SetIsBgImageUploading] = useState(false);
    const [isformsubmitted, SetIsFormSubmitted] = useState(false);
    const fileRef = useRef(null);
    const bgfileRef = useRef(null);
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

    // Function to handle background image file selection
    const handleLogoImageChange = (e) => {
        if (e.target.files && e.target.files[0] && e.target.files[0].name) {
            const fileName = e.target.files[0].name;
            const fileTypeArray = fileName.split(".");
            const fileMimeType = fileTypeArray[fileTypeArray.length - 1];
            if (fileMimeType === "JPG" || fileMimeType === "jpg" || fileMimeType === "PNG" || fileMimeType === "png" || fileMimeType === "jfif" || fileMimeType === "JFIF" || fileMimeType === "JPEG" || fileMimeType === "jpeg") {
                setLogoImgError(false);
                const reader = new FileReader();
                if (e.target.files[0]) {
                    reader.readAsDataURL(e.target.files[0]);
                }
                reader.onload = (readerEvent) => {
                    const uploadedFile = e.target.files[0];
                    SetLogoImageFile(uploadedFile);
                    console.log(uploadedFile); // Log uploadedFile directly
                };
            } else {
                setLogoImgError(true);
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
            const filePath = `assets/${logoimageFile.name}`;
            const folderRef = ref_storage(storage, filePath);
            const uploadedFile = uploadBytesResumable(folderRef, logoimageFile);
            uploadedFile.on(
                "state_changed",
                (snapshot) => {
                    // Progress tracking if needed
                    SetIsBgImageUploading(true);
                    console.log('snapshot: ', snapshot);
                },
                (error) => {
                    console.log(error);
                },
                async () => {
                    try {
                        const downloadUrl = await getDownloadURL(uploadedFile.snapshot.ref);
                        console.log(downloadUrl);
                        await addDoc(collection(firestore, "compendiums"), {
                            id: uniqid(),
                            heading: formData.heading,
                            description: content,
                            category: formData.category,
                            date: new Date(),
                            logoPath: downloadUrl,
                            timestamp: serverTimestamp()
                        });
                        // Reset form data
                        setFormData({
                            heading: '',
                            description: '',
                            category: ''
                        });
                        // Reset imageFile and imgError states
                        setImageFile(null);
                        SetContent('');
                        setLogoImgError(false);
                        fileRef.current.value = '';
                        bgfileRef.current.value = '';
                        setImgError(false);
                        SetIsBgImageUploading(false);
                        SetIsFormSubmitted(true);

                    }
                    catch (error) {
                        console.error("Error getting download URL:", error);
                    }
                }
            );
        }
        catch (error) {
            console.error("Error uploading image:", error);
        }
    }

    return (
        <div className="form-container">
            <h2>Create a New Compendium</h2>
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
                    <label htmlFor="subheading">Sub Heading:</label>
                    <input
                        type="text"
                        id="subheading"
                        name="subheading"
                        value={formData.subheading}
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
                    <input
                        type="text"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="pdf">Enter Pdf Link:</label>
                    <input
                        type="text"
                        id="pdf"
                        name="pdf"
                        value={formData.pdf}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="imageFile">Upload Image from device to generate URL:</label>
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
                        <div>
                            <input type="text" value={firebaseImageUrl} readOnly />
                            <button onClick={handleURLFetchSubmit} type="button">Fetch URL</button>
                        </div>
                    )}
                    {isimguploading && (
                            <div>
                                <p style={{ color: 'red', fontSize: '18px' }}>Image is being uploaded...</p>
                            </div>
                        )
                    }

                    <h6 className="imgError"> {imgError && "Sorry, only jpg/jpeg/png/jfif images are allowed"} </h6>

                </div>
                <div className="form-group">
                    <label htmlFor="logoimageFile">Upload Image:</label>
                    <input
                        type="file"
                        id="logoimageFile"
                        name="logoimageFile"
                        src={logoimageFile}
                        accept="image/jpeg, image/png"
                        ref={bgfileRef}
                        onChange={handleLogoImageChange}
                        required
                    />
                    {isbgimguploading && (
                            <div>
                                <p style={{ color: 'red', fontSize: '18px' }}>Image is being uploaded...</p>
                            </div>
                        )
                    }
                     <h6 className="imgError"> {logoImgError && "Sorry, only jpg/jpeg/png/jfif images are allowed"} </h6>
                </div>
                <button type="submit">Submit</button>
                {isformsubmitted && (
                        <div>
                            <p style={{ color: 'green', fontSize: '18px' }}>The Compendium is uploaded !!</p>
                        </div>
                    )
                }
            </form>
        </div>
    );
};

export default EventWritePage;
