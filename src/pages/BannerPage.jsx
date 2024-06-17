// BannerPage.jsx
import React, { useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '../firebase/firebase';
import './BannerPage.css'; // Import CSS file for styles

const BannerPage = () => {
  const [formData, setFormData] = useState({
    page: '',
    heading: '',
    description: '',
    link: '',
    image: ''
  });

  const [submitStatus, setSubmitStatus] = useState(null); // State to manage form submission status

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if the selected file type is allowed
      const allowedTypes = ['image/jpeg', 'image/png']; // Add more types as needed
      if (allowedTypes.includes(file.type)) {
        setFormData({
          ...formData,
          image: file
        });
      } else {
        alert('Only JPG and PNG files are allowed.');
        // Reset file input
        e.target.value = null;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.page && formData.heading && formData.description && formData.image) {
      try {
        // Fetch the document from Firestore
        const bannersRef = collection(firestore, 'banners');
        const q = query(bannersRef, where('page', '==', formData.page));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const bannerDoc = querySnapshot.docs[0];
          const bannerDocRef = doc(firestore, 'banners', bannerDoc.id);

          // Upload the image to Firebase Storage
          const storageRef = ref(storage, `images/${formData.image.name}`);
          await uploadBytes(storageRef, formData.image);
          const imageURL = await getDownloadURL(storageRef);

          // Update the Firestore document
          await updateDoc(bannerDocRef, {
            heading: formData.heading,
            description: formData.description,
            link: formData.link,
            image: imageURL
          });

          setSubmitStatus('success');
          // Reset form fields after successful submission
          setFormData({
            page: '',
            heading: '',
            description: '',
            link: '',
            image: null
          });
        } else {
          alert('No document found with the given page.');
        }
      } catch (error) {
        console.error('Error updating document:', error);
        setSubmitStatus('error');
      }
    } else {
      setSubmitStatus('error');
    }
  };

  return (
    <div className="container">
      <h2>Banner Page Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="page">Page:</label>
          <select
            id="page"
            name="page"
            value={formData.page}
            onChange={handleInputChange}
            required
            className="input-field"
          >
            <option value="">Select a Page</option>
            <option value="Focus Parent">Focus Parent</option>
            <option value="Food, Nutrition & Beverages">Food, Nutrition & Beverages</option>
            <option value="Speciality Polymers">Speciality Polymers</option>
            <option value="Petrochemicals & Downstream">Petrochemicals & Downstream</option>
            <option value="Clean Energy & Storage">Clean Energy & Storage</option>
            <option value="Mobility">Mobility</option>
            <option value="Personal Care & Cosmetics">Personal Care & Cosmetics</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="heading">Heading:</label>
          <input
            type="text"
            id="heading"
            name="heading"
            value={formData.heading}
            onChange={handleInputChange}
            required
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            required
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label htmlFor="link">Link:</label>
          <input
            type="text"
            id="link"
            name="link"
            value={formData.link}
            onChange={handleInputChange}
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label htmlFor="image">Image:</label>
          <input
            type="file"
            id="image"
            name="image"
            accept=".jpg, .jpeg, .png"
            onChange={handleImageChange}
            className="input-field"
          />
        </div>
        {submitStatus === 'error' && <p className="error-message">Please fill out all required fields.</p>}
        {submitStatus === 'success' && <p className="success-message">Form submitted successfully!</p>}
        <button type="submit" className="submit-button">Submit</button>
      </form>
    </div>
  );
};

export default BannerPage;
