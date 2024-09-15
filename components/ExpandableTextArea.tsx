'use client';

import { useState, useEffect, useRef, TextareaHTMLAttributes } from 'react';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

const ExpandableTextArea = (props: Props) => {
	const [textAreaValue, setTextAreaValue] = useState<string>('');
	const textAreaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (textAreaRef.current) {
			textAreaRef.current.style.height = textAreaRef.current.scrollHeight > 48 ? 'auto' : `${textAreaRef.current.scrollHeight}px`;
		}
	}, [textAreaValue, props.value]);

	const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		props.onChange
			? props.onChange(event)
			: setTextAreaValue(event.target.value);
	};

	const handleContentKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			const value = props.value || textAreaValue;
			const trimmedValue = `${value}`.replace(/^[\s\n]+|[\s\n]+$/g, '');

			if (trimmedValue) {
				setTextAreaValue(trimmedValue);
				const form = textAreaRef.current?.closest('form');
				if (form) {
					form.requestSubmit();
				}
			} else {
				e.preventDefault();
			}
		}
	};

	return (
		<textarea
			{...props}
			ref={textAreaRef}
			value={props.value ?? textAreaValue}
			onChange={handleInputChange}
			onKeyDown={handleContentKeyDown}
			style={{ resize: 'none' }}
			rows={1}
		/>
	);
};

export default ExpandableTextArea;
