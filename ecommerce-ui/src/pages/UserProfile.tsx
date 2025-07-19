import React, { useEffect, useState } from 'react';
import { useKeycloak } from '../lib//KeycloakContext';
import keycloak from '../lib//keycloak';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

const UserProfile: React.FC = () => {
  const { isAuthenticated, login, logout } = useKeycloak();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserProfile();
    }
  }, [isAuthenticated]);

  const loadUserProfile = async () => {
    try {
      const userProfile = await keycloak.loadUserProfile();
      const profileData: UserProfile = {
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
        username: userProfile.username || '',
      };
      setProfile(profileData);
      setFormData(profileData);
    } catch (err) {
      setError('Failed to load user profile');
      console.error(err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Use Keycloak's account management endpoint to update the profile
      const response = await fetch(
        `${keycloak.authServerUrl}/realms/${keycloak.realm}/account`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${keycloak.token}`,
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            username: formData.username,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setProfile(formData);
      setIsEditing(false);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className=" p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-8">
      <div className="max-w-2xl mx-auto  p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">User Profile</h2>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-4">{success}</div>
        )}

        {profile ? (
          isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <span className="font-medium">First Name:</span> {profile.firstName}
              </div>
              <div>
                <span className="font-medium">Last Name:</span> {profile.lastName}
              </div>
              <div>
                <span className="font-medium">Email:</span> {profile.email}
              </div>
              <div>
                <span className="font-medium">Username:</span> {profile.username}
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Edit Profile
              </button>
            </div>
          )
        ) : (
          <p>Loading profile...</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;