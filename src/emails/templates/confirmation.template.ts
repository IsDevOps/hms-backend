export type ConfirmationTemplateParams = {
    guestName: string;
    bookingId: string;
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
    checkInLink: string;
};


export const confirmationTemplate = ({
    guestName,
    bookingId,
    roomType,
    checkInDate,
    checkOutDate,
    checkInLink,
}: ConfirmationTemplateParams) => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmed</title>
    <style>
        /* Reset & Base Styles */
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        table { border-spacing: 0; border-collapse: collapse; width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        img { max-width: 100%; height: auto; display: block; }
        a { text-decoration: none; color: #0f172a; }

        /* Typography */
        h1 { font-size: 24px; font-weight: 600; color: #0f172a; margin: 0 0 16px 0; letter-spacing: -0.5px; }
        h2 { font-size: 18px; font-weight: 600; color: #0f172a; margin: 0 0 12px 0; }
        p { font-size: 16px; line-height: 1.6; color: #475569; margin: 0 0 24px 0; }
        .small-text { font-size: 14px; color: #94a3b8; }

        /* Components */
        .container { border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-top: 40px; margin-bottom: 40px; }
        .header { background-color: #ffffff; padding: 32px 40px; border-bottom: 1px solid #e2e8f0; text-align: center; }
        .hero-image { width: 100%; height: 200px; object-fit: cover; background-color: #0f172a; }
        .content { padding: 40px; }
        .details-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 24px; margin-bottom: 32px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .detail-label { color: #64748b; font-size: 14px; }
        .detail-value { color: #0f172a; font-weight: 500; font-size: 14px; }
        
        /* The "Check In" Button */
        .btn-primary { 
            display: inline-block; 
            background-color: #0f172a; /* Deep Navy */
            color: #ffffff; 
            padding: 16px 32px; 
            border-radius: 6px; 
            font-weight: 500; 
            text-align: center;
            width: 100%;
            box-sizing: border-box;
        }
        .btn-primary:hover { background-color: #1e293b; }

        /* Footer */
        .footer { background-color: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>

    <div style="background-color: #f1f5f9; padding: 20px;">
        <table class="container" role="presentation">
            <!-- Header -->
            <tr>
                <td class="header">
                    <!-- Replace with your logo URL -->
                    <img src="https://via.placeholder.com/120x40/0f172a/ffffff?text=GRAND+HOTEL" alt="Lumen Hotel" width="120" style="margin: 0 auto;">
                </td>
            </tr>

            <!-- Hero Image (Optional) -->
            <tr>
    <td align="center" style="padding: 0; margin: 0; font-size: 0; line-height: 0;">
        <img src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=600&amp;h=200&amp;q=80" alt="Luxury Room" width="600" height="200" style="display: block; width: 100%; max-width: 600px; height: auto; object-fit: cover; border: 0;">
    </td>
</tr>

            <!-- Main Content -->
            <tr>
                <td class="content">
                    <h1>Your Reservation is Confirmed</h1>
                    <p>Dear <strong>${guestName}</strong>,</p>
                    <p>We are delighted to confirm your upcoming stay with us. Your room has been secured, and our AI Concierge is already preparing for your arrival.</p>
                    <p>To ensure a seamless arrival, you can complete your digital check-in now and receive your mobile room key immediately.</p>

                    <!-- Booking Details Card -->
                    <div class="details-box">
                        <table width="100%">
                            <tr>
                                <td style="padding-bottom: 8px;">
                                    <span class="detail-label">Confirmation Code</span><br>
                                    <span class="detail-value" style="font-family: monospace; font-size: 16px;">${bookingId}</span>
                                </td>
                                <td style="padding-bottom: 8px; text-align: right;">
                                    <span class="detail-label">Room Type</span><br>
                                    <span class="detail-value">${roomType}</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-top: 8px;">
                                    <span class="detail-label">Check-in</span><br>
                                    <span class="detail-value">${checkInDate}</span>
                                </td>
                                <td style="padding-top: 8px; text-align: right;">
                                    <span class="detail-label">Check-out</span><br>
                                    <span class="detail-value">${checkOutDate}</span>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- Call to Action -->
                    <p style="text-align: center;">
                        <a href="${checkInLink}" class="btn-primary" style="color: #ffffff;">Proceed to Digital Check-in &rarr;</a>
                    </p>
                    
                    <p class="small-text" style="text-align: center; margin-top: 24px;">
                        Clicking this link will generate your unique QR Code access key.
                    </p>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td class="footer">
                    <p class="small-text">
                        Lumen Hotel &bull; 100 Innovation Drive &bull; Tech City<br>
                        <a href="#" style="color: #64748b; text-decoration: underline;">Manage Booking</a> | <a href="#" style="color: #64748b; text-decoration: underline;">Contact Concierge</a>
                    </p>
                    <p class="small-text" style="margin-bottom: 0;">
                        &copy; 2025 Lumen Hospitality Group. All rights reserved.
                    </p>
                </td>
            </tr>
        </table>
    </div>

</body>
</html>`;
};