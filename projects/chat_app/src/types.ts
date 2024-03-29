type MessageLog = {
    user: string;
    timestamp: Date;
    message: string;
};

type ChatLog = MessageLog[];

type UdpSocket = { remoteAddress: string; remotePort: number };
