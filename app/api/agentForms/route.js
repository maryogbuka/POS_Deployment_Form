// app/api/agentForms/route.js
import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

export async function POST(request) {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.error("SendGrid API key is missing");
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const formData = await request.json();
    console.log("Form data received:", Object.keys(formData));

    // Import the PDF generation function
    const { generateApplicationPDF } = await import('@/utils/generatePdf');
    
    // Generate PDF
    let pdfBase64 = null;
    try {
      // Create a mock document for the PDF generation (since we're in server-side)
      // In a real implementation, you might need a different approach for server-side PDF generation
      const { JSDOM } = await import('jsdom');
      const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
      global.document = dom.window.document;
      global.HTMLElement = dom.window.HTMLElement;
      
      pdfBase64 = await generateApplicationPDF(formData, {
        idProof: formData.idProof ? "Uploaded" : null,
        addressProof: formData.addressProof ? "Uploaded" : null,
        businessRegistration: formData.businessRegistration ? "Uploaded" : null,
        signature: formData.signature ? "Uploaded" : null,
      });
    } catch (pdfError) {
      console.error("PDF generation failed, sending data as text:", pdfError);
    }

    // Email content
    const emailContent = `
      New Agent Application Received:
      
      PERSONAL INFORMATION:
      Full Name: ${formData.fullName || "Not provided"}
      Date of Birth: ${formData.dob || "Not provided"}
      Gender: ${formData.gender || "Not provided"}
      State of Origin: ${formData.stateOfOrigin || "Not provided"}
      L.G.A: ${formData.lga || "Not provided"}
      ID Type: ${formData.idType || "Not provided"}
      ID Number: ${formData.idNumber || "Not provided"}
      BVN: ${formData.bvn || "极Not provided"}
      Phone: ${formData.phone || "Not provided"}
      Email: ${formData.email || "Not provided"}
      Address: ${formData.address || "Not provided"}
      
      BUSINESS INFORMATION:
      Business Name: ${formData.businessName || "Not provided"}
      Business Address: ${formData.businessAddress || "Not provided"}
      Business Type: ${formData.businessType || "Not provided"}
      CAC Reg No: ${formData.cacRegNo || "Not provided"}
      CAC Payment Option: ${formData.cacPaymentOption || "Not provided"}
      Years in Business: ${formData.years极InBusiness || "Not provided"}
      Existing Agent: ${formData.existingAgent || "Not provided"}
      ${formData.existingAgent === 'YES' ? `Current Bank/Provider: ${formData.existingAgentBank || "Not provided"}` : ''}
      
      FINANCIAL INFORMATION:
      Monthly Turnover: ${formData.monthlyTurnover || "Not provided"}
      Daily Cash Limit: ${formData.dailyCashLimit || "Not provided"}
      
      LOCATION AND INFRASTRUCTURE:
      Terminal Location: ${formData.terminalLocation ? formData.terminalLocation.join(", ") : "Not provided"}
      Electricity Supply: ${formData.electricitySupply || "Not provided"}
      Backup Power: ${formData.backupPower || "Not provided"}
      
      Introducer Name: ${formData.introducerName || "Not provided"}
      
      Application submitted on: ${new Date().toLocaleString()}
    `;

    // Build email object
    const msg = {
      to: [
        "popetimehin@olivepayment.com",
        "it@olivemfb.com",
        "eutuama@olivepayment.com",
        "ofavour@olivepayment.com",
        "oobinna@olivepayment.com",
        "eani@olivepayment.com",
        "vike@olivepayment.com",
        "eutuama@olivepayment.com",
      ],
      from: "olivemfb.ng@gmail.com",
      subject: "New POS Agent Application",
      text: emailContent,
      html: emailContent.replace(/\n/g, "<br>"),
      attachments: [],
    };

    // Add PDF attachment if generated successfully
    if (pdfBase64) {
      msg.attachments.push({
        content: pdfBase64,
        filename: `AgentApplication_${formData.fullName || 'Unknown'}_${new Date().getTime()}.pdf`,
        type: "application/pdf",
        disposition: "attachment",
      });
    }

    // Process file attachments if they exist
    if (formData.attachments && formData.attachments.length > 0) {
      formData.attachments.forEach(attachment => {
        msg.attachments.push({
          content: attachment.content,
          filename: attachment.filename,
          type: attachment.type,
          disposition: "attachment",
        });
      });
    }

    console.log("Attempting to send email with attachments:", msg.attachments.length);

    await sgMail.send(msg);
    console.log("Email sent successfully!");

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully!",
    });
  } catch (error) {
    console.error("SendGrid error details:", error);

    if (error.response) {
      console.error("SendGrid response error:", error.response.body);
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit application. Please try again later.",
      },
      { status: 500 }
    );
  }
}