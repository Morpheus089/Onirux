export {};

declare global {
  interface Window {
    electronAPI: {
      checkLogin: (username: string, password: string) => Promise<{ success: boolean }>;
    };
  }
}