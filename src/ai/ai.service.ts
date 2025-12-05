import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private visionModel: any;
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not defined in .env');
    }

    this.genAI = new GoogleGenerativeAI(apiKey!);

    // Use "gemini-1.5-flash" for speed in hackathons
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });
  }

  /**
   * 1. ID Verification (Vision)
   * Takes a base64 image string, asks Gemini to validate it.
   */
  async analyzeID(base64Image: string) {
    try {
      // Remove header if present (data:image/jpeg;base64,...)
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

      const prompt = `
        Act as a security officer. Analyze this image of an ID card.
        1. Extract the Name and Date of Birth.
        2. Check for visual signs of forgery (blurry text, mismatched fonts).
        3. Return a STRICT JSON object. Do not use Markdown.
        
        JSON Format:
        {
          "isValid": boolean,
          "extractedName": string,
          "dob": string,
          "fraudScore": number (0-100, where 100 is fake),
          "reason": string
        }
      `;

      const imagePart = {
        inlineData: {
          data: cleanBase64,
          mimeType: 'image/jpeg',
        },
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const text = result.response.text();

      return this.cleanJson(text);
    } catch (error) {
      this.logger.error('AI Vision Failed', error);
      // Fallback for demo: If AI fails, auto-approve to not break the flow
      console.warn('⚠️ AI Failed. Switching to Demo Fallback Mode.');

      return {
        isValid: true,
        extractedName: 'Demo User',
        fraudScore: 0,
        reason: 'AI Service Unavailable',
      };
    }
  }

  /**
   * 2. Fraud Analysis (Text)
   * Analyzes booking patterns.
   */
  async checkBookingFraud(bookingData: any) {
    try {
      const prompt = `
        Analyze this hotel booking for fraud risk.
        Data: ${JSON.stringify(bookingData)}
        
        Rules:
        - Last minute bookings (same day) are slightly suspicious.
        - Mismatched IP countries vs ID countries are HIGH risk.
        - Return STRICT JSON.
        
        JSON Format:
        {
          "fraudScore": number (0-100),
          "riskLevel": "LOW" | "MEDIUM" | "HIGH",
          "reason": string
        }
      `;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      return this.cleanJson(text);
    } catch (error) {
      return { fraudScore: 0, riskLevel: 'LOW', reason: 'AI Checked Skipped' };
    }
  }

  // Helper to remove ```json ... ``` from Gemini response
  private cleanJson(text: string) {
    const cleaned = text.replace(/```json|```/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      this.logger.error('Failed to parse JSON from AI', text);
      return {};
    }
  }

  /**
   * 3. Sentiment Analysis (For Service Requests)
   * Determines if a guest is angry or happy to set priority.
   */
  async analyzeSentiment(text: string) {
    try {
      const prompt = `
        Analyze the sentiment of this hotel guest request: "${text}".
        
        Rules:
        - If the guest is angry, frustrated, or threatening, priority is 'HIGH'.
        - If the guest is polite or neutral, priority is 'NORMAL'.
        - If the guest is complimenting, priority is 'LOW'.
        
        Return STRICT JSON:
        {
          "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
          "priority": "HIGH" | "NORMAL" | "LOW",
          "analysis": "Short explanation of why"
        }
      `;

      const result = await this.model.generateContent(prompt);
      const textResponse = result.response.text();
      return this.cleanJson(textResponse);
    } catch (error) {
      // Fallback
      return { sentiment: 'NEUTRAL', priority: 'NORMAL', analysis: 'AI Busy' };
    }
  }

  /**
   * 4. IoT Data Analysis (For Admin Dashboard)
   * Finds patterns in raw sensor data.
   */
  // async analyzeIoTData(sensorData: any[]) {
  //   try {
  //     const prompt = `
  //       You are a Hotel Facilities AI. Analyze this JSON array of sensor readings from 20 rooms.

  //       Data: ${JSON.stringify(sensorData)}

  //       Task:
  //       1. Identify the room with abnormal water or electricity usage.
  //       2. Explain the physical implications (e.g., "Burst Pipe", "Heater malfunction").

  //       Return STRICT JSON:
  //       {
  //          "anomalyDetected": boolean,
  //          "roomNumber": string,
  //          "severity": "HIGH" | "LOW",
  //          "description": string (Technical explanation),
  //          "recommendedAction": string (e.g., "Turn off main valve")
  //       }
  //     `;

  //     // Use PRO model for complex reasoning
  //     const result = await this.model.generateContent(prompt);
  //     return this.cleanJson(result.response.text());
  //   } catch (error) {
  //     return { anomalyDetected: false };
  //   }
  // }

  // ... inside AiService ...

  async analyzeIoTData(sensorPayload: any) {
    try {
      const prompt = `
        You are a Hotel Facilities AI. Analyze this sensor data for a hotel room.
        
        Metric: ${sensorPayload.metric}
        Data: ${JSON.stringify(sensorPayload.data)}
        
        Task:
        1. Identify the specific hour of the anomaly.
        2. Explain the physical cause based on the metric (e.g., "Burst Pipe" for Water, "Electrical Fire" or "Heater malfunction" for Temperature).
        3. Assess severity.
        
        Return STRICT JSON:
        {
           "anomalyDetected": boolean,
           "time": string,
           "severity": "HIGH" | "MEDIUM",
           "description": string,
           "recommendation": string
        }
      `;

      const result = await this.model.generateContent(prompt);
      return this.cleanJson(result.response.text());
    } catch (error) {
      return { anomalyDetected: false, description: 'Analysis unavailable' };
    }
  }
}
