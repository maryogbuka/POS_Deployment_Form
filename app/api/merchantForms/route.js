

import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

export async function POST(request) {


  // This is where we handle POST request to receive merchant form data and send email with details

  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.error("SendGrid API key is missing");
      
      
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }


    // Set SendGrid API key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);


    // Get form data from request
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

//  Build email object
const msg = {
  to: [
    "popetimehin@olivepayment.com",
    "it@olivemfb.com",
    "samuel.francis@olivemfb.com",
    "eutuama@olivepayment.com",
    "ofavour@olivepayment.com",
    "oobinna@olivepayment.com",
    "eani@olivepayment.com",
    "vike@olivepayment.com",
  ],
  from: "olivemfb.ng@gmail.com",
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


    // This is where we log the email sending attempt
    console.log("Attempting to send email with attachments:", 
                formData.attachments ? formData.attachments.length : 0);


                // This is where we send the email
    await sgMail.send(msg);
    console.log("Email sent successfully!");

    // Here is where we return the success response if email sending is successful
    return NextResponse.json({
      success: true,
      message: "Application submitted successfully!",
    });
  } 
  
  // Here is where we catch and log any errors during the process
  catch (error) {
    console.error("SendGrid error details:", error);

    if (error.response) {
      console.error("SendGrid response error:", error.response.body);
    }


    // Here is where we return the error response if email sending fails
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit application. Please try again later.",
      },
      { status: 500 }
    );
  }
}