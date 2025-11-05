'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth, AuthLoadingScreen } from '@/lib/hooks/useRequireAuth';
import { createPet } from '@/lib/services/pets';

export default function OnboardingPage() {
  const router = useRouter();
  const auth = useRequireAuth();

  const [formData, setFormData] = useState({
    name: '',
    species: '' as 'dog' | 'cat' | '',
    age: '',
    breed: '',
    weight: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show loading screen while checking auth or redirecting
  if (!auth) {
    return <AuthLoadingScreen />;
  }

  const { user } = auth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all fields
    if (!formData.name.trim()) {
      setError('Please enter your pet\'s name');
      return;
    }
    if (!formData.species) {
      setError('Please select your pet\'s species');
      return;
    }
    if (!formData.age || Number(formData.age) <= 0) {
      setError('Please enter a valid age');
      return;
    }
    if (!formData.breed.trim()) {
      setError('Please enter your pet\'s breed');
      return;
    }
    if (!formData.weight || Number(formData.weight) <= 0) {
      setError('Please enter a valid weight');
      return;
    }

    try {
      setLoading(true);

      // Prepare pet data (without id, userId, createdAt)
      const petData = {
        name: formData.name.trim(),
        species: formData.species as 'dog' | 'cat',
        age: Number(formData.age),
        breed: formData.breed.trim(),
        weight: Number(formData.weight),
      };

      // Save to Firestore using the pets service
      await createPet(user.uid, petData);

      // Redirect to chat
      router.push('/chat');
    } catch (err) {
      console.error('Error saving pet:', err);
      setError('Failed to save pet information. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            🐾 Tell us about your pet
          </h1>
          <p className="text-gray-600">
            Let's get to know your furry friend!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Pet's Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="e.g., Max, Bella"
              disabled={loading}
            />
          </div>

          {/* Species */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Species *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="species"
                  value="dog"
                  checked={formData.species === 'dog'}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value as 'dog' })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  disabled={loading}
                />
                <span className="text-gray-700">🐕 Dog</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="species"
                  value="cat"
                  checked={formData.species === 'cat'}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value as 'cat' })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  disabled={loading}
                />
                <span className="text-gray-700">🐈 Cat</span>
              </label>
            </div>
          </div>

          {/* Age and Weight Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                Age (years) *
              </label>
              <input
                type="number"
                id="age"
                min="0"
                step="0.5"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="input-field"
                placeholder="e.g., 3"
                disabled={loading}
              />
            </div>

            {/* Weight */}
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg) *
              </label>
              <input
                type="number"
                id="weight"
                min="0"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="input-field"
                placeholder="e.g., 15"
                disabled={loading}
              />
            </div>
          </div>

          {/* Breed */}
          <div>
            <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-2">
              Breed *
            </label>
            <input
              type="text"
              id="breed"
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              className="input-field"
              placeholder="e.g., Golden Retriever, Persian"
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                'Continue'
              )}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500">
            * All fields are required
          </p>
        </form>
      </div>
    </div>
  );
}
