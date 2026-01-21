import { transformersAI } from '@/services/transformersAI';

/**
 * Test function to verify Qwen2.5-1.5B-Instruct AI integration
 * This can be called from the browser console to test the AI service
 */
export const testAIConnection = async () => {
  console.log('Testing Qwen2.5-1.5B-Instruct AI connection...');
  
  try {
    const response = await transformersAI.chat('Hello, can you introduce yourself?');
    console.log('✅ AI Response:', response);
    return response;
  } catch (error) {
    console.error('❌ AI Test failed:', error);
    return { error: 'Connection failed' };
  }
};

/**
 * Test function to check model loading status
 */
export const checkModelStatus = () => {
  console.log('Qwen Model Status:');
  console.log('- Loaded:', transformersAI.isModelLoaded());
  console.log('- Loading:', transformersAI.isModelLoading());
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testAI = testAIConnection;
  (window as any).checkModelStatus = checkModelStatus;
}