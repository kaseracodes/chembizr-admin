// src/pages/MetaTagsPage.jsx
import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/authContext';
import { Navigate } from "react-router-dom";
import './MetaTagsPage.css';

const MetaTagsPage = () => {
    const { userLoggedIn } = useAuth();
    const [metaTags, setMetaTags] = useState([]);
    const [editingTag, setEditingTag] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        pagePath: '',
        pageName: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        twitterTitle: '',
        twitterDescription: '',
        twitterImage: '',
        canonicalUrl: '',
        robots: 'index, follow'
    });

    // All your static pages based on the file structure shown
    const staticPages = [
        { path: '/', name: 'Home Page' },
        { path: '/about', name: 'About Us Page' },
        { path: '/blogs', name: 'Blog Listing Page' },
        { path: '/blog-detail', name: 'Blog Detail Page' },
        { path: '/capabilities', name: 'Capabilities Page' },
        { path: '/careers', name: 'Careers Page' },
        { path: '/chemicals', name: 'Chemicals Page' },
        { path: '/clean-energy', name: 'Clean Energy Page' },
        { path: '/countdown', name: 'Countdown Page' },
        { path: '/events', name: 'Events Page' },
        { path: '/event-detail', name: 'Event Detail Page' },
        { path: '/focus-parent', name: 'Focus Parent Page' },
        { path: '/food-nutrition', name: 'Food Nutrition Page' },
        { path: '/mobility', name: 'Mobility Page' },
        { path: '/news', name: 'News Page' },
        { path: '/personal-care', name: 'Personal Care Page' },
        { path: '/petro-chemicals', name: 'Petro Chemicals Page' },
        { path: '/login', name: 'Login Page' },
        { path: '/signup', name: 'Signup Page' },
        { path: '/forgot-password', name: 'Forgot Password Page' },
        { path: '/reset-password', name: 'Reset Password Page' },
        { path: '/otp', name: 'OTP Verification Page' }
    ];

    useEffect(() => {
        if (userLoggedIn) {
            fetchMetaTags();
        }
    }, [userLoggedIn]);

    const fetchMetaTags = async () => {
        try {
            const querySnapshot = await getDocs(collection(firestore, 'metaTags'));
            const tagsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMetaTags(tagsData);
        } catch (error) {
            console.error('Error fetching meta tags:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const docId = editingTag ? editingTag.id : formData.pagePath.replace(/\//g, '_') || 'root';
            
            await setDoc(doc(firestore, 'metaTags', docId), {
                ...formData,
                updatedAt: new Date().toISOString()
            });

            await fetchMetaTags();
            resetForm();
            alert('Meta tags saved successfully!');
        } catch (error) {
            console.error('Error saving meta tags:', error);
            alert('Error saving meta tags. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (tag) => {
        setEditingTag(tag);
        setFormData({
            pagePath: tag.pagePath || '',
            pageName: tag.pageName || '',
            metaTitle: tag.metaTitle || '',
            metaDescription: tag.metaDescription || '',
            metaKeywords: tag.metaKeywords || '',
            ogTitle: tag.ogTitle || '',
            ogDescription: tag.ogDescription || '',
            ogImage: tag.ogImage || '',
            twitterTitle: tag.twitterTitle || '',
            twitterDescription: tag.twitterDescription || '',
            twitterImage: tag.twitterImage || '',
            canonicalUrl: tag.canonicalUrl || '',
            robots: tag.robots || 'index, follow'
        });
    };

    const handleDelete = async (tagId) => {
        if (window.confirm('Are you sure you want to delete this meta tag configuration?')) {
            try {
                await deleteDoc(doc(firestore, 'metaTags', tagId));
                await fetchMetaTags();
                alert('Meta tag deleted successfully!');
            } catch (error) {
                console.error('Error deleting meta tag:', error);
                alert('Error deleting meta tag. Please try again.');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            pagePath: '',
            pageName: '',
            metaTitle: '',
            metaDescription: '',
            metaKeywords: '',
            ogTitle: '',
            ogDescription: '',
            ogImage: '',
            twitterTitle: '',
            twitterDescription: '',
            twitterImage: '',
            canonicalUrl: '',
            robots: 'index, follow'
        });
        setEditingTag(null);
    };

    const generateSEOPreview = () => {
        const title = formData.metaTitle || formData.pageName || 'Page Title';
        const description = formData.metaDescription || 'Page description';
        
        return (
            <div className="seo-preview">
                <h4>{title}</h4>
                <p className="url">{window.location.origin}{formData.pagePath}</p>
                <p className="description">
                    {description.length > 160 ? description.substring(0, 160) + '...' : description}
                </p>
            </div>
        );
    };

    if (!userLoggedIn) {
        return <Navigate to="/login" replace={true} />;
    }

    return (
        <div className="form-container">
            <h2>{editingTag ? 'Edit Page Meta Tags' : 'Add Page Meta Tags'}</h2>
            <form onSubmit={handleSubmit}>
                
                <div className="form-group">
                    <label htmlFor="pagePath">Page Path:</label>
                    <select
                        id="pagePath"
                        name="pagePath"
                        value={formData.pagePath}
                        onChange={handleInputChange}
                        required
                        disabled={editingTag}
                    >
                        <option value="">Select a page</option>
                        {staticPages.map(page => (
                            <option key={page.path} value={page.path}>
                                {page.name} ({page.path})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="pageName">Page Display Name:</label>
                    <input
                        type="text"
                        id="pageName"
                        name="pageName"
                        value={formData.pageName}
                        onChange={handleInputChange}
                        placeholder="Enter display name for this page"
                        required
                    />
                </div>

                {/* Basic SEO Meta Tags */}
                <fieldset className="seo-fieldset">
                    <legend>Basic SEO Meta Tags</legend>
                    
                    <div className="form-group">
                        <label htmlFor="metaTitle">Meta Title:</label>
                        <input
                            type="text"
                            id="metaTitle"
                            name="metaTitle"
                            value={formData.metaTitle}
                            onChange={handleInputChange}
                            placeholder="SEO optimized title (recommended: 50-60 characters)"
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
                            placeholder="SEO description that appears in search results (recommended: 150-160 characters)"
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
                            placeholder="chemical, business, industry, innovation (comma-separated)"
                        />
                        <small>Comma-separated list of relevant keywords</small>
                    </div>
                </fieldset>

                {/* Open Graph Tags */}
                <fieldset className="seo-fieldset">
                    <legend>Facebook / Open Graph Tags</legend>
                    
                    <div className="form-group">
                        <label htmlFor="ogTitle">Open Graph Title:</label>
                        <input
                            type="text"
                            id="ogTitle"
                            name="ogTitle"
                            value={formData.ogTitle}
                            onChange={handleInputChange}
                            placeholder="Title when shared on Facebook/LinkedIn"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="ogDescription">Open Graph Description:</label>
                        <textarea
                            id="ogDescription"
                            name="ogDescription"
                            value={formData.ogDescription}
                            onChange={handleInputChange}
                            placeholder="Description when shared on Facebook/LinkedIn"
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="ogImage">Open Graph Image URL:</label>
                        <input
                            type="url"
                            id="ogImage"
                            name="ogImage"
                            value={formData.ogImage}
                            onChange={handleInputChange}
                            placeholder="https://chembizr.com/images/og-image.jpg"
                        />
                    </div>
                </fieldset>

                {/* Twitter Card Tags */}
                <fieldset className="seo-fieldset">
                    <legend>Twitter Card Tags</legend>
                    
                    <div className="form-group">
                        <label htmlFor="twitterTitle">Twitter Title:</label>
                        <input
                            type="text"
                            id="twitterTitle"
                            name="twitterTitle"
                            value={formData.twitterTitle}
                            onChange={handleInputChange}
                            placeholder="Title when shared on Twitter"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="twitterDescription">Twitter Description:</label>
                        <textarea
                            id="twitterDescription"
                            name="twitterDescription"
                            value={formData.twitterDescription}
                            onChange={handleInputChange}
                            placeholder="Description when shared on Twitter"
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="twitterImage">Twitter Image URL:</label>
                        <input
                            type="url"
                            id="twitterImage"
                            name="twitterImage"
                            value={formData.twitterImage}
                            onChange={handleInputChange}
                            placeholder="https://chembizr.com/images/twitter-card.jpg"
                        />
                    </div>
                </fieldset>

                {/* Advanced Settings */}
                <fieldset className="seo-fieldset">
                    <legend>Advanced Settings</legend>
                    
                    <div className="form-group">
                        <label htmlFor="canonicalUrl">Canonical URL:</label>
                        <input
                            type="url"
                            id="canonicalUrl"
                            name="canonicalUrl"
                            value={formData.canonicalUrl}
                            onChange={handleInputChange}
                            placeholder="https://chembizr.com/page-path"
                        />
                        <small>Canonical URL for this page (optional)</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="robots">Robots Meta Tag:</label>
                        <select
                            id="robots"
                            name="robots"
                            value={formData.robots}
                            onChange={handleInputChange}
                        >
                            <option value="index, follow">Index, Follow (Recommended)</option>
                            <option value="noindex, follow">No Index, Follow</option>
                            <option value="index, nofollow">Index, No Follow</option>
                            <option value="noindex, nofollow">No Index, No Follow</option>
                        </select>
                    </div>
                </fieldset>

                <div className="form-actions">
                    <button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : editingTag ? 'Update Meta Tags' : 'Save Meta Tags'}
                    </button>
                    
                    {editingTag && (
                        <button type="button" onClick={resetForm} className="cancel-btn">
                            Cancel Edit
                        </button>
                    )}
                </div>
            </form>

            {/* SEO Preview */}
            {(formData.pageName || formData.metaTitle) && (
                <div style={{marginTop: '20px'}}>
                    <h3>SEO Preview:</h3>
                    <p style={{fontSize: '14px', color: '#666', marginBottom: '10px'}}>
                        This is how your page will appear in Google search results:
                    </p>
                    {generateSEOPreview()}
                </div>
            )}

            {/* Existing Meta Tags */}
            <div className="existing-tags">
                <h3>Existing Meta Tags</h3>
                
                {metaTags.length === 0 ? (
                    <p style={{color: '#666', fontStyle: 'italic'}}>
                        No meta tags configured yet. Start by adding meta tags for your pages above.
                    </p>
                ) : (
                    <div className="tags-list">
                        {metaTags.map(tag => (
                            <div key={tag.id} className="tag-item">
                                <div className="tag-info">
                                    <h4>{tag.pageName}</h4>
                                    <p className="tag-path">{tag.pagePath}</p>
                                    {tag.metaTitle && <p><strong>Title:</strong> {tag.metaTitle}</p>}
                                    {tag.metaDescription && <p><strong>Description:</strong> {tag.metaDescription}</p>}
                                </div>
                                <div className="tag-buttons">
                                    <button onClick={() => handleEdit(tag)} className="edit-btn">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(tag.id)} className="delete-btn">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MetaTagsPage;
