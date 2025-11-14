export class GrokService {
  private static instance: GrokService | null = null;
  private apiKey: string;
  private baseUrl = 'https://api.x.ai/v1';

  private constructor() {
    this.apiKey = process.env.GROK_API_KEY || '';
    if (!this.apiKey) {
      console.warn('GROK_API_KEY is not set in environment variables');
    }
  }

  static getInstance(): GrokService {
    if (!GrokService.instance) {
      GrokService.instance = new GrokService();
    }
    return GrokService.instance;
  }

  async generateAnalysis(systemPrompt: string, userMessage: string = ''): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GROK_API_KEY is not configured');
    }

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    if (userMessage) {
      messages.push({
        role: 'user',
        content: userMessage
      });
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'grok-4',
          messages,
          temperature: 0.7,
          max_tokens: 4096
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Grok API error (${response.status}): ${errorText}`);
      }

      const data = await response.json() as {
        choices: Array<{
          message: {
            content: string;
          };
        }>;
      };

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from Grok API');
      }

      return data.choices[0]!.message.content;
    } catch (error) {
      console.error('Error calling Grok API:', error);
      throw error;
    }
  }
}

export const grokService = GrokService.getInstance();

