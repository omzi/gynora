import { voices } from '#/lib/utils';
import { $Enums } from '@prisma/client';
import { type DefaultSession } from 'next-auth';

export type ExtendedUser = DefaultSession['user'] & {
  id: string;
  role: $Enums.Role;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
};

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends ExtendedUser {}
}

export type OptionalExcept<T, K extends keyof T> = {
  [P in keyof T as P extends K ? P : never]: T[P];
} & {
  [P in keyof T as P extends K ? never : P]?: T[P];
};

export interface ChatHistory {
  id: string;
  name: string;
  lastUpdated: string;
  lastMessageContent: string;
};

export interface Affirmation {
  id: string;
  category: string;
  tone: string;
  createdAt: string;
};

export type Voice = typeof voices[number]['id'];
