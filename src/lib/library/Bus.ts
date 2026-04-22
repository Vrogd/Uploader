type EventCallback<T = unknown> = (payload: T) => void;

class Bus {
    private listeners: Map<string, EventCallback[]> = new Map();
    on<T>(event: string, callback: EventCallback<T>): this {
        if (!this.listeners.has(event)) this.listeners.set(event, []);
        this.listeners.get(event)!.push(callback as EventCallback);
        return this;
    }
    off<T>(event: string, callback: EventCallback<T>): void {
        const cbs = this.listeners.get(event);
        if (!cbs) return;
        this.listeners.set(event, cbs.filter(cb => cb !== callback));
    }
    emit<T>(event: string, payload: T): void {
        (this.listeners.get(event) ?? []).forEach(cb => cb(payload));
    }
}

export const eventBus = new Bus();