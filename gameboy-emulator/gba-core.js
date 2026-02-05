/**
 * GBA Core - Emulador mínimo de Game Boy Advance
 * Este es un stub funcional que simula emulación
 * Diseñado para ser reemplazado por un núcleo WASM real (mGBA, VBA-M, etc.)
 */

class GBACoreEmulator {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.rom = null;
        this.running = false;
        this.paused = false;
        this.rafId = null;
        
        // State machine
        this.frameCount = 0;
        this.cpuCycles = 0;
        this.cpuSpeed = 16780000; // ~16.78 MHz
        this.targetFps = 59.73; // GBA real speed
        this.frameDuration = 1000 / this.targetFps;
        
        // Memory (simulado)
        this.vram = new Uint8Array(96 * 1024); // 96 KB VRAM
        this.wram = new Uint8Array(256 * 1024); // 256 KB WRAM
        this.iwram = new Uint8Array(32 * 1024); // 32 KB IWRAM
        this.palette = new Uint16Array(512); // 512 palette entries (256 BG + 256 OBJ)
        
        // Display
        this.screenWidth = 240;
        this.screenHeight = 160;
        this.frameBuffer = new Uint32Array(this.screenWidth * this.screenHeight);
        this.imageData = null;
        
        // Input
        this.input = {
            up: false,
            down: false,
            left: false,
            right: false,
            a: false,
            b: false,
            l: false,
            r: false,
            start: false,
            select: false
        };
        
        // Audio
        this.audioContext = null;
        this.audioBuffer = null;
        this.audioProcessor = null;
        
        console.log('🎮 GBA Core Emulator inicializado');
    }
    
    /**
     * Carga una ROM (.gba ArrayBuffer)
     */
    loadRom(arrayBuffer) {
        if (!arrayBuffer) {
            console.error('❌ ROM inválida');
            return false;
        }
        
        this.rom = new Uint8Array(arrayBuffer);
        console.log(`✅ ROM cargada: ${(this.rom.byteLength / 1024 / 1024).toFixed(2)} MB`);
        
        // Parse ROM header para validación
        const header = this.parseRomHeader();
        console.log('ROM Info:', header);
        
        // Inicializar palette de demostración
        this.initializeDefaultPalette();
        
        return true;
    }
    
    /**
     * Parse básico del header ROM GBA
     */
    parseRomHeader() {
        if (!this.rom || this.rom.length < 0xC0) {
            return { error: 'ROM demasiado pequeña' };
        }
        
        const header = {
            entryPoint: this.readU32(0x00),
            nintendoLogo: Array.from(this.rom.slice(0x04, 0x34)).map(b => b.toString(16)).join(''),
            gameTitle: new TextDecoder('utf-8', { fatal: false }).decode(this.rom.slice(0xA0, 0xAC)).trim(),
            gameCode: new TextDecoder('utf-8', { fatal: false }).decode(this.rom.slice(0xAC, 0xB0)),
            makerCode: new TextDecoder('utf-8', { fatal: false }).decode(this.rom.slice(0xB0, 0xB2)),
            unitCode: this.rom[0xB2],
            deviceType: this.rom[0xB3],
            romVersion: this.rom[0xBC]
        };
        
        return header;
    }
    
    /**
     * Lee un u32 little-endian en offset
     */
    readU32(offset) {
        if (!this.rom || offset + 4 > this.rom.length) return 0;
        const v = new DataView(this.rom.buffer, offset, 4);
        return v.getUint32(0, true);
    }
    
    /**
     * Inicializa palette predeterminada (gradiente de colores)
     */
    initializeDefaultPalette() {
        for (let i = 0; i < 256; i++) {
            // Paleta de degradado HSL -> RGB convertida a 15-bit GBA color
            const h = (i / 256) * 360;
            const s = 100;
            const l = 50;
            const rgb = this.hslToRgb(h, s, l);
            const color15bit = ((rgb.r >> 3) & 0x1F) | (((rgb.g >> 3) & 0x1F) << 5) | (((rgb.b >> 3) & 0x1F) << 10);
            this.palette[i] = color15bit;
        }
    }
    
    /**
     * Convierte HSL a RGB
     */
    hslToRgb(h, s, l) {
        h = h / 360;
        s = s / 100;
        l = l / 100;
        
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
    
    /**
     * Inicia la emulación
     */
    start() {
        if (this.running) return;
        this.running = true;
        this.paused = false;
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        console.log('▶️ Emulación iniciada');
        this.emuLoop();
    }
    
    /**
     * Pausa la emulación
     */
    pause() {
        this.paused = true;
        console.log('⏸ Emulación pausada');
    }
    
    /**
     * Reanuda la emulación
     */
    resume() {
        this.paused = false;
        console.log('▶️ Emulación reanudada');
    }
    
    /**
     * Detiene la emulación
     */
    stop() {
        this.running = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        console.log('⏹ Emulación detenida');
    }
    
    /**
     * Loop principal de emulación
     */
    emuLoop() {
        if (!this.running) return;
        
        const now = performance.now();
        const deltaTime = now - (this.lastFrameTime || now);
        this.lastFrameTime = now;
        
        // Avanzar CPU cycles y procesar un frame si es necesario
        if (deltaTime >= this.frameDuration) {
            if (!this.paused) {
                this.emulateCycle();
            }
            this.render();
            this.frameCount++;
        }
        
        this.rafId = requestAnimationFrame(() => this.emuLoop());
    }
    
    /**
     * Emula un ciclo (frame)
     */
    emulateCycle() {
        // Aquí iría CPU execution, memory access, DMA, interrupts, etc.
        // Por ahora, simular generando contenido visual
        this.generateDemoFrame();
    }
    
    /**
     * Genera un frame de demostración (simulación visual)
     */
    generateDemoFrame() {
        // Patrón: líneas de colores + animación basada en frameCount
        const fb = this.frameBuffer;
        const palette = this.palette;
        
        for (let y = 0; y < this.screenHeight; y++) {
            for (let x = 0; x < this.screenWidth; x++) {
                const idx = y * this.screenWidth + x;
                
                // Generar patrón simple: bandas horizontales con animación
                const animOffset = (this.frameCount * 2) % 256;
                const colorIdx = ((x + y + animOffset) / 2) & 0xFF;
                const color15 = palette[colorIdx];
                
                // Convertir 15-bit color a 32-bit RGBA
                const r = ((color15 & 0x1F) << 3) | ((color15 & 0x1F) >> 2);
                const g = (((color15 >> 5) & 0x1F) << 3) | (((color15 >> 5) & 0x1F) >> 2);
                const b = (((color15 >> 10) & 0x1F) << 3) | (((color15 >> 10) & 0x1F) >> 2);
                
                fb[idx] = (0xFF << 24) | (b << 16) | (g << 8) | r; // ABGR format
            }
        }
    }
    
    /**
     * Renderiza el frameBuffer al canvas
     */
    render() {
        if (!this.imageData) {
            this.imageData = this.ctx.createImageData(this.screenWidth, this.screenHeight);
        }
        
        // Copiar frameBuffer a imageData
        const data = new Uint32Array(this.imageData.data.buffer);
        data.set(this.frameBuffer);
        
        this.ctx.putImageData(this.imageData, 0, 0);
    }
    
    /**
     * Establece estado de entrada
     */
    setInput(button, pressed) {
        if (button in this.input) {
            this.input[button] = pressed;
        }
    }
    
    /**
     * Guarda estado en un objeto
     */
    saveState() {
        return {
            rom: this.rom ? this.rom.slice() : null,
            vram: this.vram.slice(),
            wram: this.wram.slice(),
            iwram: this.iwram.slice(),
            frameCount: this.frameCount,
            cpuCycles: this.cpuCycles,
            timestamp: Date.now()
        };
    }
    
    /**
     * Carga estado desde un objeto
     */
    loadState(state) {
        if (!state) return false;
        if (state.rom) this.rom = new Uint8Array(state.rom);
        this.vram = new Uint8Array(state.vram);
        this.wram = new Uint8Array(state.wram);
        this.iwram = new Uint8Array(state.iwram);
        this.frameCount = state.frameCount;
        this.cpuCycles = state.cpuCycles;
        console.log('📂 Estado cargado');
        return true;
    }
}

// Exportar para uso en emulator.js
if (typeof window !== 'undefined') {
    window.GBACoreEmulator = GBACoreEmulator;
}
