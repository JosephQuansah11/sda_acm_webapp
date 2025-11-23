// src/pages/TranslateAudioPage.tsx
// 'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { TranslationResponse, TARGET_LANGUAGES } from '../../models/translation/Translation';
import { Button, Card, CardBody, CardHeader, Container } from 'react-bootstrap';
import axios from 'axios';

interface StreamResponse {
    status: string;
    progress?: number;
    transcribed_text?: string;
    translated_text?: string;
    result?: {
        transcribed_text: string;
        translated_text: string;
        source_language: string;
        target_language: string;
    };
    error?: string;
}

export default function TranslateAudioPage() {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [targetLang, setTargetLang] = useState('nl');
    const [transcribed, setTranscribed] = useState('');
    const [translated, setTranslated] = useState('');
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioQueueRef = useRef<HTMLAudioElement[]>([]);
    const chunksRef = useRef<Blob[]>([]);

    const handleStreamUpdate = (data: any) => {
        switch (data.status) {
            case 'receiving_audio':
                setCurrentStep('Uploading audio...');
                setProgress(data.progress || 0);
                break;
            case 'transcribing':
                setCurrentStep('Transcribing...');
                setProgress(50);
                break;
            case 'transcribed':
                setCurrentStep('Transcribed');
                setProgress(75);
                setTranscribed(data.transcribed_text);
                break;
            case 'translated':
                setCurrentStep('Translated');
                setProgress(90);
                setTranslated(data.translated_text);
                break;
            case 'completed':
                setCurrentStep('Done!');
                setProgress(100);
                if (data.result) {
                    setTranscribed(data.result.transcribed_text);
                    setTranslated(data.result.translated_text);
                    speakText(data.result.translated_text);
                }
                break;
            case 'error':
                setError(data.error);
                setProgress(0);
                break;
        }
    };

    // Send audio with streaming response
    const sendAudioStream = async (blob: Blob) => {
        if (!blob.size) return;

        const formData = new FormData();
        formData.append('audio_file', blob, 'recording.webm');
        formData.append('target_language', targetLang);
        formData.append('speak', 'false');

        try {
            setIsProcessing(true);
            setError('');
            setProgress(0);
            setCurrentStep('Uploading audio...');

            const response = await fetch('http://localhost:8000/translate/audio', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(err || `HTTP ${response.status}`);
            }

            const reader = response.body!.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const data = JSON.parse(line);
                            handleStreamUpdate(data);
                        } catch (e) {
                            console.error('JSON parse error:', e);
                        }
                    }
                }
            }
        } catch (err: any) {
            console.error('Translation error:', err);
            setError('Translation failed: ' + err.message);
            setProgress(0);
            setCurrentStep('Error');
        } finally {
            setIsProcessing(false);
            setCurrentStep('');
        }
    };

    // Fallback TTS using browser
    const speakText = (text: string) => {
        if ('speechSynthesis' in window && text.trim()) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text.trim());

            // Enhanced language mapping for TTS
            const langMap: { [key: string]: string } = {
                'nl': 'nl-NL',
                'es': 'es-ES',
                'fr': 'fr-FR',
                'de': 'de-DE',
                'it': 'it-IT',
                'pt': 'pt-BR',
                'zh': 'zh-CN',
                'ja': 'ja-JP',
                'ko': 'ko-KR',
                'ru': 'ru-RU',
                'ar': 'ar-SA'
            };

            utterance.lang = langMap[targetLang] || targetLang;
            utterance.rate = 0.9; // Slightly slower for clarity
            utterance.pitch = 1.0;
            utterance.volume = 0.8;

            window.speechSynthesis.speak(utterance);
        }
    };

    // Start recording
    const startRecording = async () => {
        try {
            setError('');
            setTranscribed('');
            setTranslated('');
            setProgress(0);
            setCurrentStep('');
            chunksRef.current = [];

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000, // Optimize for speech recognition
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType,
                audioBitsPerSecond: 128000 // Optimize for speech
            });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                // Send the complete recording when stopped
                if (chunksRef.current.length > 0) {
                    const blob = new Blob(chunksRef.current, { type: mimeType });
                    await sendAudioStream(blob);
                }
                chunksRef.current = [];
                stream.getTracks().forEach(t => t.stop());
            };

            mediaRecorder.start(1000); // Collect data every second
            setIsRecording(true);
            setCurrentStep('Recording started...');

        } catch (err: any) {
            console.error('Recording error:', err);
            setError('Microphone access denied: ' + err.message);
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setCurrentStep('Processing recording...');
        }
    };

    // Manual TTS trigger for translated text
    const handleSpeakTranslation = () => {
        if (translated.trim()) {
            speakText(translated);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current?.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            audioQueueRef.current.forEach(a => a.pause());
            window.speechSynthesis.cancel();
        };
    }, []);

    return (
        <Container className="max-w-4xl mx-auto p-6 space-y-8">
            <CardHeader className="text-3xl font-bold text-center">Real-Time Audio Translator</CardHeader>

            {/* Target Language Selector */}
            <CardBody className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <label className="text-sm font-medium">Target Language:</label>
                <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    disabled={isRecording || isProcessing}
                    className="px-4 py-2 border rounded-lg bg-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {TARGET_LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>
                            {lang.name}
                        </option>
                    ))}
                </select>
            </CardBody>

            {/* Progress Indicator */}
            {(isProcessing || currentStep) && (
                <Card className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-center mb-2">
                        <span className="text-blue-700 font-medium">{currentStep}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="text-center mt-2 text-sm text-blue-600">
                        {progress}% complete
                    </div>
                </Card>
            )}

            {/* Record Button */}
            <Container className="flex justify-center">
                <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing}
                    className={`
                        flex items-center gap-3 px-8 py-4 rounded-full text-white font-semibold text-lg
                        transition-all transform hover:scale-105 disabled:cursor-not-allowed
                        ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}
                        ${isProcessing ? 'opacity-50' : ''}
                    `}
                >
                    {isProcessing ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : isRecording ? (
                        <>
                            <MicOff className="w-6 h-6" />
                            Stop Recording
                        </>
                    ) : (
                        <>
                            <Mic className="w-6 h-6" />
                            Start Speaking
                        </>
                    )}
                </Button>
            </Container>

            {/* Error Message */}
            {error && (
                <Card className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center">
                    {error}
                </Card>
            )}

            {/* Live Text Output */}
            <Container className="grid md:grid-cols-2 gap-6">
                <Card className="space-y-2">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                        <Mic className="w-5 h-5" /> Original (Transcribed)
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg min-h-24 font-mono text-sm break-words">
                        {transcribed || <span className="text-gray-400">Transcribed text will appear here...</span>}
                    </div>
                </Card>

                <Card className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                            <Volume2 className="w-5 h-5" /> Translated (
                            {TARGET_LANGUAGES.find(l => l.code === targetLang)?.name})
                        </h3>
                        {translated && (
                            <Button
                                onClick={handleSpeakTranslation}
                                size="sm"
                                variant="outline-primary"
                                className="flex items-center gap-1"
                            >
                                <Volume2 className="w-4 h-4" />
                                Speak
                            </Button>
                        )}
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg min-h-24 font-mono text-sm break-words">
                        {translated || <span className="text-gray-400">Translation will appear here...</span>}
                    </div>
                </Card>
            </Container>

            {/* Instructions */}
            <p className="text-center text-sm text-gray-600">
                Speak naturally. The audio is processed in real-time with visual progress updates.
                Translation happens in streaming chunks for better performance.
            </p>
        </Container>
    );
}
