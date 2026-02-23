export function validateAssessmentPayload(payload) {
  const errors = {};

  const clean = {
    formSlug: String(payload.form_slug || "").trim(),
    fullName: String(payload.full_name || "").trim(),
    phone: String(payload.phone || "").trim(),
    livingSituation: String(payload.living_situation || "").trim(),
    householdSize: String(payload.household_size || "").trim(),
  };

  if (!clean.formSlug) errors.form_slug = "Form slug is required.";
  if (!clean.fullName || clean.fullName.length < 3) {
    errors.full_name = "Applicant full name is required.";
  }
  if (!clean.phone || clean.phone.length < 7) {
    errors.phone = "Valid phone number is required.";
  }
  if (!clean.livingSituation || clean.livingSituation.length < 15) {
    errors.living_situation = "Please provide housing details.";
  }
  if (!clean.householdSize) errors.household_size = "Select household size.";

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    clean,
  };
}
