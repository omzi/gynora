import * as z from 'zod';
import validator from 'validator';
import { $Enums } from '@prisma/client';

const generateErrorMessages = (fieldName: string) => {
  return {
    invalid_type_error:  `Please enter a valid ${fieldName}`,
    required_error:  `Your ${fieldName} is required`
  }
};

export const AuthSchema = z.object({
	email: z.string(generateErrorMessages('email address'))
		.refine(value => value && validator.isEmail(value), {
			message: 'Invalid email address'
		}),
	password: z.string(generateErrorMessages('password'))
		.refine(value => {
			return value && value.length >= 8 && /\d/.test(value) && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);
		}, {
			message: 'Password must have at least one lowercase character, one uppercase character, one digit, one special character, and be at least 8 characters long'
		}),
	firstName: z.string(generateErrorMessages('first name'))
		.refine(value => value && value.length >= 2, 'First name must be at least 2 characters.')
		.refine(value => value && value.length <= 30, 'First name must not be more than 30 characters.'),
	lastName: z .string(generateErrorMessages('last name'))
		.refine(value => value && value.length >= 2, 'Last name must be at least 2 characters.')
		.refine(value => value && value.length <= 30, 'Last name must not be more than 30 characters.')
});

export const UserDataSchema = z.object({
	userId: z.string().min(1),
	profilePicture: z.string().optional(),
	dateOfBirth: z.string(generateErrorMessages('date of birth'))
    .refine(value => {
      const currentDate = new Date();
      const enteredDate = new Date(value);

      // Calculate age difference in years
      const ageDifference = currentDate.getFullYear() - enteredDate.getFullYear();

      // Check if the age is at least 16 years
      if (ageDifference > 16) {
        return true;
      } else if (ageDifference < 16) {
        return false;
      } else {
        // ageDifference === 16
        const currentMonth = currentDate.getMonth();
        const birthMonth = enteredDate.getMonth();
        const currentDay = currentDate.getDate();
        const birthDay = enteredDate.getDate();

        if (currentMonth > birthMonth) {
          return true;
        } else if (currentMonth < birthMonth) {
          return false;
        } else {
          // currentMonth === birthMonth
          return currentDay >= birthDay;
        }
      }
    }, 'You must be at least 16 years old to register'),
	gender: z.nativeEnum($Enums.Gender, { required_error: 'Please select your gender' }),
	mentalHealthGoals: z.array(z.string()).nonempty('Please select at least ONE mental health goal').max(6, 'You can select at most SIX mental health goals'),
  toneFocus: z.number().min(0, 'Please select a value greater than or equal to 0').max(5, 'Please select a value less than or equal to 5'),
  responseStyle: z.number().min(0, 'Please select a value greater than or equal to 0').max(5, 'Please select a value less than or equal to 5'),
  approachType: z.number().min(0, 'Please select a value greater than or equal to 0').max(5, 'Please select a value less than or equal to 5')
});

export const AffirmationSchema = z.object({
  category: z.string().min(1, 'Please select a category'),
  voice: z.string().min(1, 'Please select a voice'),
  sentenceCount: z.coerce.number().min(1, 'Please enter your sentence count'),
  sentenceComplexity: z.nativeEnum($Enums.Complexity).default('SIMPLE'),
  tone: z.nativeEnum($Enums.Tone).default('MOTIVATING'),
  timeframe: z.nativeEnum($Enums.Timeframe).default('PRESENT_FOCUSED'),
  culturalBackground: z.string().optional()
});

// category, culturalBackground, tone, sentenceCount, sentenceComplexity & timeframe
