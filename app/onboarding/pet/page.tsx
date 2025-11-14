'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createPet } from '@/lib/services/pets';
import {
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Paper,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';

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
      <Box className="h-screen w-screen bg-[#073F6C] flex items-center justify-center overflow-hidden">
        <Box className="text-center">
          <CircularProgress size={32} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="body2" sx={{ color: 'white' }}>
            Loading
          </Typography>
        </Box>
      </Box>
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
    <div className="h-screen bg-[#073F6C] flex flex-col px-4 sm:px-6 py-4 sm:py-6 animate-fade-in overflow-hidden">
      <div className="w-full max-w-2xl lg:max-w-3xl mx-auto flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="text-center mb-4 flex-shrink-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
            Tell us about your pet
          </h1>
          <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
            Let&apos;s get to know your furry friend!
          </p>
        </div>

        {/* Form Card - Scrollable */}
        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, borderRadius: 3 }}>
          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, p: { xs: 2, sm: 3 } }}>
            <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 }, flex: 1 }}>
                {/* Error Message */}
                {error && (
                  <Alert severity="error" sx={{ borderRadius: 3 }}>
                    {error}
                  </Alert>
                )}

                {/* Success Message */}
                {success && (
                  <Alert severity="success" sx={{ borderRadius: 3 }}>
                    Pet saved successfully. Redirecting...
                  </Alert>
                )}

                {/* Name */}
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Max, Bella"
                  disabled={loading}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    },
                  }}
                  onFocus={(e) => {
                    setTimeout(() => {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                  }}
                />

                {/* Species */}
                <FormControl component="fieldset" disabled={loading}>
                  <FormLabel sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#073F6C', mb: 1 }}>
                    Species
                  </FormLabel>
                  <RadioGroup
                    row
                    value={formData.species}
                    onChange={(e) => {
                      setFormData({ ...formData, species: e.target.value as 'dog' | 'cat', breed: '' });
                      setShowBreedSuggestions(false);
                    }}
                    sx={{ gap: 4 }}
                  >
                    <FormControlLabel
                      value="dog"
                      control={<Radio sx={{ color: '#073F6C' }} />}
                      label="Dog"
                      sx={{
                        '& .MuiFormControlLabel-label': {
                          fontSize: '0.875rem',
                          color: '#073F6C',
                        },
                      }}
                    />
                    <FormControlLabel
                      value="cat"
                      control={<Radio sx={{ color: '#073F6C' }} />}
                      label="Cat"
                      sx={{
                        '& .MuiFormControlLabel-label': {
                          fontSize: '0.875rem',
                          color: '#073F6C',
                        },
                      }}
                    />
                  </RadioGroup>
                </FormControl>

                {/* Age and Weight Row */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  {/* Age */}
                  <TextField
                    fullWidth
                    type="number"
                    label="Age (years)"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g., 3"
                    disabled={loading}
                    variant="outlined"
                    inputProps={{ min: 0, step: 0.5 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                      },
                    }}
                    onFocus={(e) => {
                      setTimeout(() => {
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 300);
                    }}
                  />

                  {/* Weight */}
                  <TextField
                    fullWidth
                    type="number"
                    label="Weight (kg)"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="e.g., 15"
                    disabled={loading}
                    variant="outlined"
                    inputProps={{ min: 0, step: 0.1 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                      },
                    }}
                    onFocus={(e) => {
                      setTimeout(() => {
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 300);
                    }}
                  />
                </Box>

                {/* Gender */}
                <FormControl component="fieldset" disabled={loading}>
                  <FormLabel sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#073F6C', mb: 1 }}>
                    Gender
                  </FormLabel>
                  <RadioGroup
                    row
                    value={formData.gender}
                    onChange={(e) => {
                      setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' });
                    }}
                    sx={{ gap: 4 }}
                  >
                    <FormControlLabel
                      value="Male"
                      control={<Radio sx={{ color: '#073F6C' }} />}
                      label="Male"
                      sx={{
                        '& .MuiFormControlLabel-label': {
                          fontSize: '0.875rem',
                          color: '#073F6C',
                        },
                      }}
                    />
                    <FormControlLabel
                      value="Female"
                      control={<Radio sx={{ color: '#073F6C' }} />}
                      label="Female"
                      sx={{
                        '& .MuiFormControlLabel-label': {
                          fontSize: '0.875rem',
                          color: '#073F6C',
                        },
                      }}
                    />
                  </RadioGroup>
                </FormControl>

                {/* Breed with Autocomplete */}
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    inputRef={breedInputRef}
                    fullWidth
                    label="Breed"
                    value={formData.breed}
                    onChange={(e) => handleBreedChange(e.target.value)}
                    placeholder={formData.species ? `Select or type ${formData.species} breed...` : 'Select species first'}
                    disabled={loading || !formData.species}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                      },
                    }}
                    onFocus={(e) => {
                      setTimeout(() => {
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 300);
                      if (formData.species && formData.breed.trim()) {
                        setShowBreedSuggestions(true);
                      }
                    }}
                  />
                  
                  {/* Autocomplete Suggestions */}
                  {showBreedSuggestions && filteredBreeds.length > 0 && (
                    <Paper
                      ref={breedListRef}
                      sx={{
                        position: 'absolute',
                        zIndex: 10,
                        width: '100%',
                        mt: 0.5,
                        maxHeight: 192,
                        overflow: 'auto',
                        borderRadius: 3,
                      }}
                    >
                      <List dense>
                        {filteredBreeds.slice(0, 15).map((breed) => (
                          <ListItemButton
                            key={breed}
                            onClick={() => handleBreedSelect(breed)}
                            sx={{
                              '&:hover': {
                                bgcolor: 'rgba(7, 63, 108, 0.05)',
                              },
                            }}
                          >
                            <ListItemText
                              primary={breed}
                              primaryTypographyProps={{
                                fontSize: '0.875rem',
                                color: '#073F6C',
                              }}
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </Paper>
                  )}
                </Box>

                {/* Submit Button */}
                <Box
                  sx={{
                    pt: 1.5,
                    mt: 'auto',
                    pb: { xs: 3, sm: 4 },
                    paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px) + 1.5rem)',
                  }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null}
                    sx={{
                      borderRadius: 3,
                      py: 1.5,
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                    }}
                  >
                    {loading ? 'Saving' : 'Continue'}
                  </Button>
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    textAlign: 'center',
                    color: 'text.secondary',
                    mt: 1,
                    pb: 1,
                    display: 'block',
                  }}
                >
                  * All fields are required
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
