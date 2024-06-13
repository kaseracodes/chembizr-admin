// Comments.jsx
import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase/firebase.js'; // Ensure firebaseConfig is correctly set up
import { collection, getDocs } from 'firebase/firestore';
import './Comments.css';

const Comments = () => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsCollection = collection(firestore, 'comments');
        const commentsSnapshot = await getDocs(commentsCollection);
        const commentsList = commentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp ? doc.data().timestamp.toDate().toISOString() : null
        }));
        setComments(commentsList);
      } catch (error) {
        console.error("Error fetching comments: ", error);
      }
    };

    fetchComments();
  }, []);

  return (
    <div className="comments-container">
      <h2>Comments</h2>
      <ul>
        {comments.map(comment => (
          <li key={comment.id} className="comment">
            <p className="comment-author">{comment.author}</p>
            <p className="comment-email">{comment.email}</p>
            <p className="comment-content">{comment.content}</p>
            <p className="comment-timestamp">{comment.timestamp ? new Date(comment.timestamp).toLocaleString() : 'No date available'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Comments;
