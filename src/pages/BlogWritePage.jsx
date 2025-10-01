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
        date: '',
        // Add SEO metadata fields
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        ogTitle: '',
        ogDescription: '',
        twitterTitle: '',
        twitterDescription: ''
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
                SetIsBgImageUploading(true);
                console.log('snapshot: ', snapshot);
            },
            (error) => {
                console.log(error);
            },
            async () => {
                try {
                    const downloadUrl = await getDownloadURL(uploadedFile.snapshot.ref);
                    const blogId = uniqid();
                    const blogRoute = `/blog/${blogId}`;

                    // Save blog data (existing logic)
                    await addDoc(collection(firestore, "blogs"), {
                        id: blogId,
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

                    // NEW: Save metadata in separate collection
                    await addDoc(collection(firestore, "metadata"), {
                        route: blogRoute,
                        blogId: blogId,
                        metaTitle: formData.metaTitle || formData.heading,
                        metaDescription: formData.metaDescription || formData.short,
                        metaKeywords: formData.metaKeywords,
                        ogTitle: formData.ogTitle || formData.heading,
                        ogDescription: formData.ogDescription || formData.short,
                        ogImage: downloadUrl,
                        ogUrl: `${window.location.origin}${blogRoute}`,
                        twitterTitle: formData.twitterTitle || formData.heading,
                        twitterDescription: formData.twitterDescription || formData.short,
                        twitterImage: downloadUrl,
                        twitterCard: "summary_large_image",
                        author: formData.author,
                        publishedDate: formData.date,
                        createdAt: serverTimestamp()
                    });

                    // Reset form data (update to include new fields)
                    setFormData({
                        heading: '',
                        author: '',
                        description: '',
                        short: '',
                        category: '',
                        pagetype: '',
                        insighttype: '',
                        isspotlight: '',
                        date: '',
                        metaTitle: '',
                        metaDescription: '',
                        metaKeywords: '',
                        ogTitle: '',
                        ogDescription: '',
                        twitterTitle: '',
                        twitterDescription: ''
                    });
                    
                    // Reset other states (existing logic)
                    setImageFile(null);
                    SetContent('');
                    setBgImgError(false);
                    fileRef.current.value = '';
                    bgfileRef.current.value = '';
                    setImgError(false);
                    SetIsBgImageUploading(false);
                    SetIsFormSubmitted(true);

                } catch (error) {
                    console.error("Error saving blog and metadata:", error);
                }
            }
        );
    } catch (error) {
        console.error("Error uploading image:", error);
    }
};

// Add this function before your return statement
const generateSEOPreview = () => {
    const title = formData.metaTitle || formData.heading || 'Blog Title';
    const description = formData.metaDescription || formData.short || 'Blog description';
    
    return (
        <div style={{
            marginTop: '15px', 
            padding: '15px', 
            border: '1px solid #e1e5e9', 
            borderRadius: '8px',
            backgroundColor: '#f8f9fa'
        }}>
            <h4 style={{color: '#1a0dab', fontSize: '18px', margin: '0 0 5px 0'}}>
                {title}
            </h4>
            <p style={{color: '#006621', fontSize: '14px', margin: '0 0 5px 0'}}>
                {window.location.origin}/blog/your-blog-id
            </p>
            <p style={{color: '#545454', fontSize: '13px', margin: '0'}}>
                {description.length > 160 ? description.substring(0, 160) + '...' : description}
            </p>
        </div>
    );
};


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
                        <option value="Adhesives & Sealants">Adhesives & Sealants</option>
                        <option value="Animal Feed & Nutrition">Animal Feed & Nutrition</option>
                        <option value="Composites">Composites</option>
                        <option value="Construction">Construction</option>
                        <option value="Clean Energy & Resources">Clean Energy & Resources</option>
                        <option value="Food, Nutrition & Beverages">Food, Nutrition & Beverages</option>
                        <option value="Alternative Food">Alternative Food</option>
                        <option value="Microbials">Microbials</option>
                        <option value="Mobility">Mobility</option>
                        <option value="Petrochemicals & Downstream">Petrochemicals & Downstream</option>
                        <option value="Paints & Coatings">Paints & Coatings</option>
                        <option value="Personal Care & Cosmetics">Personal Care & Cosmetics</option>
                        <option value="Specialty Polymers">Specialty Polymers</option>
                        <option value="Surfactants">Surfactants</option>
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
                {/* Add this section before the submit button */}
<fieldset style={{marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px'}}>
    <legend style={{fontWeight: 'bold', fontSize: '18px'}}>SEO Meta Tags (Optional)</legend>
    
    <div className="form-group">
        <label htmlFor="metaTitle">Meta Title:</label>
        <input
            type="text"
            id="metaTitle"
            name="metaTitle"
            value={formData.metaTitle}
            onChange={handleInputChange}
            placeholder="Leave empty to use blog heading"
            maxLength="60"
        />
        <small style={{color: '#666', fontSize: '12px'}}>
            Recommended: 50-60 characters. Current: {formData.metaTitle.length}/60
        </small>
    </div>

    <div className="form-group">
        <label htmlFor="metaDescription">Meta Description:</label>
        <textarea
            id="metaDescription"
            name="metaDescription"
            value={formData.metaDescription}
            onChange={handleInputChange}
            placeholder="Leave empty to use short description"
            maxLength="160"
            rows="3"
        />
        <small style={{color: '#666', fontSize: '12px'}}>
            Recommended: 150-160 characters. Current: {formData.metaDescription.length}/160
        </small>
    </div>

    <div className="form-group">
        <label htmlFor="metaKeywords">Meta Keywords:</label>
        <input
            type="text"
            id="metaKeywords"
            name="metaKeywords"
            value={formData.metaKeywords}
            onChange={handleInputChange}
            placeholder="keyword1, keyword2, keyword3"
        />
        <small style={{color: '#666', fontSize: '12px'}}>
            Comma-separated list of relevant keywords
        </small>
    </div>
</fieldset>

<fieldset style={{marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px'}}>
    <legend style={{fontWeight: 'bold', fontSize: '18px'}}>Social Media Sharing (Optional)</legend>
    
    <h4 style={{marginBottom: '15px', color: '#4267B2'}}>Facebook / Open Graph</h4>
    <div className="form-group">
        <label htmlFor="ogTitle">Open Graph Title:</label>
        <input
            type="text"
            id="ogTitle"
            name="ogTitle"
            value={formData.ogTitle}
            onChange={handleInputChange}
            placeholder="Leave empty to use blog heading"
        />
    </div>

    <div className="form-group">
        <label htmlFor="ogDescription">Open Graph Description:</label>
        <textarea
            id="ogDescription"
            name="ogDescription"
            value={formData.ogDescription}
            onChange={handleInputChange}
            placeholder="Leave empty to use short description"
            rows="3"
        />
    </div>

    <h4 style={{marginBottom: '15px', marginTop: '20px', color: '#1DA1F2'}}>Twitter Cards</h4>
    <div className="form-group">
        <label htmlFor="twitterTitle">Twitter Title:</label>
        <input
            type="text"
            id="twitterTitle"
            name="twitterTitle"
            value={formData.twitterTitle}
            onChange={handleInputChange}
            placeholder="Leave empty to use blog heading"
        />
    </div>

    <div className="form-group">
        <label htmlFor="twitterDescription">Twitter Description:</label>
        <textarea
            id="twitterDescription"
            name="twitterDescription"
            value={formData.twitterDescription}
            onChange={handleInputChange}
            placeholder="Leave empty to use short description"
            rows="3"
        />
    </div>
</fieldset>

                <button type="submit">Submit</button>
                {isformsubmitted && (
                    <div>
                        <p style={{ color: 'green', fontSize: '18px' }}>The blog is uploaded !!</p>
                    </div>
                )
                }
                
            </form>
            {/* Add this after the SEO fieldset */}
{(formData.heading || formData.metaTitle) && (
    <div style={{marginTop: '20px'}}>
        <h3>SEO Preview:</h3>
        <p style={{fontSize: '14px', color: '#666', marginBottom: '10px'}}>
            This is how your blog will appear in Google search results:
        </p>
        {generateSEOPreview()}
    </div>
)}

        </div>
    );
};

export default BlogWritePage;
