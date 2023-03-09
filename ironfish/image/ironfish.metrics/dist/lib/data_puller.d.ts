declare class DataPuller {
    data: any;
    json: string;
    metrics: string;
    stop(): void;
    start(): void;
}
export declare const puller: DataPuller;
export {};
