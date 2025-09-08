/**
 * @fileoverview
 * Jest tests for the ProgressModal component.
 * Focuses on modal lifecycle, UI updates, WebSocket integration, and user interactions.
 */

/* eslint-env jest */
/* global jest, describe, beforeEach, afterEach, test, expect, document, window */

// Mock Bootstrap's Modal class
const mockBootstrapModalInstance = {
    show: jest.fn(),
    hide: jest.fn(),
    dispose: jest.fn(),
};
const mockBootstrapModal = jest.fn(() => mockBootstrapModalInstance);
mockBootstrapModal.getInstance = jest.fn(() => mockBootstrapModalInstance);

// Mock WebSocketClient
const mockWebSocketClientInstance = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    joinProgressRoom: jest.fn(),
    leaveProgressRoom: jest.fn(),
    isSocketConnected: jest.fn(() => true), // Default to connected for most tests
};
const MockWebSocketClient = jest.fn(() => mockWebSocketClientInstance);

// Mock global functions
const mockConfirm = jest.fn(() => true); // Default to confirming actions
const mockRequestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
const mockCancelAnimationFrame = jest.fn(id => clearTimeout(id));

// Store original globals to restore later
const originalBootstrap = global.bootstrap;
const originalWebSocketClient = global.WebSocketClient;
const originalConfirm = global.confirm;
const originalRequestAnimationFrame = global.requestAnimationFrame;
const originalCancelAnimationFrame = global.cancelAnimationFrame;

// Import the ProgressModal class after setting up mocks
let ProgressModal;

describe("ProgressModal", () => {
    let progressModal;
    let modalContainer;

    beforeAll(() => {
        // Set up global mocks before importing ProgressModal
        global.bootstrap = { Modal: mockBootstrapModal };
        global.WebSocketClient = MockWebSocketClient;
        global.confirm = mockConfirm;
        global.requestAnimationFrame = mockRequestAnimationFrame;
        global.cancelAnimationFrame = mockCancelAnimationFrame;

        // Mock console methods to avoid noise in tests
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(console, "warn").mockImplementation(() => {});
        jest.spyOn(console, "error").mockImplementation(() => {});

        // Dynamically import ProgressModal after mocks are set
        const { ProgressModal: ProgressModalClass } = require("../../scripts/shared/progress-modal");
        ProgressModal = ProgressModalClass;
    });

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        jest.useFakeTimers(); // Use fake timers for requestAnimationFrame and setTimeout

        // Create a fresh DOM environment for each test
        document.body.innerHTML = "<div id=\"progressModalContainer\"></div>";
        modalContainer = document.getElementById("progressModalContainer");

        // Ensure isSocketConnected is true by default for WebSocket-enabled tests
        mockWebSocketClientInstance.isSocketConnected.mockReturnValue(true);

        // Initialize ProgressModal
        progressModal = new ProgressModal(mockWebSocketClientInstance);
    });

    afterEach(() => {
        jest.runOnlyPendingTimers(); // Clear any pending timers
        jest.useRealTimers(); // Restore real timers
        if (progressModal) {
            progressModal.destroy(); // Clean up the modal after each test
        }
    });

    afterAll(() => {
        // Restore original globals
        global.bootstrap = originalBootstrap;
        global.WebSocketClient = originalWebSocketClient;
        global.confirm = originalConfirm;
        global.requestAnimationFrame = originalRequestAnimationFrame;
        global.cancelAnimationFrame = originalCancelAnimationFrame;
        
        // Restore console methods
        console.log.mockRestore();
        console.warn.mockRestore();
        console.error.mockRestore();
    });

    describe("Constructor and Initialization", () => {
        test("constructor initializes correctly and creates DOM elements", () => {
            expect(mockBootstrapModal).toHaveBeenCalledWith(expect.any(HTMLElement));
            expect(modalContainer.querySelector("#progressModal")).not.toBeNull();
            expect(modalContainer.querySelector("#progressModalTitle").textContent).toBe("Processing...");
            expect(modalContainer.querySelector("#progressMessage").textContent).toBe("Starting process...");
            expect(mockWebSocketClientInstance.on).toHaveBeenCalledTimes(4);
            expect(mockWebSocketClientInstance.on).toHaveBeenCalledWith("progress", expect.any(Function));
            expect(mockWebSocketClientInstance.on).toHaveBeenCalledWith("progressStatus", expect.any(Function));
            expect(mockWebSocketClientInstance.on).toHaveBeenCalledWith("connectionFailed", expect.any(Function));
            expect(mockWebSocketClientInstance.on).toHaveBeenCalledWith("disconnect", expect.any(Function));
        });

        test("constructor handles missing WebSocketClient gracefully", () => {
            const progressModalWithoutWS = new ProgressModal(null);
            expect(progressModalWithoutWS).toBeDefined();
            expect(progressModalWithoutWS.websocketClient).toBe(null);
        });

        test("creates modal HTML with correct structure", () => {
            const modal = document.getElementById("progressModal");
            expect(modal).toBeTruthy();
            
            // Check essential elements exist
            expect(document.getElementById("progressModalTitle")).toBeTruthy();
            expect(document.getElementById("progressBar")).toBeTruthy();
            expect(document.getElementById("progressPercentage")).toBeTruthy();
            expect(document.getElementById("progressStage")).toBeTruthy();
            expect(document.getElementById("progressMessage")).toBeTruthy();
            expect(document.getElementById("progressCurrent")).toBeTruthy();
            expect(document.getElementById("progressTotal")).toBeTruthy();
            expect(document.getElementById("progressETA")).toBeTruthy();
            expect(document.getElementById("progressError")).toBeTruthy();
            expect(document.getElementById("progressSuccess")).toBeTruthy();
            expect(document.getElementById("progressCancelBtn")).toBeTruthy();
            expect(document.getElementById("progressCloseBtn")).toBeTruthy();
        });
    });

    describe("Modal Lifecycle", () => {
        test("show() displays the modal with correct title and initial message", () => {
            const options = {
                title: "Custom Title",
                sessionId: "test-session-123",
                allowCancel: true,
                initialMessage: "Custom initial message",
                onCancel: jest.fn(),
            };
            progressModal.show(options);

            expect(document.getElementById("progressModalTitle").textContent).toBe("Custom Title");
            expect(document.getElementById("progressMessage").textContent).toBe("Custom initial message");
            expect(document.getElementById("progressCancelBtn").style.display).toBe("inline-block");
            expect(mockWebSocketClientInstance.joinProgressRoom).toHaveBeenCalledWith("test-session-123");
            expect(mockBootstrapModalInstance.show).toHaveBeenCalledTimes(1);
            expect(progressModal.isVisible).toBe(true);
            expect(progressModal.currentSessionId).toBe("test-session-123");
        });

        test("show() with default options", () => {
            progressModal.show();

            expect(document.getElementById("progressModalTitle").textContent).toBe("Processing...");
            expect(document.getElementById("progressMessage").textContent).toBe("Starting process...");
            expect(mockBootstrapModalInstance.show).toHaveBeenCalledTimes(1);
            expect(progressModal.isVisible).toBe(true);
        });

        test("show() disables cancel button when allowCancel is false", () => {
            progressModal.show({ allowCancel: false });
            expect(document.getElementById("progressCancelBtn").style.display).toBe("none");
        });

        test("hide() hides the modal", () => {
            progressModal.show({ sessionId: "test-session" });
            progressModal.hide();
            
            expect(mockBootstrapModalInstance.hide).toHaveBeenCalledTimes(1);
        });

        test("resetProgressState() resets all UI elements to initial state", () => {
            // Set some progress first
            progressModal.update({ progress: 75, message: "Almost done", stage: "Final stage" });
            progressModal.resetProgressState();

            expect(document.getElementById("progressBar").style.width).toBe("0%");
            expect(document.getElementById("progressPercentage").textContent).toBe("0%");
            expect(document.getElementById("progressMessage").textContent).toBe("");
            expect(document.getElementById("progressStage").textContent).toBe("");
            expect(document.getElementById("progressCurrent").textContent).toBe("0");
            expect(document.getElementById("progressTotal").textContent).toBe("0");
            expect(document.getElementById("progressETA").textContent).toBe("--");
        });
    });

    describe("Progress Updates", () => {
        test("handleProgressUpdate() updates UI for matching sessionId and throttles updates", () => {
            const sessionId = "active-session";
            progressModal.show({ sessionId });

            // Simulate a progress update for the active session
            progressModal.handleProgressUpdate({ 
                sessionId, 
                progress: 50, 
                message: "Processing data", 
                stage: "Stage 1", 
                current: 10, 
                total: 20,
                eta: "2 minutes"
            });
            jest.runAllTimers(); // Advance timers to run requestAnimationFrame

            expect(document.getElementById("progressBar").style.width).toBe("50%");
            expect(document.getElementById("progressPercentage").textContent).toBe("50%");
            expect(document.getElementById("progressStage").textContent).toBe("Stage 1");
            expect(document.getElementById("progressMessage").textContent).toBe("Processing data");
            expect(document.getElementById("progressCurrent").textContent).toBe("10");
            expect(document.getElementById("progressTotal").textContent).toBe("20");
            expect(document.getElementById("progressETA").textContent).toBe("2 minutes");

            // Simulate an update for a different session - should be ignored
            progressModal.handleProgressUpdate({ sessionId: "other-session", progress: 75, message: "Other process" });
            jest.runAllTimers();
            expect(document.getElementById("progressBar").style.width).toBe("50%"); // Should remain 50%
        });

        test("update() manually updates progress data and UI", () => {
            progressModal.show({ sessionId: "test-session" });
            
            progressModal.update({
                progress: 25,
                message: "Quarter done",
                stage: "Processing",
                current: 5,
                total: 20
            });

            expect(document.getElementById("progressBar").style.width).toBe("25%");
            expect(document.getElementById("progressMessage").textContent).toBe("Quarter done");
            expect(document.getElementById("progressStage").textContent).toBe("Processing");
        });

        test("updateUI() handles edge case progress values", () => {
            progressModal.show({ sessionId: "test-session" });
            
            // Test negative progress
            progressModal.update({ progress: -10 });
            expect(document.getElementById("progressBar").style.width).toBe("0%");
            
            // Test progress over 100
            progressModal.update({ progress: 150 });
            expect(document.getElementById("progressBar").style.width).toBe("100%");
        });

        test("updateUI() handles missing optional data fields", () => {
            progressModal.show({ sessionId: "test-session" });
            
            // Update with minimal data
            progressModal.update({ progress: 30 });
            
            expect(document.getElementById("progressBar").style.width).toBe("30%");
            expect(document.getElementById("progressPercentage").textContent).toBe("30%");
            // Other fields should remain unchanged or show defaults
            expect(document.getElementById("progressETA").textContent).toBe("--");
        });
    });

    describe("Status Transitions", () => {
        test("showSuccess() updates header, shows success alert, and changes buttons", () => {
            progressModal.show({ sessionId: "test-session" });
            progressModal.showSuccess("Data imported successfully!");

            expect(progressModal.modal.querySelector(".spinner-border").style.display).toBe("none");
            expect(progressModal.modal.querySelector(".modal-header").className).toContain("bg-success");
            expect(document.getElementById("progressSuccess").classList).not.toContain("d-none");
            expect(document.getElementById("progressSuccessMessage").textContent).toBe("Data imported successfully!");
            expect(document.getElementById("progressCancelBtn").classList).toContain("d-none");
            expect(document.getElementById("progressCloseBtn").classList).not.toContain("d-none");
            expect(document.getElementById("progressBar").style.width).toBe("100%");
        });

        test("showError() updates header, shows error alert, and changes buttons", () => {
            progressModal.show({ sessionId: "test-session" });
            progressModal.showError("Import failed due to server error.");

            expect(progressModal.progressData.error).toBe("Import failed due to server error.");
            expect(progressModal.modal.querySelector(".spinner-border").style.display).toBe("none");
            expect(progressModal.modal.querySelector(".modal-header").className).toContain("bg-danger");
            expect(document.getElementById("progressError").classList).not.toContain("d-none");
            expect(document.getElementById("progressErrorMessage").textContent).toBe("Import failed due to server error.");
            expect(document.getElementById("progressCancelBtn").classList).toContain("d-none");
            expect(document.getElementById("progressCloseBtn").classList).not.toContain("d-none");
        });

        test("handleProgressStatus() triggers showSuccess for completed status", () => {
            const sessionId = "test-session";
            progressModal.show({ sessionId });
            
            jest.spyOn(progressModal, "showSuccess");
            
            progressModal.handleProgressStatus({ 
                sessionId, 
                status: "completed", 
                message: "Import completed successfully" 
            });

            expect(progressModal.showSuccess).toHaveBeenCalledWith("Import completed successfully");
        });

        test("handleProgressStatus() triggers showError for error status", () => {
            const sessionId = "test-session";
            progressModal.show({ sessionId });
            
            jest.spyOn(progressModal, "showError");
            
            progressModal.handleProgressStatus({ 
                sessionId, 
                status: "error", 
                message: "Import failed" 
            });

            expect(progressModal.showError).toHaveBeenCalledWith("Import failed");
        });

        test("handleWebSocketError() triggers showError", () => {
            progressModal.show({ sessionId: "test-session" });
            
            jest.spyOn(progressModal, "showError");
            
            progressModal.handleWebSocketError();

            expect(progressModal.showError).toHaveBeenCalledWith("Connection lost. Please check your network and try again.");
        });
    });

    describe("User Interactions", () => {
        test("cancel button triggers confirmation and calls onCancel callback if confirmed", () => {
            const mockOnCancel = jest.fn();
            progressModal.show({ sessionId: "test-session", allowCancel: true, onCancel: mockOnCancel });
            progressModal.update({ progress: 20 }); // Simulate active progress

            // Simulate user clicking cancel and confirming
            mockConfirm.mockReturnValueOnce(true);
            document.getElementById("progressCancelBtn").click();

            expect(mockConfirm).toHaveBeenCalledWith("Are you sure you want to cancel this operation? This action cannot be undone.");
            expect(mockOnCancel).toHaveBeenCalledTimes(1);
            expect(mockBootstrapModalInstance.hide).toHaveBeenCalledTimes(1);
        });

        test("cancel button does not call onCancel if user declines confirmation", () => {
            const mockOnCancel = jest.fn();
            progressModal.show({ sessionId: "test-session", allowCancel: true, onCancel: mockOnCancel });
            progressModal.update({ progress: 20 });

            // Simulate user clicking cancel but declining confirmation
            mockConfirm.mockReturnValueOnce(false);
            document.getElementById("progressCancelBtn").click();

            expect(mockConfirm).toHaveBeenCalled();
            expect(mockOnCancel).not.toHaveBeenCalled();
            expect(mockBootstrapModalInstance.hide).not.toHaveBeenCalled();
        });

        test("close button hides the modal", () => {
            progressModal.show({ sessionId: "test-session" });
            progressModal.showSuccess("Completed");
            
            document.getElementById("progressCloseBtn").click();
            
            expect(mockBootstrapModalInstance.hide).toHaveBeenCalledTimes(1);
        });

        test("modal prevents closing during active progress without confirmation", () => {
            progressModal.show({ sessionId: "test-session", allowCancel: true, onCancel: jest.fn() });
            progressModal.update({ progress: 20 }); // Simulate active progress

            const hideEvent = new Event("hide.bs.modal", { cancelable: true });
            progressModal.modal.dispatchEvent(hideEvent);

            expect(hideEvent.defaultPrevented).toBe(true);
            expect(mockConfirm).toHaveBeenCalledTimes(1);
        });

        test("isActiveProgress() correctly identifies active state", () => {
            progressModal.show({ sessionId: "test-session" });
            
            // Initially not active (progress is 0)
            expect(progressModal.isActiveProgress()).toBe(false);
            
            // Active with partial progress
            progressModal.update({ progress: 50 });
            expect(progressModal.isActiveProgress()).toBe(true);
            
            // Not active when completed
            progressModal.update({ progress: 100 });
            expect(progressModal.isActiveProgress()).toBe(false);
            
            // Not active when error
            progressModal.showError("Test error");
            expect(progressModal.isActiveProgress()).toBe(false);
        });
    });

    describe("Cleanup and Resource Management", () => {
        test("cleanup() properly cleans up resources", () => {
            const sessionId = "test-session";
            progressModal.show({ sessionId, onCancel: jest.fn() });
            
            // Set up some state that should be cleaned
            progressModal.animationFrameId = 123;
            
            progressModal.cleanup();
            
            expect(progressModal.isVisible).toBe(false);
            expect(mockWebSocketClientInstance.leaveProgressRoom).toHaveBeenCalledWith(sessionId);
            expect(progressModal.currentSessionId).toBe(null);
            expect(progressModal.onCancelCallback).toBe(null);
        });

        test("destroy() removes modal from DOM and cleans up all resources", () => {
            const sessionId = "test-session";
            progressModal.show({ sessionId });
            
            expect(document.getElementById("progressModal")).toBeTruthy();
            
            progressModal.destroy();
            
            expect(mockBootstrapModalInstance.dispose).toHaveBeenCalledTimes(1);
            expect(mockWebSocketClientInstance.off).toHaveBeenCalledTimes(4);
            expect(document.getElementById("progressModalContainer")).toBeFalsy();
        });

        test("multiple createModalHTML calls do not create duplicate modals", () => {
            // Call createModalHTML again
            progressModal.createModalHTML();
            
            // Should still only have one modal
            const modals = document.querySelectorAll("#progressModal");
            expect(modals.length).toBe(1);
        });
    });

    describe("WebSocket Integration Edge Cases", () => {
        test("handles progress updates when modal is not visible", () => {
            progressModal.currentSessionId = "test-session";
            progressModal.isVisible = false;
            
            progressModal.handleProgressUpdate({ sessionId: "test-session", progress: 50 });
            
            // Should not update UI when not visible
            expect(document.getElementById("progressBar").style.width).toBe("0%");
        });

        test("handles progress status for unknown session", () => {
            progressModal.show({ sessionId: "active-session" });
            
            jest.spyOn(progressModal, "showSuccess");
            
            // Status for different session should be ignored
            progressModal.handleProgressStatus({ 
                sessionId: "other-session", 
                status: "completed" 
            });
            
            expect(progressModal.showSuccess).not.toHaveBeenCalled();
        });

        test("handles WebSocket events when no WebSocket client is provided", () => {
            const progressModalNoWS = new ProgressModal(null);
            
            // Should not crash when trying to handle events
            expect(() => {
                progressModalNoWS.handleProgressUpdate({ progress: 50 });
                progressModalNoWS.handleProgressStatus({ status: "completed" });
                progressModalNoWS.handleWebSocketError();
            }).not.toThrow();
        });
    });
});