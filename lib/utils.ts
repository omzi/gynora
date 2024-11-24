import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';
import { type ClassValue, clsx } from 'clsx';
import { UserDataSchema } from '#/lib/validations';
import { DiaryFreeDiet, GlutenFreeDiet, KetoDiet, MediterraneanDiet, PaleoDiet, VeganDiet } from '#/lib/icons/diet';

export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};

export const getScrollbarWidth = () => {
  const div = document.createElement('div');

  div.style.width = '100px';
  div.style.height = '100px';
  div.style.overflow = 'scroll';
  div.style.position = 'absolute';
  div.style.top = '-9999px';

  document.body.appendChild(div);

  // Calculate the scrollbar width
  const scrollbarWidth = div.offsetWidth - div.clientWidth;

  document.body.removeChild(div);

  return scrollbarWidth;
};

export const formatName = (fullName: string): string => {
  const [firstName, ...lastNameParts] = fullName.split(' ');
  const lastName = lastNameParts.join(' ');

  return `${firstName} (first name) ${lastName} (last name)`;
};

export const getInitials = (name: string): string => {
	const [first, second = ''] = name.split(' ');

	return (first + second).toUpperCase();
};

export const formatNumberWithCommas = (number: number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const generateDefaultAvatar = (seed: string) => {
  return `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${seed}`;
};

export const isBase64Image = (imageData: string) => {
  return /^data:image\/(png|jpe?g|gif|webp);base64,/.test(imageData);
};

export const titleCase = (input: string): string => {
  return input.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

export const copyToClipboard = async (text: string, successMessage: string): Promise<boolean> => {
	try {
		await navigator.clipboard.writeText(text);
		toast.success(successMessage);
		return true;
	} catch (error) {
		try {
			const textarea = document.createElement('textarea');
			textarea.value = text;
			textarea.setAttribute('readonly', '');
			textarea.style.position = 'absolute';
			textarea.style.left = '-9999px';
			document.body.appendChild(textarea);
			
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
			toast.success(successMessage);

			return true;
		} catch (fallbackError) {
			console.error('Copying to clipboard failed :>>', fallbackError);
			return false;
		}
	}
};

export const blurActiveElement = () => {
  const activeElement = document.activeElement as HTMLElement;
  if (activeElement) activeElement.blur();
};

export const resizeImage = async (dataUrl: string, newWidth: number, newHeight: number, quality: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const originalWidth = image.width;
      const originalHeight = image.height;

      // Determine the scale factors to maintain the aspect ratio
      const widthRatio = newWidth / originalWidth;
      const heightRatio = newHeight / originalHeight;
      const ratio = Math.max(widthRatio, heightRatio);

      // Calculate the dimensions of the scaled image
      const scaledWidth = originalWidth * ratio;
      const scaledHeight = originalHeight * ratio;

      // Calculate the cropping coordinates to center the image
      const cropX = (scaledWidth - newWidth) / 2;
      const cropY = (scaledHeight - newHeight) / 2;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Ensure the canvas dimensions match the resized dimensions
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw the scaled and cropped image onto the canvas
      ctx.drawImage(image, -cropX, -cropY, scaledWidth, scaledHeight);

      // Convert the canvas to a data URL
      const resizedDataUrl = canvas.toDataURL('image/jpeg', quality);

      resolve(resizedDataUrl);
    };

    image.onerror = reject;
    image.src = dataUrl;
  });
};

export const compressImage = async (dataURI: string, quality: number, scaleFactor: number): Promise<string> => {
  const loadImage = (dataURI: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
      image.src = dataURI;
    });
  };

  const image = await loadImage(dataURI);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to get 2D context');
  }

  const originalWidth = image.width;
  const originalHeight = image.height;
  const newWidth = originalWidth * scaleFactor;
  const newHeight = originalHeight * scaleFactor;

  canvas.width = newWidth;
  canvas.height = newHeight;

  context.drawImage(image, 0, 0, newWidth, newHeight);

  const compressedDataURI = canvas.toDataURL('image/jpeg', quality);

  return compressedDataURI;
};

export const dataURIToFile = (dataURI: string, fileName: string): File => {
  const [header, base64] = dataURI.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  if (!mimeMatch) {
    throw new Error('Invalid data URI format');
  }

  const mimeType = mimeMatch[1];
  const binaryString = atob(base64);
  const binaryLength = binaryString.length;
  const binaryArray = new Uint8Array(binaryLength);

  // Convert binary string to binary array
  for (let i = 0; i < binaryLength; i++) {
    binaryArray[i] = binaryString.charCodeAt(i);
  }

  const blob = new Blob([binaryArray], { type: mimeType });

  return new File([blob], fileName, { type: mimeType });
};

export const blobToFile = async (blob: Blob, fileName: string) => {
  const arrayBuffer = await blob.arrayBuffer();
  const file = new File([arrayBuffer], fileName, { type: blob.type });
  return file;
};

export const generateRandomChars = (() => {
	const generateChars = (min: number, max: number): string[] => Array.from({ length: max - min + 1 }, (_, i) => String.fromCharCode(min + i));

	const sets = {
		numeric: generateChars(48, 57),
		lowerCase: generateChars(97, 122),
		upperCase: generateChars(65, 90),
		special: [...`~!@#$%^&*()_+-=[]\{}|;:'",./<>?`],
		alphanumeric: [
			...generateChars(48, 57),
			...generateChars(65, 90),
			...generateChars(97, 122)
		]
	};

	const iter = function* (
		len: number,
		set: string[] | undefined
	): Generator<string, void, unknown> {
		if (set && set.length < 1) set = Object.values(sets).flat();
		for (let i = 0; i < len; i++) yield set![(Math.random() * set!.length) | 0];
	};

	return Object.assign(
		(len: number, ...set: string[]) => [...iter(len, set.flat())].join(''),
		sets
	);
})();

export const generateOneTimePassword = (length: number): string => {
  const chars = '0123456789';
  const charsLength = chars.length;
  const isBrowser = typeof window !== 'undefined' && typeof window.crypto !== 'undefined';
  
  let oneTimePassword = '';
  const randomValues = new Uint8Array(length);
  if (isBrowser) {
    window.crypto.getRandomValues(randomValues);
  } else {
    // Node.js environment
    const { randomBytes } = require('crypto');
    const bytes = randomBytes(length);
    for (let i = 0; i < length; i++) {
      randomValues[i] = bytes[i];
    }
  }

  for (let i = 0; i < length; i++) {
    oneTimePassword += chars[randomValues[i] % charsLength];
  }

  return oneTimePassword;
};

export const UUIDRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const prompts = [
  {
    standalone: 'Help me cope with anxiety',
    nonStandalone: 'that I’ve been feeling lately'
  },
  {
    standalone: 'Suggest ways to manage stress',
    nonStandalone: 'that I can apply throughout the day'
  },
  {
    standalone: 'Give me advice on dealing with burnout',
    nonStandalone: 'while balancing work and life'
  },
  {
    standalone: 'Offer tips for improving my mood',
    nonStandalone: 'on days when I feel down'
  },
  {
    standalone: 'How can I better manage feelings of grief',
    nonStandalone: 'during difficult moments?'
  },
  {
    standalone: 'Provide advice on handling relationship conflicts',
    nonStandalone: 'in a healthy way'
  },
  {
    standalone: 'Give me suggestions on how to overcome feelings of isolation',
    nonStandalone: 'and reconnect with others'
  },
  {
    standalone: 'What can I do to manage anger more effectively',
    nonStandalone: 'without lashing out?'
  },
  {
    standalone: 'Recommend techniques for managing panic attacks',
    nonStandalone: 'that I can try right now'
  },
  {
    standalone: 'How do I stay grounded during overwhelming situations',
    nonStandalone: 'when everything feels too much?'
  },
  {
    standalone: 'Help me deal with feelings of inadequacy',
    nonStandalone: 'especially when comparing myself to others'
  },
  {
    standalone: 'Give me advice on setting boundaries',
    nonStandalone: 'with friends and family'
  },
  {
    standalone: 'Suggest coping mechanisms for trauma triggers',
    nonStandalone: 'that might help me feel safe'
  },
  {
    standalone: 'Help me manage overwhelming feelings of guilt',
    nonStandalone: 'in a constructive way'
  },
  {
    standalone: 'Offer strategies for handling obsessive thoughts',
    nonStandalone: 'that disrupt my daily life'
  },
  {
    standalone: 'How can I manage my fear of failure',
    nonStandalone: 'in both personal and professional areas?'
  },
  {
    standalone: 'Suggest ways to reduce social anxiety',
    nonStandalone: 'in group settings or public spaces'
  },
  {
    standalone: 'Help me deal with negative self-talk',
    nonStandalone: 'and replace it with something positive'
  },
  {
    standalone: 'What can I do to feel more in control of my emotions',
    nonStandalone: 'during emotionally charged situations?'
  },
  {
    standalone: 'Give me tips on managing uncertainty',
    nonStandalone: 'and staying calm when I don’t know what’s coming next'
  }
];


// export const shuffleArray = (array: any[]) => {
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }

  return shuffledArray;
};

export const publicRoutes = ['/', '/terms', '/privacy-policy', '/api/edgestore/init'];
export const authRoutes = [
	'/auth/error',
	'/auth/sign-up',
	'/auth/sign-in',
	'/auth/verify-account',
	'/auth/forgot-password',
	'/auth/reset-password'
];
export const metaRoutes = [
	'/android-chrome-192x192.png',
	'/android-chrome-512x512.png',
	'/apple-touch-icon.png',
	'/browserconfig.xml',
	'/favicon-32x32.png',
	'/favicon-16x16.png',
	'/mstile-150x150.png',
	'/manifest.webmanifest',
	'/safari-pinned-tab.svg'
];

export const API_AUTH_PREFIX = '/api/auth';
export const SIGN_IN_ROUTE = '/auth/sign-in';
export const DEFAULT_SIGN_IN_REDIRECT = '/dashboard';

export const defaultStepsState = [
	{
		id: 1,
		title: 'Personal Information',
		subtitle: `Let's start with some basic information about you to personalize your experience.`,
		status: 'upcoming',
		fields: ['profilePicture', 'dateOfBirth', 'gender'],
		endpoint: ''
	},
	{
		id: 2,
		title: `Mental Health Goals`,
		subtitle: `Is there anything specific you'd like to address or need help with now?`,
		status: 'upcoming',
		fields: ['mentalHealthGoals'],
		endpoint: ''
	},
	{
		id: 3,
		title: `Customization`,
    subtitle: `I'm going to help you through your mental health journey. What attributes would you like me to have?`,
		status: 'upcoming',
    fields: ['toneFocus', 'responseStyle', 'approachType'],
		endpoint: ''
	}
];

export type StepsType = typeof defaultStepsState;
export type UserDataType = (typeof UserDataSchema)['_output'];

export const extractStepData = (data: UserDataType, fields: string[]) => {
  // Filter the data for the current step based on the fields array
  const stepData = Object.fromEntries(
    Object.entries(data).filter(([key]) => fields.includes(key))
  );

  return stepData;
};

export const mentalHealthGoals = [
  'Anxiety',
  'Depression',
  'Stress Management',
  'Relationship Issues',
  'Self-Esteem & Confidence',
  'Grief & Loss',
  'Addiction Recovery',
  'Trauma Healing',
  'Anger Management',
  'Family Dynamics',
  'Parenting Challenges',
  'Disordered Eating',
  'Sleep Issues',
  'Career Stress',
  'Workplace Burnout',
  'Financial Worries',
  'Chronic Health Conditions',
  'Living with a Disability',
  'LGBTQ+ Support',
  'Religious Struggles',
  'Spiritual Guidance',
  'Cultural Identity',
  'Racial Challenges',
  'Emotional Fatigue',
  'Loneliness',
  'Overthinking',
  'Panic Attacks',
  'Social Anxiety',
  'Fear of Failure',
  'Procrastination',
  'Guilt or Shame',
  'Feeling Overwhelmed',
  'Personal Growth',
  'Coping with Change',
  'Imposter Syndrome',
  'Communication Issues',
  'Perfectionism',
  'Coping with Rejection',
  'Emotional Detachment'
];

export const GENDERS = [
	{ text: 'Male', value: 'MALE' },
	{ text: 'Female', value: 'FEMALE' },
	{ text: 'Non-Binary', value: 'NON_BINARY' },
	{ text: 'Prefer Not To Say', value: 'PREFER_NOT_TO_SAY' }
];

export const chartColors = {
	increase: 'emerald',
	moderateIncrease: 'emerald',
	unchanged: 'orange',
	moderateDecrease: 'rose',
	decrease: 'rose'
};

type DeltaType = keyof typeof chartColors;

export const formatPercentageDelta = (percentage: string): { absoluteValue: number; deltaType: DeltaType } => {
	const numericPercentage = parseFloat(percentage);
	const absoluteValue = Math.abs(numericPercentage);

	if (numericPercentage > 35) {
		return { absoluteValue, deltaType: 'increase' };
	} else if (numericPercentage > 0) {
		return { absoluteValue, deltaType: 'moderateIncrease' };
	} else if (numericPercentage === 0) {
		return { absoluteValue, deltaType: 'unchanged' };
	} else if (numericPercentage >= -35) {
		return { absoluteValue, deltaType: 'moderateDecrease' };
	} else {
		return { absoluteValue, deltaType: 'decrease' };
	}
};

export const calculateMonthlyPercentageChange = (currentValue: number, previousValue: number) => {
	if (previousValue === 0) {
		return currentValue > 0 ? '100' : '0'; // If it's the first month, consider it as a 100% increase
	}

	const monthlyPercentageChange = ((currentValue - previousValue) / previousValue) * 100;
	return monthlyPercentageChange.toFixed(2);
};

export const getFirstDayOfMonth = (month: number) => new Date(new Date().getFullYear(), month, 1);
export const getLastDayOfMonth = (month: number) => new Date(new Date().getFullYear(), month + 1, 0);

export const mentalHealthTips = [
  'Practice mindfulness and meditation to reduce stress.',
  'Take deep breaths when you feel overwhelmed.',
  'Get at least 7-9 hours of sleep every night.',
  'Engage in physical activities like yoga or running.',
  'Connect with friends and loved ones regularly for emotional support.',
  'Set aside time for hobbies and activities you enjoy.',
  'Limit your exposure to negative news and social media.',
  'Seek professional help when feeling persistently anxious or depressed.',
  'Focus on positive self-talk and affirmations.',
  'Create a routine to provide structure and a sense of control.',
  'Practice gratitude by writing down things you are thankful for.',
  'Limit caffeine and sugar to avoid mood swings.',
  'Learn to say no to prevent burnout.',
  'Try journaling to process emotions and gain clarity.',
  'Stay informed about mental health through education and self-awareness.',
  'Practice deep relaxation techniques like progressive muscle relaxation.',
  'Spend time in nature to refresh your mind and body.',
  'Avoid comparing yourself to others, focus on your personal journey.',
  'Make time for regular self-care activities.',
  'Set realistic and achievable goals to avoid overwhelming yourself.',
  'Celebrate small wins to boost your self-esteem.',
  'Practice positive visualization to relieve stress.',
  'Identify and challenge negative thought patterns.',
  'Take regular breaks during work or study sessions to avoid mental fatigue.',
  'Cultivate a sense of humor; laughter is a great stress reliever.',
  'Keep a gratitude journal to focus on the positives.',
  'Limit alcohol and other substances that can negatively impact mood.',
  'Develop a solid support network and reach out when you need help.',
  'Learn to forgive yourself and others to reduce emotional burden.',
  'Engage in creative activities like painting, writing, or music.',
  'Practice empathy and kindness, both toward yourself and others.',
  'Try guided relaxation apps or videos to calm your mind.',
  'Acknowledge your feelings without judgment.',
  'Understand that it’s okay to feel upset or sad sometimes.',
  'Take things one step at a time when facing a challenge.',
  'Keep track of your mood to recognize patterns and triggers.',
  'Avoid multitasking; focus on one task at a time.',
  'Minimize screen time before bed to improve sleep quality.',
  'Seek help from a mental health professional when needed.',
  'Declutter your living space to reduce stress and anxiety.',
  'Create a peaceful and calming environment at home.',
  'Develop healthy boundaries in relationships and work.',
  'Practice saying “no” when you feel overwhelmed.',
  'Reduce procrastination by breaking tasks into smaller steps.',
  'Reflect on past challenges you’ve overcome for confidence.',
  'Give yourself permission to rest when you need it.',
  'Avoid perfectionism; strive for progress, not perfection.',
  'Limit your exposure to triggering or negative content.',
  'Take time to connect with your inner self through meditation.',
  'Volunteer or help others to gain perspective and satisfaction.',
  'Spend quality time with loved ones to strengthen connections.',
  'Focus on what you can control and let go of what you can’t.',
  'Take time each day for personal reflection and growth.',
  'Avoid making decisions when you’re feeling highly emotional.',
  'Engage in positive activities that improve your self-esteem.',
  `Remember that it's okay to ask for help when needed.`,
  'Spend time with animals or pets for emotional support.',
  'Use grounding techniques when feeling anxious or panicked.',
  'Limit social media use, especially if it makes you feel stressed.',
  'Practice breathing exercises to calm your mind and body.',
  'Set aside time for relaxation every day, even if just for a few minutes.',
  'Listen to music that makes you feel calm and happy.',
  'Acknowledge and reward your progress, no matter how small.',
  'Don’t be afraid to take mental health days when needed.',
  'Focus on activities that promote mental clarity and focus.',
  'Surround yourself with positive, supportive people.',
  'Join a support group for people going through similar struggles.',
  'Take note of your triggers and develop strategies to manage them.',
  'Practice acceptance; know that some things are beyond your control.',
  'Use positive affirmations to boost your mood and confidence.',
  'Give yourself time to grieve or process difficult emotions.',
  'Do something kind for yourself each day, even if it’s small.',
  'Balance work and play to avoid burnout.',
  'Keep a journal to track your mental health progress over time.',
  'Take regular breaks from technology and reconnect with the present.',
  'Express your emotions in healthy ways, like through art or writing.',
  'Stay open to learning new coping skills and strategies.',
  'Maintain a consistent sleep schedule, even on weekends.',
  'Avoid isolating yourself; make an effort to connect with others.',
  'Talk to someone you trust about your feelings or concerns.',
  'Incorporate calming practices like aromatherapy into your routine.',
  'Try to find humor in everyday situations to lighten your mood.',
  'Celebrate the things you’ve accomplished, no matter how small.',
  'Let go of toxic relationships that drain your energy.',
  'Seek out new hobbies or interests to boost your sense of fulfillment.',
  'Take time to relax and enjoy the little moments in life.',
  'Practice self-compassion and avoid being overly critical of yourself.',
  'Set healthy boundaries to protect your mental and emotional space.',
  'Acknowledge your limits and avoid overcommitting.',
  'Prioritize tasks that align with your values and well-being.',
  'Give yourself permission to feel emotions without judgment.',
  'Practice active listening in conversations to improve communication.',
  'Find moments of joy in everyday activities.',
  'Engage in positive self-reflection at the end of each day.',
  'Avoid rushing through life; practice mindfulness in daily tasks.',
  'Spend time outdoors in natural settings to boost your mood.',
  'Take short naps when feeling mentally drained or exhausted.',
  'Challenge yourself to step out of your comfort zone occasionally.',
  'Limit your exposure to noise pollution for mental clarity.',
  'Reflect on your personal strengths and how they’ve helped you.'
];

export const compileTemplate = <T extends Record<string, any>>(template: string, values: T): string => {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const trimmedKey = key.trim() as string;
    return trimmedKey in values ? String(values[trimmedKey]) : `{{${trimmedKey}}}`;
  });
};

export const voices = [
  { id: 'echo', src: '/voices/echo', text: 'Echo' },
  { id: 'alloy', src: '/voices/alloy', text: 'Alloy' },
  { id: 'fable', src: '/voices/fable', text: 'Fable' },
  { id: 'onyx', src: '/voices/onyx', text: 'Onyx' },
  { id: 'nova', src: '/voices/nova', text: 'Nova' },
  { id: 'shimmer', src: '/voices/shimmer', text: 'Shimmer' }
] as const;

export const CATEGORIES = [
  'Self-Love',
  'Gratitude',
  'Positivity',
  'Confidence',
  'Resilience',
  'Stress Relief',
  'Anxiety Reduction',
  'Mindfulness',
  'Focus And Clarity',
  'Emotional Balance',
  'Self-Acceptance',
  'Healthy Boundaries',
  'Compassion',
  'Forgiveness',
  'Communication Skills',
  'Goal Setting',
  'Overcoming Fear',
  'Motivation',
  'Life Purpose',
  'Adaptability',
  'Professional Growth',
  'Creativity',
  'Leadership',
  'Work-Life Balance',
  'Achievement',
  'Physical Fitness',
  'Nutrition And Self-Care',
  'Healing',
  'Energy And Vitality',
  'Body Positivity',
  'Inner Peace',
  'Connection To The Universe',
  'Spiritual Growth',
  'Mind-Body Connection',
  'Trusting Intuition',
  'Financial Independence',
  'Attracting Opportunities',
  'Abundance Mindset',
  'Overcoming Scarcity Mentality',
  'Generosity',
  'Embracing Change',
  'Openness To New Experiences',
  'Travel And Exploration',
  'Creativity In Daily Life',
  'Breaking Out Of Comfort Zones',
  'Living In The Moment',
  'Awareness',
  'Acceptance',
  'Non-Judgment',
  'Simplicity'
];

export const TONES = [
  { text: 'Motivating', value: 'MOTIVATING' },
  { text: 'Encouraging', value: 'ENCOURAGING' },
  { text: 'Empowering', value: 'EMPOWERING' },
  { text: 'Soothing', value: 'SOOTHING' },
  { text: 'Reflective', value: 'REFLECTIVE' }
];

export const COMPLEXITY = [
  { text: 'Simple', value: 'SIMPLE' },
  { text: 'Moderate', value: 'MODERATE' },
  { text: 'Complex', value: 'COMPLEX' }
];

export const TIMEFRAME = [
  { text: 'Present-Focused', value: 'PRESENT_FOCUSED' },
  { text: 'Future-Oriented', value: 'FUTURE_ORIENTED' },
  { text: 'Past-Transcending', value: 'PAST_TRANSCENDING' }
];

export const parseSubtitle = (subtitleText: string) => {
  const lines = subtitleText.split('\n');
  const entries = [];
  let start = 0;
  let end = 0;
  let text = '';

  for (const line of lines) {
    // Skip WEBVTT header or empty lines
    if (line.startsWith('WEBVTT') || line.trim() === '') continue;

    // Check for timestamp lines and handle both formats
    const timeMatch = line.match(/(\d{2}):(\d{2})(?::(\d{2}))?\.(\d{3}) --> (\d{2}):(\d{2})(?::(\d{2}))?\.(\d{3})/);
    
    if (timeMatch) {
      if (text) {
        entries.push({ start, end, text: text.trim() });
        text = '';  // Reset text for next subtitle
      }

      // Convert timestamps based on the match
      if (timeMatch[3] && timeMatch[6]) {
        // Old format: HH:MM:SS.MS --> HH:MM:SS.MS
        start = convertToSecondsOldFormat(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4]);
        end = convertToSecondsOldFormat(timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8]);
      } else {
        // New format: MM:SS.MS --> MM:SS.MS
        start = convertToSecondsNewFormat(timeMatch[1], timeMatch[2], timeMatch[4]);
        end = convertToSecondsNewFormat(timeMatch[5], timeMatch[6], timeMatch[8]);
      }
    } else if (line.trim()) {
      // Accumulate subtitle text
      text += line + ' ';
    }
  }

  // Add the last entry if there's text left
  if (text) {
    entries.push({ start, end, text: text.trim() });
  }

  return entries;
};

// Helper function for converting the new format (MM:SS.MS --> MM:SS.MS) to seconds
export const convertToSecondsNewFormat = (minutes: string, seconds: string, milliseconds: string): number => {
  const totalSeconds = parseInt(minutes) * 60 + parseFloat(`${seconds}.${milliseconds}`);
  return totalSeconds;
};

// Helper function for converting the old format (HH:MM:SS.MS --> HH:MM:SS.MS) to seconds
export const convertToSecondsOldFormat = (hours: string, minutes: string, seconds: string, milliseconds: string): number => {
  const totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(`${seconds}.${milliseconds}`);
  return totalSeconds;
};

export const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
