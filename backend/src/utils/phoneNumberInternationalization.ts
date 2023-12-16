import {
  type CountryCode,
  isValidPhoneNumber,
  parsePhoneNumber,
} from 'libphonenumber-js';
import { customLogger } from './methods';

interface PhoneNumberValidationResult {
  isValid: boolean;
  number: string;
}

const checkValidationAndReturnInternationalized = (
  phoneNumbers: string[],
  countryIsoAlpha: CountryCode
): PhoneNumberValidationResult[] =>
  phoneNumbers.map((number) => {
    const isValid = isValidPhoneNumber(number, countryIsoAlpha);
    let parsedNumber = number;

    if (isValid) {
      try {
        const phoneNumber = parsePhoneNumber(number, countryIsoAlpha);
        parsedNumber = phoneNumber.formatInternational();
      } catch (error) {
        customLogger('error', `Error parsing phone number: ${number}`, error);
        // Handle the error as per your application's error handling policy
      }
    }

    return {
      isValid,
      number: parsedNumber,
    };
  });

export { checkValidationAndReturnInternationalized };
