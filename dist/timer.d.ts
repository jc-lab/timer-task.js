import { TaskId, TimerTask, errorCallback } from "./types";
declare enum TaskState {
    FIRST_DELAY = 0,
    PERIOD = 1
}
interface ITaskContext {
    alive: boolean;
    id: number;
    state: TaskState;
    task: TimerTask;
    delay: number;
    period?: number;
    fixedDelay: boolean;
    timerId: any;
}
declare class Timer {
    onError: errorCallback | null;
    private _tasks;
    cancel(): void;
    private _errorHandler;
    private _nextFixedDelayTask;
    private _startSchedule;
    schedule(task: TimerTask, delay: number, period?: number): TaskId;
    scheduleAtFixedRate(task: TimerTask, delay: number, period?: number): TaskId;
    _stopTask(taskCtx: ITaskContext): void;
    removeTask(taskId: TaskId): void;
}
export default Timer;
