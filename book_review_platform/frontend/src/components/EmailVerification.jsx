import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { message } from 'antd';

const EmailVerification = () => {
  const navigate = useNavigate();
  const { uidb64, token } = useParams(); // Extract params from URL
  const [emailVerified, setEmailVerified] = useState(false); // Track if email is verified

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/accounts/verify-email/${uidb64}/${token}/`);
        const data = await response.json();

        if (response.ok) {
          // Only show success message if it hasn't been shown already
          if (!emailVerified) {
            localStorage.setItem('access_token', data.token);  // Store token
            localStorage.setItem('username', data.username);  // Store username
            message.success("Email verified successfully!");
            setEmailVerified(true); // Mark as verified
          }

          // Redirect after storing token
          navigate('/profile/setup');
        } else {
          message.error(data.error);
          navigate('/login'); // Redirect to login if verification fails
        }
      } catch (error) {
        message.error("An error occurred while verifying email.");
      }
    };

    verifyEmail();
  }, [navigate, uidb64, token, emailVerified]); // Include emailVerified in the dependency array

  return (
    <div>
      <h2>Verifying Email...</h2>
    </div>
  );
};

export default EmailVerification;
