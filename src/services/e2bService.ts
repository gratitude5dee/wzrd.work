
import { Session, Browser, Terminal } from '@e2b/sdk';

// Configuration for E2B
const E2B_API_KEY = import.meta.env.VITE_E2B_API_KEY || '';

// Interface for action execution steps
export interface ActionStep {
  type: 'click' | 'type' | 'wait' | 'command' | 'screenshot';
  params?: Record<string, any>;
  completed?: boolean;
}

// Interface for real-time execution status
export interface ExecutionStatus {
  running: boolean;
  currentStep: number;
  totalSteps: number;
  logs: string[];
  screenshot?: string;
}

// Class to manage the E2B session
export class E2BManager {
  private session: Session | null = null;
  private browser: Browser | null = null;
  private terminal: Terminal | null = null;
  private executionStatus: ExecutionStatus = {
    running: false,
    currentStep: 0,
    totalSteps: 0,
    logs: []
  };
  private statusListeners: ((status: ExecutionStatus) => void)[] = [];

  // Initialize the E2B session
  async initialize(): Promise<void> {
    try {
      if (!E2B_API_KEY) {
        throw new Error('E2B API key is not set');
      }

      // Create a new E2B session
      this.session = await Session.create({
        apiKey: E2B_API_KEY,
        template: 'base',
      });

      // Initialize browser and terminal
      this.browser = await this.session.browser.start();
      this.terminal = await this.session.terminal.start();
      
      this.addLog('E2B session initialized successfully');
      this.updateStatus();
    } catch (error) {
      console.error('Failed to initialize E2B session:', error);
      this.addLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Execute an action with specified steps
  async executeAction(steps: ActionStep[]): Promise<void> {
    if (!this.session || !this.browser || !this.terminal) {
      throw new Error('E2B session not initialized');
    }

    this.executionStatus = {
      running: true,
      currentStep: 0,
      totalSteps: steps.length,
      logs: []
    };
    this.updateStatus();

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        this.executionStatus.currentStep = i + 1;
        
        this.addLog(`Executing step ${i + 1}/${steps.length}: ${step.type}`);
        
        // Execute step based on type
        switch (step.type) {
          case 'click':
            if (step.params?.x && step.params?.y) {
              await this.browser.click(step.params.x, step.params.y);
              this.addLog(`Clicked at position x: ${step.params.x}, y: ${step.params.y}`);
            } else if (step.params?.selector) {
              await this.browser.clickElement(step.params.selector);
              this.addLog(`Clicked element: ${step.params.selector}`);
            }
            break;
            
          case 'type':
            if (step.params?.text) {
              await this.browser.type(step.params.text);
              this.addLog(`Typed: ${step.params.text}`);
            }
            break;
            
          case 'wait':
            if (step.params?.ms) {
              await new Promise(resolve => setTimeout(resolve, step.params.ms));
              this.addLog(`Waited for ${step.params.ms}ms`);
            }
            break;
            
          case 'command':
            if (step.params?.command) {
              const result = await this.terminal.exec(step.params.command);
              this.addLog(`Executed command: ${step.params.command}`);
              this.addLog(`Command output: ${result.stdout}`);
              if (result.stderr) this.addLog(`Command error: ${result.stderr}`);
            }
            break;
            
          case 'screenshot':
            const screenshot = await this.browser.screenshot();
            this.executionStatus.screenshot = screenshot;
            this.addLog('Took a screenshot');
            break;
            
          default:
            this.addLog(`Unknown step type: ${step.type}`);
        }
        
        // Update status after each step
        step.completed = true;
        this.updateStatus();
      }
      
      this.addLog('Action execution completed successfully');
    } catch (error) {
      console.error('Failed to execute action:', error);
      this.addLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      this.executionStatus.running = false;
      this.updateStatus();
    }
  }

  // Pause the current execution
  async pauseExecution(): Promise<void> {
    // In a real implementation, this would require more sophisticated logic
    this.addLog('Execution paused');
    this.executionStatus.running = false;
    this.updateStatus();
  }

  // Resume the paused execution
  async resumeExecution(): Promise<void> {
    // In a real implementation, this would require more sophisticated logic
    this.addLog('Execution resumed');
    this.executionStatus.running = true;
    this.updateStatus();
  }

  // Stop the current execution
  async stopExecution(): Promise<void> {
    this.addLog('Execution stopped');
    this.executionStatus.running = false;
    this.updateStatus();
  }

  // Upload a file to the sandboxed environment
  async uploadFile(file: File): Promise<string> {
    if (!this.session) {
      throw new Error('E2B session not initialized');
    }

    try {
      // Convert file to ArrayBuffer
      const buffer = await file.arrayBuffer();
      
      // Upload file to the sandbox
      const filePath = `/tmp/${file.name}`;
      await this.session.filesystem.write(filePath, buffer);
      
      this.addLog(`File ${file.name} uploaded successfully`);
      return filePath;
    } catch (error) {
      console.error('Failed to upload file:', error);
      this.addLog(`Error uploading file: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Download a file from the sandboxed environment
  async downloadFile(filePath: string): Promise<Blob> {
    if (!this.session) {
      throw new Error('E2B session not initialized');
    }

    try {
      // Read file from the sandbox
      const fileContent = await this.session.filesystem.read(filePath);
      const fileName = filePath.split('/').pop() || 'downloaded_file';
      
      // Convert to Blob
      const blob = new Blob([fileContent]);
      
      this.addLog(`File ${fileName} downloaded successfully`);
      return blob;
    } catch (error) {
      console.error('Failed to download file:', error);
      this.addLog(`Error downloading file: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Clean up resources
  async cleanup(): Promise<void> {
    try {
      if (this.browser) {
        await this.browser.close();
      }
      
      if (this.terminal) {
        await this.terminal.close();
      }
      
      if (this.session) {
        await this.session.close();
      }
      
      this.session = null;
      this.browser = null;
      this.terminal = null;
      
      this.addLog('E2B session cleaned up');
      this.updateStatus();
    } catch (error) {
      console.error('Failed to clean up E2B session:', error);
      this.addLog(`Error during cleanup: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Add a log entry
  private addLog(message: string): void {
    this.executionStatus.logs.push(`[${new Date().toISOString()}] ${message}`);
  }

  // Update status and notify listeners
  private updateStatus(): void {
    const status = { ...this.executionStatus };
    this.statusListeners.forEach(listener => listener(status));
  }

  // Subscribe to status updates
  onStatusChange(callback: (status: ExecutionStatus) => void): () => void {
    this.statusListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.statusListeners = this.statusListeners.filter(listener => listener !== callback);
    };
  }
  
  // Get current status
  getStatus(): ExecutionStatus {
    return { ...this.executionStatus };
  }
}

// Create a singleton instance
const e2bManager = new E2BManager();

export default e2bManager;
