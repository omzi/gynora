'use client'

import generateSpeech from '#/lib/actions/generateSpeech';
import { useState, useEffect, useRef, useCallback } from 'react';

export function useOpenAITextToSpeech(initialText: string) {
	const [text, setText] = useState(initialText);
	const [isLoading, setIsLoading] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const generate = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const audioData = await generateSpeech(text);
			const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
			const audioUrl = URL.createObjectURL(audioBlob);

			if (audioRef.current) {
				audioRef.current.src = audioUrl;
			} else {
				audioRef.current = new Audio(audioUrl);
			}

			audioRef.current.onended = () => setIsPlaying(false);
			setIsLoading(false);
		} catch (error) {
			setError(error instanceof Error ? error.message : 'An unknown error occurred');
			setIsLoading(false);
		}
	}, [text]);

	const play = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.play();
			setIsPlaying(true);
		}
	}, []);

	const pause = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.pause();
			setIsPlaying(false);
		}
	}, []);

	const stop = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
			setIsPlaying(false);
		}
	}, []);

	useEffect(() => {
		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				URL.revokeObjectURL(audioRef.current.src);
			}
		};
	}, []);

	return {
		text,
		setText,
		generate,
		play,
		pause,
		stop,
		isLoading,
		isPlaying,
		error
	};
};
