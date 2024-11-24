import { useState, useEffect, useRef } from 'react';
import { Button } from '#/components/ui/button';
import { MicIcon, StopCircleIcon } from 'lucide-react';
import { Dialog, DialogContent } from '#/components/ui/dialog';
import { toast } from 'react-toastify';
import { cn } from '#/lib/utils';

interface AudioRecordingDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onTranscriptionComplete: (transcription: string) => void;
}

const AudioRecordingDialog = ({
	isOpen,
	onClose,
	onTranscriptionComplete,
}: AudioRecordingDialogProps) => {
	const [isRecording, setIsRecording] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);
	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const lastSpeechTimeRef = useRef<number>(Date.now());
	const silenceDetectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (!isOpen) {
			cleanupRecording();
		}
		return () => cleanupRecording();
	}, [isOpen]);

	const cleanupRecording = () => {
		if (silenceDetectionTimeoutRef.current) {
			clearTimeout(silenceDetectionTimeoutRef.current);
		}

		if (sourceRef.current) {
			sourceRef.current.disconnect();
		}

		if (streamRef.current) {
			streamRef.current.getTracks().forEach(track => track.stop());
		}

		if (audioContextRef.current) {
			audioContextRef.current.close();
		}

		setIsRecording(false);
		setIsProcessing(false);
		analyserRef.current = null;
		sourceRef.current = null;
		streamRef.current = null;
		audioContextRef.current = null;
		silenceDetectionTimeoutRef.current = null;
		lastSpeechTimeRef.current = Date.now();
	};

	const setupAudioRecording = async () => {
		try {
			const devices = await navigator.mediaDevices.enumerateDevices();
			const audioDevice = devices.find(device => device.kind === 'audioinput');
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: audioDevice ? { deviceId: audioDevice.deviceId } : true
			});
			streamRef.current = stream;

			audioContextRef.current = new AudioContext();
			analyserRef.current = audioContextRef.current.createAnalyser();
			analyserRef.current.fftSize = 256;

			sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
			sourceRef.current.connect(analyserRef.current);

			return true;
		} catch (error) {
			console.error('Error accessing microphone :>>', error);
			toast.error('Unable to access microphone. Please check your permissions.');
			return false;
		}
	};

	const startRecording = async () => {
		try {
			const setupSuccess = await setupAudioRecording();
			if (!setupSuccess) {
				return;
			}

			const mediaRecorder = new MediaRecorder(streamRef.current!);
			mediaRecorderRef.current = mediaRecorder;

			mediaRecorder.addEventListener('dataavailable', (event) => {
				audioChunksRef.current.push(event.data);
			});

			mediaRecorder.addEventListener('stop', async () => {
				setIsProcessing(true);
				try {
					const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
					const transcription = await transcribeAudio(audioBlob);
					onTranscriptionComplete(transcription);
					onClose();
				} catch (error) {
					console.error('Error processing audio:', error);
					toast.error('Error processing audio');
				} finally {
					setIsProcessing(false);
				}
			});

			mediaRecorder.start();
			setIsRecording(true);
			startSilenceDetection();
		} catch (error) {
			console.error('Error starting recording:', error);
			toast.error('Error starting recording');
		}
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
			if (silenceDetectionTimeoutRef.current) {
				clearTimeout(silenceDetectionTimeoutRef.current);
			}
		}
	};

	const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
		const formData = new FormData();
		formData.append('audio', audioBlob, 'audio.mp3');

		const response = await fetch('/api/transcribe', {
			method: 'POST',
			body: formData,
		});

		if (!response.ok) {
			throw new Error('Error transcribing audio');
		}

		const { transcription } = await response.json();
		return transcription;
	};

	const startSilenceDetection = () => {
		const silenceDetectionInterval = 50; // 50 milliseconds
		const silenceThreshold = 10; // Maximum amplitude threshold for silence

		silenceDetectionTimeoutRef.current = setTimeout(() => {
			if (isRecording && analyserRef.current) {
				const bufferLength = analyserRef.current.frequencyBinCount;
				const dataArray = new Uint8Array(bufferLength);
				analyserRef.current.getByteFrequencyData(dataArray);
				const maxValue = Math.max(...dataArray);
				if (maxValue < silenceThreshold) {
					// No speech for 700 milliseconds, stop recording
					stopRecording();
				} else {
					lastSpeechTimeRef.current = Date.now();
					startSilenceDetection();
				}
			}
		}, silenceDetectionInterval);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-md'>
				<div className='flex flex-col items-center space-y-4'>
					<h2 className='text-lg font-semibold'>
						{isProcessing ? 'Processing...' : isRecording ? 'Recording...' : 'Start speaking'}
					</h2>
					<div className='h-24 w-full flex items-center justify-center'>
						<div
							className={cn(
								'rounded-full flex m-auto bg-purple-500 transition-all ease-in-out',
								isRecording ? 'w-20 h-20 animate-pulse' : 'w-16 h-16'
							)}
						>
							<MicIcon className='text-white m-auto size-6' />
						</div>
					</div>
					<Button
						onClick={isRecording ? stopRecording : startRecording}
						disabled={isProcessing}
					>
						{isProcessing ? (
							'Processing...'
						) : isRecording ? (
							<>
								<StopCircleIcon className='mr-2 h-4 w-4' />
								Stop Recording
							</>
						) : (
							<>
								<MicIcon className='mr-2 h-4 w-4' />
								Start Recording
							</>
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default AudioRecordingDialog;
