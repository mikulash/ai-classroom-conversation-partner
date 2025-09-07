export interface RealtimeConnection {
    pc: RTCPeerConnection;
    dc: RTCDataChannel;
    audioStream: MediaStream;
    close: () => void;
}

export interface RealtimeEvent {
    type: string;
    [key: string]: any;
}
