export type RealtimeConnection = {
    pc: RTCPeerConnection;
    dc: RTCDataChannel;
    audioStream: MediaStream;
    close: () => void;
};

export type RealtimeEvent = {
    type: string;
    [key: string]: any;
};
