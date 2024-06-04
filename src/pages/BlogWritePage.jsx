import React, { useState, useRef } from 'react';
import './BlogWritePage.css';
import { firestore, storage } from '../firebase/firebase';
import { getDownloadURL } from "firebase/storage";
import { ref as ref_storage, uploadBytesResumable } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import uniqid from 'uniqid';
import JoditEditor from 'jodit-react';

const BlogWritePage = () => {
    // State for form inputs
    const [formData, setFormData] = useState({
        heading: '',
        author: '',
        description: '',
        short: '',
        category: '',
        pagetype: '',
        insighttype: '',
        isspotlight: '',
        date: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [imgError, setImgError] = useState(false);
    const [bgimgError, setBgImgError] = useState(false);
    const [content, SetContent] = useState('');
    const [firebaseImageUrl, SetFirebaseImageUrl] = useState('');
    const [bgimageFile, SetBgImageFile] = useState(null);
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
    const handleBgImageChange = (e) => {
        if (e.target.files && e.target.files[0] && e.target.files[0].name) {
            const fileName = e.target.files[0].name;
            const fileTypeArray = fileName.split(".");
            const fileMimeType = fileTypeArray[fileTypeArray.length - 1];
            if (fileMimeType === "JPG" || fileMimeType === "jpg" || fileMimeType === "PNG" || fileMimeType === "png" || fileMimeType === "jfif" || fileMimeType === "JFIF" || fileMimeType === "JPEG" || fileMimeType === "jpeg") {
                setBgImgError(false);
                const reader = new FileReader();
                if (e.target.files[0]) {
                    reader.readAsDataURL(e.target.files[0]);
                }
                reader.onload = (readerEvent) => {
                    const uploadedFile = e.target.files[0];
                    SetBgImageFile(uploadedFile);
                    console.log(uploadedFile); // Log uploadedFile directly
                };
            } else {
                setBgImgError(true);
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
            const filePath = `assets/${bgimageFile.name}`;
            const folderRef = ref_storage(storage, filePath);
            const uploadedFile = uploadBytesResumable(folderRef, bgimageFile);
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
                        await addDoc(collection(firestore, "blogs"), {
                            id: uniqid(),
                            heading: formData.heading,
                            author: formData.author,
                            description: content,
                            short: formData.short,
                            category: formData.category,
                            pagetype: formData.pagetype,
                            insighttype: formData.insighttype,
                            isspotlight: formData.isspotlight,
                            date: formData.date,
                            image: downloadUrl,
                            timestamp: serverTimestamp(),
                            comments: []
                        });
                        // Reset form data
                        setFormData({
                            heading: '',
                            author: '',
                            description: '',
                            short: '',
                            category: '',
                            pagetype: '',
                            insighttype: '',
                            isspotlight: '',
                            date: ''
                        });
                        // Reset imageFile and imgError states
                        setImageFile(null);
                        SetContent('');
                        setBgImgError(false);
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
            <h2>Create a New Blog</h2>
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
                    <label htmlFor="author">Author:</label>
                    <input
                        type="text"
                        id="author"
                        name="author"
                        value={formData.author}
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
                        }}
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
                    <label htmlFor="short">Short Description:</label>
                    <textarea
                        type="text"
                        id="short"
                        name="short"
                        value={formData.short}
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
                        <option value="">Select a category</option>
                        <option value="Programming">Programming</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Technology">Technology</option>
                        <option value="Self Improvement">Self Improvement</option>
                        <option value="Writing">Writing</option>
                        <option value="Relationships">Relationships</option>
                        <option value="Machine Learning">Machine Learning</option>
                        <option value="Productivity">Productivity</option>
                        <option value="Politics">Politics</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="pagetype">Page Type:</label>
                    <select
                        id="pagetype"
                        name="pagetype"
                        value={formData.pagetype}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Page Type</option>
                        <option value="Food, Nutrition & Beverages">Food, Nutrition & Beverages</option>
                        <option value="Speciality Chemicals and Polymers">Speciality Chemicals and Polymers</option>
                        <option value="Petrochemicals & Downstream">Petrochemicals & Downstream</option>
                        <option value="Clean Energy & Storage">Clean Energy & Storage</option>
                        <option value="Mobility">Mobility</option>
                        <option value="Personal Care & Cosmetics">Personal Care & Cosmetics</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="insighttype">Insight Type:</label>
                    <select
                        id="insighttype"
                        name="insighttype"
                        value={formData.insighttype}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Page Type</option>
                        <option value="Publication">Publication</option>
                        <option value="Article">Article</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="isspotlight">Should this be kept in SpotLight?</label>
                    <select
                        id="isspotlight"
                        name="isspotlight"
                        value={formData.isspotlight}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select an option</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="bgimageFile">Upload Blog Banner Image:</label>
                    <input
                        type="file"
                        id="bgimageFile"
                        name="bgimageFile"
                        src={bgimageFile}
                        accept="image/jpeg, image/png"
                        ref={bgfileRef}
                        onChange={handleBgImageChange}
                        required
                    />
                    {isbgimguploading && (
                        <div>
                            <p style={{ color: 'red', fontSize: '18px' }}>Image is being uploaded...</p>
                        </div>
                    )
                    }
                    <h6 className="imgError"> {bgimgError && "Sorry, only jpg/jpeg/png/jfif images are allowed"} </h6>
                </div>
                <button type="submit">Submit</button>
                {isformsubmitted && (
                    <div>
                        <p style={{ color: 'green', fontSize: '18px' }}>The blog is uploaded !!</p>
                    </div>
                )
                }
            </form>
        </div>
    );
};

export default BlogWritePage;
