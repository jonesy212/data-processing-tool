// ChangePasswordForm.tsx
import React, { useState } from "react";

interface ChangePasswordFormProps {
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onChangePassword }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Call the prop function to handle password change
      await onChangePassword(currentPassword, newPassword);
      // Clear form and errors on successful password change
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setError(null);
    } catch (error) {
      setError("Failed to change password. Please check your current password.");
    }
  };

  return (
    <div>
      <h1>Change Password</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Current Password:
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          New Password:
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Confirm New Password:
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />
        </label>
        <br />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <input type="submit" value="Change Password" />
      </form>
    </div>
  );
};

export default ChangePasswordForm;
