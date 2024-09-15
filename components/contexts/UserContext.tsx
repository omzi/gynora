'use client';

import { User, UserData } from '@prisma/client';
import { createContext, FC, ReactNode, useContext } from 'react';

type UserContextType = {
	user: User;
	userData: UserData;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

type UserProviderProps = {
	user: User;
	userData: UserData;
	children: ReactNode;
};

export const UserProvider: FC<UserProviderProps> = ({ user, userData, children }) => {
	return (
		<UserContext.Provider value={{ user, userData }}>
			{children}
		</UserContext.Provider>
	);
};

export const useUser = (): User => {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error('useUser must be used within a UserProvider');
	}
	return context.user;
};

export const useUserData = (): UserData => {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error('useUserData must be used within a UserProvider');
	}
	return context.userData;
};
