export type TimerTask = () => Promise<void> | void;
export type TaskId = number;

export type errorCallback = (err: any) => void;
