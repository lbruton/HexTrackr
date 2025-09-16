/**
 * WebSocket client for real-time progress tracking in HexTrackr
 * Handles connection management, auto-reconnection, and progress updates
 */

/* eslint-env browser */
/* global io */

"use strict";

/**
 * WebSocket client class for real-time progress tracking
 */
class WebSocketClient {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.heartbeatInterval = null;
        this.eventCallbacks = new Map();

        // Check if debug mode is enabled (can be set via localStorage)
        this.debugMode = localStorage.getItem("hextrackr_debug") === "true";

        this.config = {
            host: window.location.hostname || "localhost",
            port: window.location.port || "8080",
            autoReconnect: true,
            heartbeatInterval: 30000,
            maxReconnectAttempts: 5,
            progressThrottle: 100
        };
        
        this.lastProgressUpdate = {};
        this.progressThrottleTimers = new Map();
    }

    /**
     * Debug logging method - only logs when debug mode is enabled
     */
    debug(...args) {
        if (this.debugMode) {
            console.log("[WebSocket]", ...args);
        }
    }

    /**
     * Connect to WebSocket server
     * @returns {Promise<boolean>} Connection success
     */
    connect() {
        return new Promise((resolve, reject) => {
            try {
                if (typeof io === "undefined") {
                    throw new Error("Socket.io library not loaded");
                }
                
                const url = `http://${this.config.host}:${this.config.port}`;
                this.debug("Connecting to WebSocket server:", url);
                
                this.socket = io(url, {
                    transports: ["polling", "websocket"],
                    upgrade: true,
                    upgradeTimeout: 10000,
                    autoConnect: true,
                    reconnection: false,
                    forceNew: true
                });
                
                this.setupEventListeners();
                
                const timeout = window.setTimeout(() => {
                    if (!this.isConnected) {
                        this.socket.disconnect();
                        reject(new Error("Connection timeout"));
                    }
                }, 10000);
                
                this.socket.on("connect", () => {
                    window.clearTimeout(timeout);
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.reconnectDelay = 1000;
                    this.debug("WebSocket connected successfully");
                    this.startHeartbeat();
                    resolve(true);
                });
                
                this.socket.on("connect_error", (error) => {
                    window.clearTimeout(timeout);
                    console.error("WebSocket connection error:", error);
                    this.handleConnectionError();
                    reject(error);
                });
                
            } catch (error) {
                console.error("WebSocket connection failed:", error);
                reject(error);
            }
        });
    }
    
    handleConnectionError() {
        this.isConnected = false;
        this.stopHeartbeat();
        
        if (this.config.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this.attemptReconnection();
        } else {
            console.error("Max reconnection attempts reached");
            this.triggerCallback("connectionFailed", { attempts: this.reconnectAttempts });
        }
    }
    
    attemptReconnection() {
        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
        this.debug(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        window.setTimeout(() => {
            this.connect();
        }, delay);
    }
    
    startHeartbeat() {
        this.heartbeatInterval = window.setInterval(() => {
            if (this.isConnected && this.socket) {
                this.socket.emit("ping");
            }
        }, 30000);
    }
    
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            window.clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    
    setupEventListeners() {
        if (!this.socket) {
            return;
        }
        
        this.socket.on("disconnect", (reason) => {
            this.debug("WebSocket disconnected:", reason);
            this.isConnected = false;
            this.stopHeartbeat();
            
            if (reason === "io server disconnect") {
                this.handleConnectionError();
            }
            
            this.triggerCallback("disconnect", { reason });
        });
        
        this.socket.on("pong", () => {
            this.debug("Heartbeat pong received");
        });
        
        this.socket.on("progress-update", (data) => {
            this.handleProgressUpdate(data);
        });
        
        this.socket.on("progress-status", (data) => {
            this.debug("Progress status:", data);
            this.triggerCallback("progressStatus", data);
        });
        
        this.socket.on("progress-complete", (data) => {
            this.debug("Progress complete:", data);
            this.triggerCallback("progressComplete", data);
        });
    }
    
    handleProgressUpdate(data) {
        const { sessionId } = data;
        
        const now = Date.now();
        const lastUpdate = this.lastProgressUpdate[sessionId] || 0;
        
        if (now - lastUpdate < this.config.progressThrottle) {
            if (this.progressThrottleTimers.has(sessionId)) {
                window.clearTimeout(this.progressThrottleTimers.get(sessionId));
            }
            
            const timer = window.setTimeout(() => {
                this.lastProgressUpdate[sessionId] = Date.now();
                this.triggerCallback("progress", data);
                this.progressThrottleTimers.delete(sessionId);
            }, this.config.progressThrottle);
            
            this.progressThrottleTimers.set(sessionId, timer);
            return;
        }
        
        this.lastProgressUpdate[sessionId] = now;
        this.triggerCallback("progress", data);
    }
    
    on(event, callback) {
        if (!this.eventCallbacks.has(event)) {
            this.eventCallbacks.set(event, []);
        }
        this.eventCallbacks.get(event).push(callback);
    }
    
    off(event, callback) {
        if (this.eventCallbacks.has(event)) {
            const callbacks = this.eventCallbacks.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    triggerCallback(event, data) {
        if (this.eventCallbacks.has(event)) {
            this.eventCallbacks.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} callback:`, error);
                }
            });
        }
    }
    
    joinProgressRoom(sessionId) {
        if (this.isConnected && this.socket) {
            this.debug("Joining progress room:", sessionId);
            this.socket.emit("join-progress", sessionId);
        }
    }
    
    leaveProgressRoom(sessionId) {
        if (this.isConnected && this.socket) {
            this.debug("Leaving progress room:", sessionId);
            this.socket.emit("leave-progress", sessionId);
        }
    }
    
    disconnect() {
        this.debug("Disconnecting WebSocket client");
        this.config.autoReconnect = false;
        this.stopHeartbeat();
        
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        
        this.isConnected = false;
        this.reconnectAttempts = 0;
        
        this.progressThrottleTimers.forEach(timer => window.clearTimeout(timer));
        this.progressThrottleTimers.clear();
        this.lastProgressUpdate = {};
    }
    
    isSocketConnected() {
        return this.isConnected && this.socket && this.socket.connected;
    }
}

// Make available globally
if (typeof window !== "undefined") {
    window.WebSocketClient = WebSocketClient;
}
