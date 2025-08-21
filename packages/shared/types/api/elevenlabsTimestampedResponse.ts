interface AlignmentInfo {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
}

export interface ElevenLabsTimestampedResponse {
    audio_base64: string;
    alignment?: AlignmentInfo;
    normalized_alignment?: AlignmentInfo;
}
