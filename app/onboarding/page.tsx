'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth, AuthLoadingScreen } from '@/lib/hooks/useRequireAuth';
import { createPet, getUserPets } from '@/lib/services/pets';

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
  const [success, setSuccess] = useState(false);

  // Redirect to chat if user already has pets
  useEffect(() => {
    async function checkExistingPets() {
      if (!auth?.user) return;

      try {
        const pets = await getUserPets(auth.user.uid);
        if (pets.length > 0) {
          router.push(`/chat?petId=${pets[0].id}`);
        }
      } catch (err) {
        console.error('Error checking existing pets:', err);
      }
    }

    checkExistingPets();
  }, [auth?.user?.uid, router]);

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

      const petData = {
        name: formData.name.trim(),
        species: formData.species as 'dog' | 'cat',
        age: Number(formData.age),
        breed: formData.breed.trim(),
        weight: Number(formData.weight),
      };

      const newPet = await createPet(user.uid, petData);
      setSuccess(true);

      setTimeout(() => {
        router.push(`/chat?petId=${newPet.id}`);
      }, 1000);
    } catch (err) {
      console.error('Error saving pet:', err);
      setError('Failed to save pet information. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-6 rounded-sm bg-[var(--accent)]">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-light text-[var(--text-primary)] mb-3">
            Pet Information
          </h1>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            Tell us about your pet
          </p>
        </div>

        {/* Form */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-sm p-8 sm:p-10 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-sm fade-in">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-[var(--text-secondary)] text-xs font-medium leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-sm fade-in">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-4 h-4 text-[var(--accent)] flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <p className="text-[var(--text-primary)] text-xs font-medium leading-relaxed">
                    Pet saved successfully. Redirecting...
                  </p>
                </div>
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-[var(--text-primary)] mb-2.5">
                Name *
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
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-3.5">
                Species *
              </label>
              <div className="flex gap-8">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="species"
                    value="dog"
                    checked={formData.species === 'dog'}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value as 'dog' })}
                    className="w-4 h-4 text-[var(--text-primary)] focus:ring-[var(--text-primary)] cursor-pointer"
                    disabled={loading}
                  />
                  <span className="text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    Dog
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="species"
                    value="cat"
                    checked={formData.species === 'cat'}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value as 'cat' })}
                    className="w-4 h-4 text-[var(--text-primary)] focus:ring-[var(--text-primary)] cursor-pointer"
                    disabled={loading}
                  />
                  <span className="text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    Cat
                  </span>
                </label>
              </div>
            </div>

            {/* Age and Weight Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
              {/* Age */}
              <div>
                <label htmlFor="age" className="block text-xs font-medium text-[var(--text-primary)] mb-2.5">
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
                <label htmlFor="weight" className="block text-xs font-medium text-[var(--text-primary)] mb-2.5">
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
              <label htmlFor="breed" className="block text-xs font-medium text-[var(--text-primary)] mb-2.5">
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
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="spinner w-4 h-4"></div>
                    <span className="text-sm">Saving</span>
                  </>
                ) : (
                  <span className="text-sm">Continue</span>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-[var(--text-tertiary)] leading-relaxed mt-2">
              * All fields are required
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
