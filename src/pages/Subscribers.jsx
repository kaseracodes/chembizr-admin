// Subscribers.jsx
import React, { useState, useEffect } from 'react';
import { firestore } from './firebase/firebase.js'; // Ensure firebaseConfig is correctly set up
import { collection, getDocs } from 'firebase/firestore';
import './Subscribers.css';

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState([]);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const subscribersCollection = collection(firestore, 'subscribers');
        const subscribersSnapshot = await getDocs(subscribersCollection);
        const subscribersList = subscribersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : null
          };
        });
        setSubscribers(subscribersList);
      } catch (error) {
        console.error("Error fetching subscribers: ", error);
      }
    };

    fetchSubscribers();
  }, []);

  const copyEmailToClipboard = (email) => {
    navigator.clipboard.writeText(email)
      .then(() => {
        alert('Email copied to clipboard!');
      })
      .catch(err => {
        console.error('Could not copy email: ', err);
      });
  };

  const copyAllEmailsToClipboard = () => {
    const emailList = subscribers.map(subscriber => subscriber.email).join(', ');
    navigator.clipboard.writeText(emailList)
      .then(() => {
        alert('All emails copied to clipboard!');
      })
      .catch(err => {
        console.error('Could not copy emails: ', err);
      });
  };

  return (
    <div className="subscribers-container">
      <h2>Subscribers</h2>
      <button onClick={copyAllEmailsToClipboard} className="copy-all-button">Copy All Emails</button>
      <ul>
        {subscribers.map(subscriber => (
          <li key={subscriber.id} className="subscriber">
            <div className="subscriber-details">
              <p className="subscriber-email">{subscriber.email}</p>
              <button onClick={() => copyEmailToClipboard(subscriber.email)} className="copy-button">Copy</button>
            </div>
            <p className="subscriber-timestamp">
              {subscriber.timestamp ? new Date(subscriber.timestamp).toLocaleString() : 'No date available'}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Subscribers;
