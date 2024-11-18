import { create } from 'zustand';

type AffirmationModalStore = {
	isOpen: boolean;
	onOpen: () => void;
	onClose: () => void;
	toggle: () => void;
};

export const useAffirmationModal = create<AffirmationModalStore>((set, get) => ({
	isOpen: false,
	onOpen: () => set({ isOpen: true }),
	onClose: () => set({ isOpen: false }),
	toggle: () => set({ isOpen: !get().isOpen })
}));
