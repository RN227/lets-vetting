/**
 * Material UI Component Examples
 * 
 * This file demonstrates how to use Material UI components
 * in the LetsVet application with the custom theme.
 * 
 * Use these as reference when migrating existing components.
 */

'use client';

import { Button, TextField, Card, CardContent, Typography, Chip, CircularProgress, Alert, Snackbar } from '@mui/material';
import { useState } from 'react';

export function MUIButtonExamples() {
  return (
    <div className="space-y-4 p-4">
      <Typography variant="h3" gutterBottom>
        Button Examples
      </Typography>
      
      <div className="flex flex-col gap-4">
        {/* Primary Button */}
        <Button variant="contained" color="primary" fullWidth>
          Get Started
        </Button>
        
        {/* Outlined Button */}
        <Button variant="outlined" color="primary" fullWidth>
          I Already Have an Account
        </Button>
        
        {/* Text Button */}
        <Button variant="text" color="primary" fullWidth>
          Learn More
        </Button>
        
        {/* Button with Loading */}
        <Button variant="contained" color="primary" disabled>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          Loading...
        </Button>
      </div>
    </div>
  );
}

export function MUIFormExamples() {
  const [value, setValue] = useState('');
  
  return (
    <div className="space-y-4 p-4">
      <Typography variant="h3" gutterBottom>
        Form Examples
      </Typography>
      
      <div className="space-y-4">
        {/* Text Field */}
        <TextField
          fullWidth
          label="Pet Name"
          placeholder="e.g., Max, Bella"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          variant="outlined"
        />
        
        {/* Number Field */}
        <TextField
          fullWidth
          type="number"
          label="Age (years)"
          placeholder="e.g., 3"
          variant="outlined"
        />
        
        {/* Text Field with Error */}
        <TextField
          fullWidth
          label="Breed"
          placeholder="Select or type breed..."
          variant="outlined"
          error
          helperText="Please enter a valid breed"
        />
        
        {/* Multiline Text Field */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Description"
          placeholder="Describe symptoms..."
          variant="outlined"
        />
      </div>
    </div>
  );
}

export function MUICardExamples() {
  return (
    <div className="space-y-4 p-4">
      <Typography variant="h3" gutterBottom>
        Card Examples
      </Typography>
      
      <div className="space-y-4">
        {/* Basic Card */}
        <Card>
          <CardContent>
            <Typography variant="h3" gutterBottom>
              Card Title
            </Typography>
            <Typography variant="body2">
              This is a Material UI card with custom theme styling.
            </Typography>
          </CardContent>
        </Card>
        
        {/* Card with Elevation */}
        <Card elevation={4}>
          <CardContent>
            <Typography variant="h3" gutterBottom>
              Elevated Card
            </Typography>
            <Typography variant="body2">
              This card has more elevation for emphasis.
            </Typography>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function MUIChipExamples() {
  return (
    <div className="space-y-4 p-4">
      <Typography variant="h3" gutterBottom>
        Chip Examples (for Condition Pills)
      </Typography>
      
      <div className="flex flex-wrap gap-2">
        <Chip label="Not eating or reduced appetite" />
        <Chip label="Vomiting or nausea" color="primary" />
        <Chip label="Diarrhea or loose stools" variant="outlined" />
        <Chip label="Lethargy or lack of energy" />
        <Chip label="Coughing or breathing issues" />
      </div>
    </div>
  );
}

export function MUIAlertExamples() {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="space-y-4 p-4">
      <Typography variant="h3" gutterBottom>
        Alert & Snackbar Examples
      </Typography>
      
      <div className="space-y-4">
        {/* Success Alert */}
        <Alert severity="success">
          Pet saved successfully!
        </Alert>
        
        {/* Error Alert */}
        <Alert severity="error">
          Failed to save pet information. Please try again.
        </Alert>
        
        {/* Info Alert */}
        <Alert severity="info">
          Please fill in all required fields.
        </Alert>
        
        {/* Snackbar */}
        <Button onClick={() => setOpen(true)}>
          Show Snackbar
        </Button>
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={() => setOpen(false)}
          message="This is a snackbar notification"
        />
      </div>
    </div>
  );
}

export function MUILoadingExamples() {
  return (
    <div className="space-y-4 p-4">
      <Typography variant="h3" gutterBottom>
        Loading Examples
      </Typography>
      
      <div className="flex items-center gap-4">
        <CircularProgress size={24} />
        <CircularProgress size={40} />
        <CircularProgress size={60} color="primary" />
      </div>
    </div>
  );
}

// Combined example showing typical LetsVet patterns
export function LetsVetMUIExample() {
  const [petName, setPetName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h3" gutterBottom>
          Add Pet (MUI Version)
        </Typography>
        
        <div className="space-y-4 mt-4">
          <TextField
            fullWidth
            label="Pet Name"
            placeholder="e.g., Max, Bella"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            variant="outlined"
          />
          
          <div className="flex gap-2">
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => setShowSuccess(true)}
              disabled={!petName}
            >
              Save Pet
            </Button>
            <Button variant="outlined" color="primary" fullWidth>
              Cancel
            </Button>
          </div>
        </div>
        
        <Snackbar
          open={showSuccess}
          autoHideDuration={3000}
          onClose={() => setShowSuccess(false)}
          message="Pet saved successfully!"
        />
      </CardContent>
    </Card>
  );
}

