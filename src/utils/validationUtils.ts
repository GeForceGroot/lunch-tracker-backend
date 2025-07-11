interface ValidationResult {
  isValid: boolean;
  invalidFields: string[];
  errorMessage: string;
}

/**
 * Validates required fields in an object
 * @param data Object to validate
 * @param requiredFields Array of field names that should be non-empty strings
 * @returns Validation result with details about invalid fields
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): ValidationResult {
  const invalidFields: string[] = [];

  for (const field of requiredFields) {
    if (!data?.[field]?.trim?.()) {
      invalidFields.push(field);
    }
  }

  return {
    isValid: invalidFields.length === 0,
    invalidFields,
    errorMessage:
      invalidFields.length > 0
        ? `Missing or invalid required fields: ${invalidFields.join(', ')}`
        : '',
  };
}
