// ChangePasswordForm.tsx
import { useAuth } from "@/app/components/auth/AuthContext";
import { sanitizeInput } from "@/app/components/security/SanitizationFunctions";
import { User } from "@/app/components/users/User";
import React, { useState } from "react";

interface ChangePasswordFormProps {
  onChangePassword: (currentPassword: string, newPassword: string, user: User) => Promise<void>;
  onSuccess: () => void;
  // Add the onChangePassword prop
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onChangePassword, onSuccess }) => {
  const { user } = useAuth(); // Access user information from the AuthContext
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
      // Ensure user is authenticated before changing password
      if (!user) {
        throw new Error("User is not authenticated.");
      }

        // Sanitize passwords before passing them to onChangePassword function
      const sanitizedCurrentPassword = sanitizeInput(currentPassword);
      const sanitizedNewPassword = sanitizeInput(newPassword);

      await onChangePassword(sanitizedCurrentPassword, sanitizedNewPassword, user);
      // Clear form and errors on successful password change
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setError(null);

      // Notify success
      onSuccess()
    } catch (error: any) {
      setError(error.message || "Failed to change password. Please check your current password.");
    }
  }
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
