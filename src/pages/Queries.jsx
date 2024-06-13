// Queries.jsx
import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase/firebase.js'; // Ensure firebaseConfig is correctly set up
import { collection, getDocs } from 'firebase/firestore';
import './Queries.css';

const Queries = () => {
  const [queries, setQueries] = useState([]);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const queriesCollection = collection(firestore, 'queries');
        const queriesSnapshot = await getDocs(queriesCollection);
        const queriesList = queriesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : null
          };
        });
        setQueries(queriesList);
      } catch (error) {
        console.error("Error fetching queries: ", error);
      }
    };

    fetchQueries();
  }, []);

  return (
    <div className="queries-container">
      <h2>Queries</h2>
      <ul>
        {queries.map(query => (
          <li key={query.id} className="query">
            <div className="query-header">
              <p className="query-user">{query.user}</p>
              <p className="query-email">{query.email}</p>
            </div>
            <p className="query-question">{query.question}</p>
            <p className="query-timestamp">
              {query.timestamp ? new Date(query.timestamp).toLocaleString() : 'No date available'}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Queries;
