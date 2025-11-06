'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createPet } from '@/lib/services/pets';

// Top 50 most common dog breeds
const DOG_BREEDS = [
  'Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'French Bulldog',
  'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'German Shorthaired Pointer',
  'Yorkshire Terrier', 'Boxer', 'Dachshund', 'Siberian Husky', 'Great Dane',
  'Pembroke Welsh Corgi', 'Doberman Pinscher', 'Australian Shepherd', 'Miniature Schnauzer',
  'Cavalier King Charles Spaniel', 'Shih Tzu', 'Boston Terrier', 'Havanese',
  'Pomeranian', 'Cocker Spaniel', 'Shetland Sheepdog', 'Brittany', 'English Springer Spaniel',
  'Border Collie', 'Bernese Mountain Dog', 'Mastiff', 'Shih Tzu', 'Basset Hound',
  'Weimaraner', 'Belgian Malinois', 'Vizsla', 'Pug', 'Collie', 'Chihuahua',
  'Maltese', 'English Setter', 'Rhodesian Ridgeback', 'Newfoundland', 'Bloodhound',
  'Saint Bernard', 'Alaskan Malamute', 'Irish Setter', 'Bichon Frise', 'Akita',
  'Chesapeake Bay Retriever', 'Great Pyrenees', 'Bull Terrier', 'Pointer'
];

// Top 50 most common cat breeds
const CAT_BREEDS = [
  'Persian', 'Maine Coon', 'British Shorthair', 'Ragdoll', 'Exotic Shorthair',
  'American Shorthair', 'Scottish Fold', 'Abyssinian', 'Sphynx', 'Russian Blue',
  'Bengal', 'Siamese', 'Norwegian Forest Cat', 'Oriental', 'American Curl',
  'Devon Rex', 'Himalayan', 'Birman', 'Turkish Angora', 'Chartreux',
  'Balinese', 'Manx', 'Cornish Rex', 'Tonkinese', 'Burmese', 'Egyptian Mau',
  'Japanese Bobtail', 'Munchkin', 'Selkirk Rex', 'Somali', 'Turkish Van',
  'LaPerm', 'Ocicat', 'Savannah', 'Serengeti', 'Toyger', 'American Bobtail',
  'Highlander', 'Khao Manee', 'Lykoi', 'Minskin', 'Napoleon', 'Pixie-bob',
  'Ragamuffin', 'Ragdoll', 'Siberian', 'Snowshoe', 'Sokoke', 'Thai', 'Tiffany',
  'Tonkinese', 'Turkish Van'
];

export default function AddPetPage() {
  const router = useRouter();
  const { user, loading: authLoading, signInAnonymously } = useAuth();
  const breedInputRef = useRef<HTMLInputElement>(null);
  const breedListRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    species: '' as 'dog' | 'cat' | '',
    age: '',
    breed: '',
    weight: '',
    gender: '' as 'Male' | 'Female' | '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showBreedSuggestions, setShowBreedSuggestions] = useState(false);
  const [filteredBreeds, setFilteredBreeds] = useState<string[]>([]);

  // Sign in anonymously on page load if not authenticated
  useEffect(() => {
    async function ensureAuthentication() {
      if (authLoading) return; // Wait for auth to finish loading
      
      if (!user) {
        try {
          await signInAnonymously();
        } catch (err) {
          console.error('Error signing in anonymously:', err);
          setError('Failed to initialize. Please try again.');
        }
      }
    }

    ensureAuthentication();
  }, [authLoading, user, signInAnonymously]);

  // Update breed suggestions when species or breed input changes
  useEffect(() => {
    if (!formData.species) {
      setFilteredBreeds([]);
      setShowBreedSuggestions(false);
      return;
    }

    const breeds = formData.species === 'dog' ? DOG_BREEDS : CAT_BREEDS;
    
    if (!formData.breed.trim()) {
      setFilteredBreeds(breeds);
      setShowBreedSuggestions(false);
      return;
    }

    const filtered = breeds.filter(breed =>
      breed.toLowerCase().includes(formData.breed.toLowerCase())
    );
    setFilteredBreeds(filtered);
    setShowBreedSuggestions(filtered.length > 0 && formData.breed.trim() !== '');
  }, [formData.species, formData.breed]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        breedInputRef.current &&
        breedListRef.current &&
        !breedInputRef.current.contains(event.target as Node) &&
        !breedListRef.current.contains(event.target as Node)
      ) {
        setShowBreedSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show loading screen while checking auth or signing in anonymously
  if (authLoading || !user) {
    return (
      <div className="h-screen w-screen bg-[#073F6C] flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4">
            <div className="spinner w-full h-full border-2 border-white border-t-transparent"></div>
          </div>
          <p className="text-white text-sm">Loading</p>
        </div>
      </div>
    );
  }

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
    if (!formData.gender) {
      setError('Please select your pet\'s gender');
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
        gender: formData.gender as 'Male' | 'Female',
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

  const handleBreedSelect = (breed: string) => {
    setFormData({ ...formData, breed });
    setShowBreedSuggestions(false);
    breedInputRef.current?.blur();
  };

  const handleBreedChange = (value: string) => {
    setFormData({ ...formData, breed: value });
    if (value.trim() && formData.species) {
      setShowBreedSuggestions(true);
    }
  };

  const availableBreeds = formData.species === 'dog' ? DOG_BREEDS : CAT_BREEDS;

  return (
    <div className="h-screen w-screen bg-[#073F6C] flex items-center justify-center px-4 sm:px-6 py-6 overflow-hidden animate-fade-in">
      <div className="w-full max-w-2xl lg:max-w-3xl overflow-y-auto max-h-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Tell us about your pet
          </h1>
          <p className="text-white/80 text-sm leading-relaxed">
            Let&apos;s get to know your furry friend!
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl fade-in">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5"
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
                  <p className="text-red-600 text-xs font-medium leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl fade-in">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-600 flex-shrink-0"
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
                  <p className="text-green-600 text-xs font-medium leading-relaxed">
                    Pet saved successfully. Redirecting...
                  </p>
                </div>
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-[#073F6C] mb-1.5">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#073F6C] focus:ring-2 focus:ring-[#073F6C]/20 transition-all duration-200 text-sm bg-white placeholder:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="e.g., Max, Bella"
                disabled={loading}
              />
            </div>

            {/* Species */}
            <div>
              <label className="block text-xs font-medium text-[#073F6C] mb-2">
                Species
              </label>
              <div className="flex gap-8">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="species"
                    value="dog"
                    checked={formData.species === 'dog'}
                    onChange={(e) => {
                      setFormData({ ...formData, species: e.target.value as 'dog', breed: '' });
                      setShowBreedSuggestions(false);
                    }}
                    className="w-4 h-4 text-[#073F6C] focus:ring-[#073F6C] cursor-pointer"
                    disabled={loading}
                  />
                  <span className="text-sm text-[#073F6C] group-hover:text-[#073F6C]/80 transition-colors">
                    Dog
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="species"
                    value="cat"
                    checked={formData.species === 'cat'}
                    onChange={(e) => {
                      setFormData({ ...formData, species: e.target.value as 'cat', breed: '' });
                      setShowBreedSuggestions(false);
                    }}
                    className="w-4 h-4 text-[#073F6C] focus:ring-[#073F6C] cursor-pointer"
                    disabled={loading}
                  />
                  <span className="text-sm text-[#073F6C] group-hover:text-[#073F6C]/80 transition-colors">
                    Cat
                  </span>
                </label>
              </div>
            </div>

            {/* Age and Weight Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Age */}
              <div>
                <label htmlFor="age" className="block text-xs font-medium text-[#073F6C] mb-1.5">
                  Age (years)
                </label>
                <input
                  type="number"
                  id="age"
                  min="0"
                  step="0.5"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#073F6C] focus:ring-2 focus:ring-[#073F6C]/20 transition-all duration-200 text-sm bg-white placeholder:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="e.g., 3"
                  disabled={loading}
                />
              </div>

              {/* Weight */}
              <div>
                <label htmlFor="weight" className="block text-xs font-medium text-[#073F6C] mb-1.5">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  min="0"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#073F6C] focus:ring-2 focus:ring-[#073F6C]/20 transition-all duration-200 text-sm bg-white placeholder:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="e.g., 15"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-medium text-[#073F6C] mb-2">
                Gender
              </label>
              <div className="flex gap-8">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={formData.gender === 'Male'}
                    onChange={(e) => {
                      setFormData({ ...formData, gender: e.target.value as 'Male' });
                    }}
                    className="w-4 h-4 text-[#073F6C] focus:ring-[#073F6C] cursor-pointer"
                    disabled={loading}
                  />
                  <span className="text-sm text-[#073F6C] group-hover:text-[#073F6C]/80 transition-colors">
                    Male
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={formData.gender === 'Female'}
                    onChange={(e) => {
                      setFormData({ ...formData, gender: e.target.value as 'Female' });
                    }}
                    className="w-4 h-4 text-[#073F6C] focus:ring-[#073F6C] cursor-pointer"
                    disabled={loading}
                  />
                  <span className="text-sm text-[#073F6C] group-hover:text-[#073F6C]/80 transition-colors">
                    Female
                  </span>
                </label>
              </div>
            </div>

            {/* Breed with Autocomplete */}
            <div className="relative">
              <label htmlFor="breed" className="block text-xs font-medium text-[#073F6C] mb-1.5">
                Breed
              </label>
              <input
                ref={breedInputRef}
                type="text"
                id="breed"
                value={formData.breed}
                onChange={(e) => handleBreedChange(e.target.value)}
                onFocus={() => {
                  if (formData.species && formData.breed.trim()) {
                    setShowBreedSuggestions(true);
                  }
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#073F6C] focus:ring-2 focus:ring-[#073F6C]/20 transition-all duration-200 text-sm bg-white placeholder:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder={formData.species ? `Select or type ${formData.species} breed...` : 'Select species first'}
                disabled={loading || !formData.species}
              />
              
              {/* Autocomplete Suggestions */}
              {showBreedSuggestions && filteredBreeds.length > 0 && (
                <div
                  ref={breedListRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto"
                >
                  {filteredBreeds.slice(0, 15).map((breed) => (
                    <button
                      key={breed}
                      type="button"
                      onClick={() => handleBreedSelect(breed)}
                      className="w-full px-4 py-2.5 text-left text-sm text-[#073F6C] hover:bg-[#073F6C]/5 transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      {breed}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-[#073F6C] text-white rounded-xl hover:bg-[#073F6C]/90 active:scale-[0.98] transition-all duration-200 font-bold text-sm uppercase touch-target shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="spinner w-4 h-4 border-2 border-white border-t-transparent"></div>
                    <span>Saving</span>
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </div>

            <p className="text-center text-xs text-gray-500 leading-relaxed mt-2">
              * All fields are required
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
