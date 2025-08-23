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

    // Email content
    const emailContent = `
      New Merchant Application Received:
      
      BUSINESS INFORMATION:
      Business Name: ${formData.businessName || "Not provided"}
      Trading Name: ${formData.tradingName || "Not provided"}
      Business Address: ${formData.businessAddress || "Not provided"}
      City/Town: ${formData.city || "Not provided"}
      State: ${formData.state || "Not provided"}
      L.G.A: ${formData.lga || "Not provided"}
      Phone Number: ${formData.businessPhone || "Not provided"}
      Email Address: ${formData.businessEmail || "Not provided"}
      Business Website: ${formData.businessWebsite || "Not provided"}
      Business Type: ${formData.businessType || "Not provided"}
      CAC Registration Number: ${formData.cacRegNo || "Not provided"}
      TIN: ${formData.tin || "Not provided"}
      Nature of Business: ${formData.natureOfBusiness || "Not provided"}
      
      BUSINESS OWNER/REPRESENTATIVE DETAILS:
      Name: ${formData.ownerName || "Not provided"}
      Title: ${formData.ownerTitle || "Not provided"}
      Phone Number: ${formData.ownerPhone || "Not provided"}
      ID Number: ${formData.ownerIdNo || "Not provided"}
      Email Address: ${formData.ownerEmail || "Not provided"}
      
      BANK ACCOUNT INFORMATION:
      Bank Name: ${formData.bankName || "Not provided"}
      Account Name: ${formData.accountName || "Not provided"}
      Account Type: ${formData.accountType || "Not provided"}
      
      POS REQUIREMENT:
      No of POS Terminals Needed: ${formData.posTerminalsNeeded || "Not provided"}
      Expected Monthly Transaction Volume: ${formData.monthlyTransactionVolume || "Not provided"}
      Expected Average Transaction Size: ${formData.averageTransactionSize || "Not provided"}
      Preferred POS Features: ${formData.posFeatures ? formData.posFeatures.join(', ') : 'Not provided'}
      
      LOCATION INFORMATION:
      Primary Place of Usage: ${formData.primaryUsageLocation || "Not provided"}
      Address: ${formData.locationAddress || "Not provided"}
      Has Multiple Stores: ${formData.hasMultipleStores || "Not provided"}
      Additional Locations: ${formData.additionalLocations || "Not provided"}
      Operating Period: ${formData.operatingPeriod ? formData.operatingPeriod.join(', ') : 'Not provided'}
      
      REFERENCES:
      Bank Reference Contact Name: ${formData.bankReferenceName || "Not provided"}
      Bank Reference Phone No: ${formData.bankReferencePhone || "Not provided"}
      Trade Reference Contact Name: ${formData.tradeReferenceName || "Not provided"}
      Trade Reference Phone No: ${formData.tradeReferencePhone || "Not provided"}
      
      Application submitted on: ${new Date().toLocaleString()}
    `;

    // Build email object
    const msg = {
      to: [
        "mhycienth58@gmail.com",
        "it@olivemfb.com",
        "ogbuka.maryann@olivemfb.com",
      ],
      from: "mhycienth58@gmail.com",
      subject: "New Merchant POS Application",
      text: emailContent,
      html: emailContent.replace(/\n/g, "<br>"),
    };

    // Process attachments if they exist
    if (formData.attachments && formData.attachments.length > 0) {
      msg.attachments = formData.attachments.map(attachment => ({
        content: attachment.content,
        filename: attachment.filename,
        type: attachment.type,
        disposition: "attachment",
      }));
    }

    console.log("Attempting to send email with attachments:", 
                formData.attachments ? formData.attachments.length : 0);

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