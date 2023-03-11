import { Application } from "express";
declare class DataPuller {
    data: any;
    json: string;
    metrics: string;
    stop(): void;
    start(express?: Application): void;
}
export declare const puller: DataPuller;
export {};
