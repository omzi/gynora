import { useState, useEffect, useCallback, useMemo } from 'react';

export const useTextToSpeech = (message: string) => {
	const [text] = useState(message);
	const [isReading, setIsReading] = useState(false);
	const [isBrowserSupported, setIsBrowserSupported] = useState(false);

	useEffect(() => {
		setIsBrowserSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
	}, []);

	const utterance = useMemo(() => {
		if (!isBrowserSupported) return null;

		const $ = new SpeechSynthesisUtterance(text);
		$.lang = 'en-US';
		$.pitch = 1;
		$.rate = 1;
		$.volume = 0.5;

		$.onstart = () => {
			setIsReading(true);
		};

		$.onend = () => {
			setIsReading(false);
		};

		return $;
	}, [text, isBrowserSupported]);

	const start = useCallback(() => {
		if (isBrowserSupported && utterance) {
			window.speechSynthesis.speak(utterance);
		}
	}, [utterance, isBrowserSupported]);

	const pause = useCallback(() => {
		if (isBrowserSupported) {
			window.speechSynthesis.pause();
		}
	}, [isBrowserSupported]);

	const stop = useCallback(() => {
		if (isBrowserSupported) {
			window.speechSynthesis.cancel();
			setIsReading(false);
		}
	}, [isBrowserSupported]);

	useEffect(() => {
		return () => {
			if (isBrowserSupported) {
				window.speechSynthesis.cancel();
			}
		};
	}, [isBrowserSupported]);

	return {
		isReading,
		start,
		pause,
		stop,
		isBrowserSupported
	};
};
