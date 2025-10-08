// src/pages/BlogEditPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import './BlogEditPage.css'; // Separate CSS file for this page
import { firestore, storage } from '../firebase/firebase';
import { getDownloadURL } from "firebase/storage";
import { ref as ref_storage, uploadBytesResumable } from "firebase/storage";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import JoditEditor from 'jodit-react';

const BlogEditPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [displayedBlogs, setDisplayedBlogs] = useState([]);
    const [editingBlog, setEditingBlog] = useState(null);
    const [loading, setLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);

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

    useEffect(() => {
        fetchBlogs();
    }, []);

    // Handle search and display logic
    useEffect(() => {
        if (searchTerm.trim()) {
            const filtered = blogs
                .filter(blog => 
                    blog.heading.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    blog.category.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .slice(0, 6);
            setDisplayedBlogs(filtered);
        } else {
            // Show most recent 6 blogs by default
            setDisplayedBlogs(blogs.slice(0, 6));
        }
    }, [searchTerm, blogs]);

    const fetchBlogs = async () => {
        try {
            const querySnapshot = await getDocs(collection(firestore, 'blogs'));
            const blogsData = querySnapshot.docs.map(doc => ({
                docId: doc.id,
                ...doc.data()
            }));
            setBlogs(blogsData.sort((a, b) => new Date(b.date) - new Date(a.date)));
        } catch (error) {
            console.error('Error fetching blogs:', error);
        }
    };

    const handleEditClick = async (blog) => {
        setEditingBlog(blog);
        setLoading(true);

        try {
            // Populate form with blog data
            setFormData({
                heading: blog.heading || '',
                author: blog.author || '',
                description: blog.description || '',
                short: blog.short || '',
                category: blog.category || '',
                pagetype: blog.pagetype || '',
                insighttype: blog.insighttype || '',
                isspotlight: blog.isspotlight || '',
                date: blog.date || '',
                metaTitle: '',
                metaDescription: '',
                metaKeywords: '',
                ogTitle: '',
                ogDescription: '',
                twitterTitle: '',
                twitterDescription: ''
            });

            SetContent(blog.description || '');

            // Check if metadata exists for this blog
            const metadataQuery = query(
                collection(firestore, 'metadata'),
                where('blogId', '==', blog.id)
            );
            const metadataSnapshot = await getDocs(metadataQuery);

            if (!metadataSnapshot.empty) {
                const metadata = metadataSnapshot.docs[0].data();
                setFormData(prev => ({
                    ...prev,
                    metaTitle: metadata.metaTitle || '',
                    metaDescription: metadata.metaDescription || '',
                    metaKeywords: metadata.metaKeywords || '',
                    ogTitle: metadata.ogTitle || '',
                    ogDescription: metadata.ogDescription || '',
                    twitterTitle: metadata.twitterTitle || '',
                    twitterDescription: metadata.twitterDescription || ''
                }));
            }
        } catch (error) {
            console.error('Error fetching blog details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (blog) => {
        setBlogToDelete(blog);
        setDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!blogToDelete) return;

        try {
            setLoading(true);
            
            await deleteDoc(doc(firestore, 'blogs', blogToDelete.docId));
            
            const metadataQuery = query(
                collection(firestore, 'metadata'),
                where('blogId', '==', blogToDelete.id)
            );
            const metadataSnapshot = await getDocs(metadataQuery);
            
            if (!metadataSnapshot.empty) {
                await deleteDoc(doc(firestore, 'metadata', metadataSnapshot.docs[0].id));
            }

            await fetchBlogs();
            
            if (editingBlog && editingBlog.id === blogToDelete.id) {
                setEditingBlog(null);
                resetForm();
            }
            
            alert('Blog deleted successfully!');
        } catch (error) {
            console.error('Error deleting blog:', error);
            alert('Error deleting blog. Please try again.');
        } finally {
            setLoading(false);
            setDeleteConfirm(false);
            setBlogToDelete(null);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm(false);
        setBlogToDelete(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0] && e.target.files[0].name) {
            const fileName = e.target.files[0].name;
            const fileTypeArray = fileName.split(".");
            const fileMimeType = fileTypeArray[fileTypeArray.length - 1];
            if (
                fileMimeType === "JPG" ||
                fileMimeType === "jpg" ||
                fileMimeType === "PNG" ||
                fileMimeType === "png" ||
                fileMimeType === "jfif" ||
                fileMimeType === "JFIF" ||
                fileMimeType === "JPEG" ||
                fileMimeType === "jpeg"
            ) {
                setImgError(false);
                const reader = new FileReader();
                if (e.target.files[0]) {
                    reader.readAsDataURL(e.target.files[0]);
                }
                reader.onload = (readerEvent) => {
                    const uploadedFile = e.target.files[0];
                    setImageFile(uploadedFile);
                };
            } else {
                setImgError(true);
                return;
            }
        }
    };

    const handleBgImageChange = (e) => {
        if (e.target.files && e.target.files[0] && e.target.files[0].name) {
            const fileName = e.target.files[0].name;
            const fileTypeArray = fileName.split(".");
            const fileMimeType = fileTypeArray[fileTypeArray.length - 1];
            if (
                fileMimeType === "JPG" ||
                fileMimeType === "jpg" ||
                fileMimeType === "PNG" ||
                fileMimeType === "png" ||
                fileMimeType === "jfif" ||
                fileMimeType === "JFIF" ||
                fileMimeType === "JPEG" ||
                fileMimeType === "jpeg"
            ) {
                setBgImgError(false);
                const reader = new FileReader();
                if (e.target.files[0]) {
                    reader.readAsDataURL(e.target.files[0]);
                }
                reader.onload = (readerEvent) => {
                    const uploadedFile = e.target.files[0];
                    SetBgImageFile(uploadedFile);
                };
            } else {
                setBgImgError(true);
                return;
            }
        }
    };

    const handleURLFetchSubmit = async (e) => {
        e.preventDefault();

        if (!imageFile) {
            setImgError(true);
            return;
        }

        try {
            const filePath = `assets/${imageFile.name}`;
            const folderRef = ref_storage(storage, filePath);
            const uploadedFile = uploadBytesResumable(folderRef, imageFile);
            uploadedFile.on(
                "state_changed",
                (snapshot) => {
                    SetIsImageUploading(true);
                },
                (error) => {
                    console.log(error);
                },
                async () => {
                    try {
                        const downloadUrl = await getDownloadURL(uploadedFile.snapshot.ref);
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!editingBlog) {
            alert('Please select a blog to edit');
            return;
        }

        setLoading(true);

        try {
            let finalImageUrl = editingBlog.image;

            if (bgimageFile) {
                const filePath = `assets/${bgimageFile.name}`;
                const folderRef = ref_storage(storage, filePath);
                const uploadedFile = uploadBytesResumable(folderRef, bgimageFile);
                
                await new Promise((resolve, reject) => {
                    uploadedFile.on(
                        "state_changed",
                        (snapshot) => {
                            SetIsBgImageUploading(true);
                        },
                        (error) => {
                            reject(error);
                        },
                        async () => {
                            try {
                                finalImageUrl = await getDownloadURL(uploadedFile.snapshot.ref);
                                SetIsBgImageUploading(false);
                                resolve();
                            } catch (error) {
                                reject(error);
                            }
                        }
                    );
                });
            }

            const blogDocRef = doc(firestore, 'blogs', editingBlog.docId);
            await updateDoc(blogDocRef, {
                heading: formData.heading,
                author: formData.author,
                description: content,
                short: formData.short,
                category: formData.category,
                pagetype: formData.pagetype,
                insighttype: formData.insighttype,
                isspotlight: formData.isspotlight,
                date: formData.date,
                image: finalImageUrl,
                lastModified: serverTimestamp()
            });

            const blogRoute = `/blog/${editingBlog.id}`;
            const metadataQuery = query(
                collection(firestore, 'metadata'),
                where('blogId', '==', editingBlog.id)
            );
            const metadataSnapshot = await getDocs(metadataQuery);

            const metadataToSave = {
                route: blogRoute,
                blogId: editingBlog.id,
                metaTitle: formData.metaTitle || formData.heading,
                metaDescription: formData.metaDescription || formData.short,
                metaKeywords: formData.metaKeywords,
                ogTitle: formData.ogTitle || formData.heading,
                ogDescription: formData.ogDescription || formData.short,
                ogImage: finalImageUrl,
                ogUrl: `${window.location.origin}${blogRoute}`,
                twitterTitle: formData.twitterTitle || formData.heading,
                twitterDescription: formData.twitterDescription || formData.short,
                twitterImage: finalImageUrl,
                twitterCard: "summary_large_image",
                author: formData.author,
                publishedDate: formData.date,
                updatedAt: serverTimestamp()
            };

            if (!metadataSnapshot.empty) {
                const metadataDocRef = doc(firestore, 'metadata', metadataSnapshot.docs[0].id);
                await updateDoc(metadataDocRef, metadataToSave);
            } else {
                await addDoc(collection(firestore, 'metadata'), {
                    ...metadataToSave,
                    createdAt: serverTimestamp()
                });
            }

            SetIsFormSubmitted(true);
            alert('Blog updated successfully!');
            
            await fetchBlogs();

        } catch (error) {
            console.error("Error updating blog:", error);
            alert('Error updating blog. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
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
        SetContent('');
        setImageFile(null);
        SetBgImageFile(null);
        setImgError(false);
        setBgImgError(false);
        SetFirebaseImageUrl('');
        SetIsFormSubmitted(false);
        if (fileRef.current) fileRef.current.value = '';
        if (bgfileRef.current) bgfileRef.current.value = '';
    };

    const generateSEOPreview = () => {
        const title = formData.metaTitle || formData.heading || 'Blog Title';
        const description = formData.metaDescription || formData.short || 'Blog description';
        const previewUrl = `${window.location.origin}/blog/${editingBlog?.id}`;

        return (
            <div className="seo-preview">
                <h4 className="seo-preview-title">{title}</h4>
                <p className="seo-preview-url">{previewUrl}</p>
                <p className="seo-preview-description">
                    {description.length > 160 ? description.substring(0, 160) + '...' : description}
                </p>
            </div>
        );
    };

    return (
        <div className="blog-edit-container">
            <div className="page-header">
                <h2>Edit Blog Posts</h2>
                <p>Search and edit your published blogs</p>
            </div>
            
            {/* Search Bar */}
            <div className="search-section">
                <input
                    type="text"
                    placeholder="🔍 Search blogs by title, author, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Blog Cards Grid */}
            <div className="blogs-section">
                <h3 className="blogs-section-title">
                    {searchTerm ? `Search Results (${displayedBlogs.length})` : 'Recent Blogs (6)'}
                </h3>
                
                {displayedBlogs.length === 0 ? (
                    <div className="no-blogs">
                        <p>{searchTerm ? `No blogs found matching "${searchTerm}"` : 'No blogs available'}</p>
                    </div>
                ) : (
                    <div className="blogs-grid">
                        {displayedBlogs.map(blog => (
                            <div
                                key={blog.id}
                                className={`blog-card ${editingBlog?.id === blog.id ? 'editing' : ''}`}
                            >
                                {/* Blog Image */}
                                {blog.image && (
                                    <img
                                        src={blog.image}
                                        alt={blog.heading}
                                        className="blog-card-image"
                                    />
                                )}
                                
                                {/* Blog Content */}
                                <div className="blog-card-content">
                                    <h4 className="blog-card-title">{blog.heading}</h4>
                                    
                                    <div className="blog-card-meta">
                                        <span>📝 By {blog.author}</span>
                                        <span>📅 {blog.date}</span>
                                        <span>🏷️ {blog.category}</span>
                                    </div>
                                    
                                    <p className="blog-card-description">{blog.short}</p>
                                    
                                    {/* Action Buttons */}
                                    <div className="blog-card-actions">
                                        <button
                                            onClick={() => handleEditClick(blog)}
                                            className={`edit-btn ${editingBlog?.id === blog.id ? 'editing' : ''}`}
                                            disabled={loading}
                                        >
                                            {editingBlog?.id === blog.id ? '✏️ Editing...' : '✏️ Edit Article'}
                                        </button>
                                        
                                        <button
                                            onClick={() => handleDeleteClick(blog)}
                                            className="delete-btn-small"
                                            title="Delete blog"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            {deleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="modal-title">⚠️ Delete Blog</h3>
                        <p className="modal-text">
                            Are you sure you want to delete this blog?
                            <br/>
                            <strong>"{blogToDelete?.heading}"</strong>
                            <br/>
                            <small>This action cannot be undone.</small>
                        </p>
                        <div className="modal-actions">
                            <button onClick={cancelDelete} className="modal-btn-cancel">
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete} 
                                disabled={loading}
                                className="modal-btn-delete"
                            >
                                {loading ? 'Deleting...' : 'Delete Blog'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Form */}
            {editingBlog && (
                <div className="edit-form-section">
                    <div className="edit-form-header">
                        <h3>✏️ Editing: {editingBlog.heading}</h3>
                        <button
                            onClick={() => {
                                setEditingBlog(null);
                                resetForm();
                            }}
                            className="cancel-edit-btn"
                        >
                            ✕ Cancel
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="edit-form">
                        {/* Basic Fields */}
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

                        <div className="form-row">
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
                        </div>

                        <div className="form-group">
                            <label htmlFor="short">Short Description:</label>
                            <textarea
                                id="short"
                                name="short"
                                value={formData.short}
                                onChange={handleInputChange}
                                required
                                rows="3"
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

                        <div className="form-row">
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
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="insighttype">Insight Type:</label>
                                <select
                                    id="insighttype"
                                    name="insighttype"
                                    value={formData.insighttype}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Type</option>
                                    <option value="Publication">Publication</option>
                                    <option value="Article">Article</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="isspotlight">Spotlight:</label>
                                <select
                                    id="isspotlight"
                                    name="isspotlight"
                                    value={formData.isspotlight}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select option</option>
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="imageFile">Upload Image for URL Generation:</label>
                            <input
                                type="file"
                                id="imageFile"
                                name="imageFile"
                                accept="image/jpeg, image/png"
                                ref={fileRef}
                                onChange={handleImageChange}
                            />
                            {imageFile && (
                                <div className="url-generator">
                                    <input type="text" value={firebaseImageUrl} readOnly />
                                    <button onClick={handleURLFetchSubmit} type="button">Fetch URL</button>
                                </div>
                            )}
                            {isimguploading && <p className="upload-status">Image is being uploaded...</p>}
                            {imgError && <p className="error-message">Sorry, only jpg/jpeg/png/jfif images are allowed</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="bgimageFile">Upload New Blog Banner (Optional):</label>
                            <input
                                type="file"
                                id="bgimageFile"
                                name="bgimageFile"
                                accept="image/jpeg, image/png"
                                ref={bgfileRef}
                                onChange={handleBgImageChange}
                            />
                            {editingBlog && editingBlog.image && (
                                <div className="current-image">
                                    <small>Current image:</small>
                                    <img src={editingBlog.image} alt="Current blog banner" />
                                </div>
                            )}
                            {isbgimguploading && <p className="upload-status">Image is being uploaded...</p>}
                            {bgimgError && <p className="error-message">Sorry, only jpg/jpeg/png/jfif images are allowed</p>}
                        </div>

                        {/* SEO Meta Tags Section */}
                        <fieldset className="seo-fieldset">
                            <legend>SEO Meta Tags (Optional)</legend>

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
                                <small>Recommended: 50-60 characters. Current: {formData.metaTitle.length}/60</small>
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
                                <small>Recommended: 150-160 characters. Current: {formData.metaDescription.length}/160</small>
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
                                <small>Comma-separated list of relevant keywords</small>
                            </div>
                        </fieldset>

                        <fieldset className="seo-fieldset">
                            <legend>Social Media Sharing (Optional)</legend>

                            <h4 className="social-section-title facebook">Facebook / Open Graph</h4>
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

                            <h4 className="social-section-title twitter">Twitter Cards</h4>
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

                        {/* Form Actions */}
                        <div className="form-actions">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="update-btn"
                            >
                                {loading ? '⏳ Updating...' : '✅ Update Blog'}
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => handleDeleteClick(editingBlog)}
                                className="delete-btn"
                            >
                                🗑️ Delete Blog
                            </button>
                        </div>
                        
                        {isformsubmitted && (
                            <div className="success-message">
                                <p>✅ The blog has been updated successfully!</p>
                            </div>
                        )}
                    </form>
                </div>
            )}

            {/* SEO Preview */}
            {editingBlog && (formData.heading || formData.metaTitle) && (
                <div className="seo-preview-section">
                    <h3>SEO Preview:</h3>
                    <p>This is how your blog will appear in Google search results:</p>
                    {generateSEOPreview()}
                </div>
            )}
        </div>
    );
};

export default BlogEditPage;
