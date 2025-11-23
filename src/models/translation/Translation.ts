// src/types/translation.ts
export interface TranslationResponse {
    transcribed_text: string;
    translated_text: string;
    source_language: string;
    target_language: string;
    audio_filename: string;
}

export interface LanguageOption {
    code: string;
    name: string;
}

export const TARGET_LANGUAGES: LanguageOption[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
];