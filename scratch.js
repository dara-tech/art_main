const fs = require('fs');
const file = fs.readFileSync('frontend/src/components/clinicalForms/AdultVisitForm.jsx', 'utf8');

// Append Patient Status if it's missing
if (!file.includes('PatientStatus') && !file.includes('Patient Status')) {
  console.log('Missing Patient Status');
} else {
  console.log('Patient Status present?');
}
