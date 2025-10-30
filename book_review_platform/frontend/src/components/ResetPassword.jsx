import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import '../styles/ResetPassword.css';  
import BASE_URL from "../config";

const ResetPassword = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handlePasswordReset = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            message.error('Passwords do not match!');
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/accounts/reset-password/${uid}/${token}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
                message.success('Password has been reset successfully!');
                navigate('/login');
            } else {
                message.error(data.error || 'An error occurred. Please try again.');
            }
        } catch (error) {
            console.error('Password reset failed:', error);
            message.error('An error occurred. Please try again.');
        }
    };

    return (
        <div className="reset-password-container">
            <div className="reset-password-card">
                <h2>Reset Password</h2>
                <form className="reset-password-form" onSubmit={handlePasswordReset}>
                    <label>New Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Reset Password</button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
