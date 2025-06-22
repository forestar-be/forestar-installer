import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { orderId, installation } = req.body;

    // Mock PDF generation
    // In a real app, you would use @react-pdf/renderer or pdf-lib here
    const pdfData = {
      orderId,
      installation,
      generatedAt: new Date().toISOString(),
      filename: `installation-${orderId}-${Date.now()}.pdf`,
    };

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.status(200).json({
      success: true,
      pdfPath: `/pdfs/${pdfData.filename}`,
      message: 'PDF généré avec succès',
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du PDF',
    });
  }
}
