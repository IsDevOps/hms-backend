import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CreateBookingDto } from 'src/bookings/dto/create-booking.dto';

@ApiTags('AI Test')
@Controller('ai-test')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  // --- SIMULATION ENDPOINT ---
  @Post('simulate-booking')
  @ApiOperation({ summary: 'MOCK: Full Booking Fraud Check (Vision + Text)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        guestName: { type: 'string', example: 'McLovin' },
        guestEmail: { type: 'string', example: 'mclovin@hawaii.gov' },
        checkInDate: { type: 'string', example: '2023-12-25' },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Upload the ID Card Image',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async simulateBooking(
    @Body() body: CreateBookingDto, // We accept the text fields here
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    let finalDecision: string = '';
    this.logger.log(`🕵️ Starting Simulation for Guest: ${body.guestName}`);

    // 1. Vision Analysis (Check the ID)
    const base64Image = file.buffer.toString('base64');
    const idAnalysis = await this.aiService.analyzeID(base64Image);

    this.logger.log(`👁️ Vision Result: ${JSON.stringify(idAnalysis)}`);

    // 2. Context Analysis (Check for Fraud)
    // We combine the form data with the ID data
    const fraudContext = {
      bookingName: body.guestName, // Name typed in form
      idName: idAnalysis.extractedName, // Name read from ID
      idIsValid: idAnalysis.isValid,
      email: body.guestEmail,
      checkIn: body.checkInDate,
    };

    const fraudAnalysis = await this.aiService.checkBookingFraud(fraudContext);

    this.logger.log(`🛡️ Fraud Result: ${JSON.stringify(fraudAnalysis)}`);

    finalDecision =
      fraudAnalysis.fraudScore > 60 ? 'BLOCK BOOKING' : 'APPROVE BOOKING';

    // initiate booking if final descicion is approve
    if (finalDecision === 'APPROVE BOOKING') {
      this.logger.log(`✅ Booking Approved for ${body.guestName}`);
    } else {
      this.logger.log(`❌ Booking Blocked for ${body.guestName}`);
      throw new Error('Booking Blocked due to Fraud Detection');
    }

    return {
      status: 'SIMULATION_COMPLETE',
      step1_vision_analysis: idAnalysis,
      step2_fraud_analysis: fraudAnalysis,
      final_decision: finalDecision,
    };

    // 3. Return the Report (What would happen in the DB)
    // return {
    //   status: 'SIMULATION_COMPLETE',
    //   step1_vision_analysis: idAnalysis,
    //   step2_fraud_analysis: fraudAnalysis,
    //   final_decision:
    //     fraudAnalysis.fraudScore > 60 ? 'BLOCK BOOKING' : 'APPROVE BOOKING',
    // };
  }

  // --- KEEPING THE SIMPLE TESTS ---
  @Post('analyze-id-only')
  @ApiOperation({ summary: 'Test Vision Only' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async testId(@UploadedFile() file: Express.Multer.File) {
    const base64 = file.buffer.toString('base64');
    return this.aiService.analyzeID(base64);
  }

  @Post('chat')
  async chat(@Body() body: { message: string; context?: string }) {
    return this.aiService.chatWithConcierge(body.message, body.context);
  }
}
