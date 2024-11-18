import { create } from 'zustand';

const defaultValues = { id: '', name: '' };

interface IRenameModal {
	isOpen: boolean;
	initialValues: typeof defaultValues;
	onOpen: (id: string, name: string) => void;
	onClose: () => void;
};

export const useRenameModal = create<IRenameModal>((set) => ({
	isOpen: false,
	onOpen: (id, name) => set({
		isOpen: true,
		initialValues: { id, name }
	}),
	onClose: () => set({
		isOpen: false,
		initialValues: defaultValues
	}),
	initialValues: defaultValues
}));
