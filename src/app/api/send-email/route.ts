import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, clientName, pdfPath } = await request.json();

    // Mock email sending
    // In a real app, you would use a service like SendGrid, Nodemailer, etc.
    console.log(`Sending email to: ${email}`);
    console.log(`Client: ${clientName}`);
    console.log(`PDF: ${pdfPath}`);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({
      success: true,
      message: `Email envoyé avec succès à ${email}`,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de l'envoi de l'email",
      },
      { status: 500 }
    );
  }
}
