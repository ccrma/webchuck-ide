//-----------------------------------------------------------
// title: ChucK Adapter
// desc:  Thin adapter layer unifying WebChucK and WebChuGL
//        runtime APIs. Since the runtime APIs mostly match,
//        only init-time and structural differences are
//        handled here.
//-----------------------------------------------------------

import type { EngineMode } from "@/components/settings";
import type { ChucK as ChuGLChucK } from "webchugl";

/**
 * Unified interface for both WebChucK and WebChuGL runtimes.
 * All IDE components interact with this interface rather than
 * the raw Chuck or CK objects directly.
 */
export interface ChucKAdapter {
    // Code execution
    runCode(code: string): Promise<number>;
    replaceCode(
        code: string
    ): Promise<{ oldShred: number; newShred: number }>;
    removeLastCode(): Promise<number>;
    removeShred(id: number): Promise<number>;
    isShredActive(id: number): Promise<number>;

    // Console output
    set chuckPrint(fn: (msg: string) => void);

    // VM params
    setParamInt(name: string, val: number): Promise<void>;
    getParamInt(name: string): Promise<number>;
    getParamString(name: string): Promise<string>;

    // Globals
    setFloat(name: string, val: number): Promise<void>;
    broadcastEvent(name: string): Promise<void>;

    // Time
    now(): Promise<number>;

    // Files
    createFile(
        dir: string,
        filename: string,
        data: string | Uint8Array
    ): Promise<void>;
    loadFile(url: string): Promise<string>;
    runFile(path: string): Promise<number>;

    // Audio graph
    connect(destination: AudioNode): void;
    disconnect(): void;

    // Properties
    readonly audioContext: AudioContext;

    // Engine info
    readonly engineMode: EngineMode;

    // Raw runtime access
    readonly rawRuntime: any;
}

/**
 * WebChucK adapter — thin pass-through to the Chuck instance.
 */
export class WebChucKAdapter implements ChucKAdapter {
    private chuck: any;
    readonly engineMode: EngineMode = "webchuck";

    constructor(chuck: any) {
        this.chuck = chuck;
    }

    runCode(code: string): Promise<number> {
        return this.chuck.runCode(code);
    }
    replaceCode(
        code: string
    ): Promise<{ oldShred: number; newShred: number }> {
        return this.chuck.replaceCode(code);
    }
    removeLastCode(): Promise<number> {
        return this.chuck.removeLastCode();
    }
    removeShred(id: number): Promise<number> {
        return this.chuck.removeShred(id);
    }
    isShredActive(id: number): Promise<number> {
        return this.chuck.isShredActive(id);
    }

    set chuckPrint(fn: (msg: string) => void) {
        this.chuck.chuckPrint = fn;
    }

    setParamInt(name: string, val: number): Promise<void> {
        return this.chuck.setParamInt(name, val);
    }
    getParamInt(name: string): Promise<number> {
        return this.chuck.getParamInt(name);
    }
    getParamString(name: string): Promise<string> {
        return this.chuck.getParamString(name);
    }

    setFloat(name: string, val: number): Promise<void> {
        return this.chuck.setFloat(name, val);
    }
    broadcastEvent(name: string): Promise<void> {
        return this.chuck.broadcastEvent(name);
    }

    now(): Promise<number> {
        return this.chuck.now();
    }

    createFile(
        dir: string,
        filename: string,
        data: string | Uint8Array
    ): Promise<void> {
        return this.chuck.createFile(dir, filename, data);
    }
    loadFile(url: string): Promise<string> {
        return this.chuck.loadFile(url);
    }
    runFile(path: string): Promise<number> {
        return this.chuck.runFile(path);
    }

    connect(destination: AudioNode): void {
        this.chuck.connect(destination);
    }
    disconnect(): void {
        this.chuck.disconnect();
    }

    get audioContext(): AudioContext {
        return this.chuck.audioContext;
    }

    get rawRuntime(): any {
        return this.chuck;
    }
}

/**
 * WebChuGL adapter — thin pass-through to the ChucK instance
 * returned by ChuGL.init().
 * Structural differences:
 *  - HID/Sensors built-in → skip HID.init() etc.
 *  - Some methods (setParamInt, getParamInt, setFloat, etc.) are
 *    synchronous/deferred; adapter wraps with async for consistency.
 */
export class WebChuGLAdapter implements ChucKAdapter {
    private ck: ChuGLChucK;
    readonly engineMode: EngineMode = "webchugl";

    constructor(ck: ChuGLChucK) {
        this.ck = ck;
    }

    async runCode(code: string): Promise<number> {
        const result = await this.ck.runCode(code);
        return result.shredId;
    }
    replaceCode(
        code: string
    ): Promise<{ oldShred: number; newShred: number }> {
        return this.ck.replaceCode(code);
    }
    removeLastCode(): Promise<number> {
        return this.ck.removeLastCode();
    }
    removeShred(id: number): Promise<number> {
        return this.ck.removeShred(id);
    }
    isShredActive(id: number): Promise<number> {
        return this.ck.isShredActive(id);
    }

    set chuckPrint(fn: (msg: string) => void) {
        this.ck.chuckPrint = fn;
    }

    async setParamInt(name: string, val: number): Promise<void> {
        return this.ck.setParamInt(name, val);
    }
    async getParamInt(name: string): Promise<number> {
        return this.ck.getParamInt(name);
    }
    async getParamString(name: string): Promise<string> {
        return this.ck.getParamString(name);
    }

    async setFloat(name: string, val: number): Promise<void> {
        return this.ck.setFloat(name, val);
    }
    async broadcastEvent(name: string): Promise<void> {
        return this.ck.broadcastEvent(name);
    }

    now(): Promise<number> {
        return this.ck.now();
    }

    async createFile(
        dir: string,
        filename: string,
        data: string | Uint8Array
    ): Promise<void> {
        this.ck.createFile(dir, filename, data);
    }
    loadFile(url: string): Promise<string> {
        return this.ck.loadFile(url);
    }
    async runFile(path: string): Promise<number> {
        const result = await this.ck.runFile(path);
        return result.shredId;
    }

    connect(destination: AudioNode): void {
        this.ck.connect(destination);
    }
    disconnect(): void {
        this.ck.disconnect();
    }

    get audioContext(): AudioContext {
        return this.ck.audioContext!;
    }

    get rawRuntime(): any {
        return this.ck;
    }
}
