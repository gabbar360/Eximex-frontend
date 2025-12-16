// Notification sound utility
export class NotificationSound {
  private static audioContext: AudioContext | null = null;
  private static audioBuffer: AudioBuffer | null = null;

  // Initialize audio context
  private static getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Generate doorbell notification sound programmatically
  private static generateBeepSound(): void {
    try {
      const audioContext = this.getAudioContext();
      
      // Create doorbell sound with two tones (ding-dong)
      this.playDoorbellTone(audioContext, 800, 0, 0.3); // First tone (ding)
      this.playDoorbellTone(audioContext, 600, 0.4, 0.4); // Second tone (dong)
      
    } catch (error) {
      console.warn('Could not play notification sound:', error);
      // Fallback to system beep
      this.fallbackBeep();
    }
  }

  // Play individual doorbell tone
  private static playDoorbellTone(audioContext: AudioContext, frequency: number, startTime: number, duration: number): void {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure sound
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime);
    oscillator.type = 'sine';
    
    // Configure volume envelope for doorbell effect
    const currentTime = audioContext.currentTime + startTime;
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);
    
    // Play sound
    oscillator.start(currentTime);
    oscillator.stop(currentTime + duration);
  }

  // Fallback beep using HTML5 Audio
  private static fallbackBeep(): void {
    try {
      // Create a simple beep using data URL
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Silent fail if audio can't play
      });
    } catch (error) {
      console.warn('Fallback beep failed:', error);
    }
  }

  // Main method to play notification sound
  public static play(): void {
    // Check if user has interacted with page (required for audio)
    if (document.visibilityState === 'visible') {
      this.generateBeepSound();
    }
  }

  // Play with permission check
  public static async playWithPermission(): Promise<void> {
    try {
      // Request notification permission if not granted
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      
      this.play();
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }

  // Check if audio is supported
  public static isSupported(): boolean {
    return !!(window.AudioContext || (window as any).webkitAudioContext);
  }
}

// Browser notification with sound
export const showBrowserNotification = (title: string, message: string, icon?: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body: message,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'eximex-notification',
      requireInteraction: false,
      silent: false // This will use system notification sound
    });

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }
  return null;
};