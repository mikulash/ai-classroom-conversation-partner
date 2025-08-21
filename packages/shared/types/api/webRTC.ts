
export interface WebRtcAnswerResponse {
    sdp: string; // raw SDP ‘answer’
}

export interface EphemeralTokenResponse {
    client_secret: {
        value: string;
    };
}

export interface TranscriptionSessionCreateResponse {
    id: string;
    object: string;
    modalities: string[];
    turn_detection: {
        type: string;
        threshold: number;
        prefix_padding_ms: number;
        silence_duration_ms: number;
    };
    input_audio_format: string;
    input_audio_transcription: {
        model: string;
        language: string | null;
        prompt: string;
    };
    client_secret: {
        expires_at: string;
        value : string;
    } | null;
    expires_at?: number;
}

export interface TranscriptionSessionCreateRequest {
    input_audio_format: string;
    language: string | null;
}
