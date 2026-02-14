import { useState, useCallback, useRef } from 'react';

export const useSpeech = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [confidence, setConfidence] = useState(0);
    const recognitionRef = useRef<any>(null);

    const startListening = useCallback((language = 'en-US') => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error('Speech recognition not supported');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript('');
        };

        recognition.onresult = (event: any) => {
            const current = event.resultIndex;
            const result = event.results[current][0];
            setTranscript(result.transcript);
            setConfidence(result.confidence);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    const speak = useCallback((text: string, language = 'en-US') => {
        if (!('speechSynthesis' in window)) {
            console.error('Text-to-speech not supported');
            return;
        }

        // Stop early if already speaking
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = 1;
        utterance.pitch = 1;

        window.speechSynthesis.speak(utterance);
    }, []);

    return {
        isListening,
        transcript,
        confidence,
        startListening,
        stopListening,
        speak,
    };
};
