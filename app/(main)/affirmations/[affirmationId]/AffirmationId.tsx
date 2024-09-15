/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { Prisma } from '@prisma/client';
import { Button } from '#/components/ui/button';
import { Slider } from '#/components/ui/slider';
import { useEffect, useRef, useState } from 'react';
import { parseSubtitle, formatTime } from '#/lib/utils';
import { PlayIcon, PauseIcon, RewindIcon, FastForwardIcon, Volume2, VolumeXIcon, Repeat1Icon, RepeatIcon } from 'lucide-react';

interface AffirmationIdProps {
	affirmation: Prisma.AffirmationGetPayload<{}>;
	subtitle: ReturnType<typeof parseSubtitle>;
};

const AffirmationId = ({ affirmation, subtitle }: AffirmationIdProps) => {
	const [duration, setDuration] = useState(0);
	const [isMuted, setIsMuted] = useState(false);
	const audioRef = useRef<HTMLAudioElement>(null);
	const [isLooping, setIsLooping] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

	useEffect(() => {
		if (audioRef.current) {
			setDuration(audioRef.current.duration);
		}
	}, [audioRef.current?.duration]);

	const togglePlay = () => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				audioRef.current.play();
			}

			setIsPlaying(!isPlaying);
		}
	};

	const handleSeek = (value: number[]) => {
		if (audioRef.current) {
			audioRef.current.currentTime = value[0];
			setCurrentTime(value[0]);
		}
	};

	const handleRewind = () => {
		if (audioRef.current) {
			audioRef.current.currentTime -= 5;
		}
	};

	const handleFastForward = () => {
		if (audioRef.current) {
			audioRef.current.currentTime += 5;
		}
	};

	const toggleMute = () => {
		if (audioRef.current) {
			audioRef.current.muted = !isMuted;
			setIsMuted(!isMuted);
		}
	};

	const handleTimeUpdate = () => {
		if (audioRef.current) {
			const currentTime = audioRef.current.currentTime;
			setCurrentTime(currentTime);

			// Scroll the current line into view
			const currentLineIndex = subtitle.findIndex(line => currentTime >= line.start && currentTime < line.end);
			if (currentLineIndex !== -1 && lineRefs.current[currentLineIndex]) {
				lineRefs.current[currentLineIndex]?.scrollIntoView({
					behavior: 'smooth',
					block: 'center'
				});
			}

			if (isLooping && currentTime >= duration) {
				audioRef.current.currentTime = 0;
				audioRef.current.play();
			}
		}
	};

	const toggleLoop = () => {
		setIsLooping(previous => !previous);
	};

	const handleLineClick = (start: number) => {
		if (audioRef.current) {
			audioRef.current.currentTime = start;
			setCurrentTime(start);
			if (!isPlaying) {
				audioRef.current.play();
				setIsPlaying(true);
			}
		}
	};

	return (
		<div className='flex flex-col h-full relative -m-4 md:-mx-8'>
			<div className='flex-grow overflow-auto p-6'>
				<div className='max-w-4xl mx-auto bg-accent rounded-lg shadow-md p-6'>
					<div className='space-y-2'>
						{subtitle.map((line, idx) => {
							const nextLineStart = idx < subtitle.length - 1 ? subtitle[idx + 1].start : Infinity;

							return (
								<p
									key={idx}
									ref={element => { lineRefs.current[idx] = element; }}
									className={`cursor-pointer text-xl font-bold p-2 rounded ${currentTime >= line.start && currentTime < nextLineStart
											? 'bg-primary text-primary-foreground'
											: currentTime >= nextLineStart
												? 'bg-muted'
												: ''
										}`}
									onClick={() => handleLineClick(line.start)}
								>
									{line.text}
								</p>
							);
						})}
					</div>
				</div>
			</div>
			<div className='bg-background p-4 border-t -mb-6'>
				<div className='max-w-4xl mx-auto'>
					<audio
						ref={audioRef}
						src={`${affirmation.audioUrl}`}
						onTimeUpdate={handleTimeUpdate}
						onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
					/>
					<Slider
						value={[currentTime]}
						max={duration}
						step={0.1}
						onValueChange={handleSeek}
						className='mb-4'
					/>
					<div className='flex items-center justify-between'>
						<div className='flex items-center space-x-2'>
							<Button size='icon' variant='ghost' onClick={handleRewind}>
								<RewindIcon className='h-4 w-4' />
							</Button>
							<Button size='icon' onClick={togglePlay}>
								{isPlaying ? <PauseIcon className='h-4 w-4' /> : <PlayIcon className='h-4 w-4' />}
							</Button>
							<Button size='icon' variant='ghost' onClick={handleFastForward}>
								<FastForwardIcon className='h-4 w-4' />
							</Button>
							<Button size='icon' variant='ghost' onClick={toggleMute}>
								{isMuted ? <VolumeXIcon className='h-4 w-4' /> : <Volume2 className='h-4 w-4' />}
							</Button>
							<Button size='icon' variant='ghost' onClick={toggleLoop}>
								{isLooping ? <Repeat1Icon className='h-4 w-4' /> : <RepeatIcon className='h-4 w-4' />}
							</Button>
						</div>
						<div className='text-sm'>
							{formatTime(currentTime)} / {formatTime(duration)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AffirmationId;
