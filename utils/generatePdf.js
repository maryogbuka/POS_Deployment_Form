import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateApplicationPDF = async (formData, fileNames) => {
  // Create a temporary div to hold our PDF content
  const pdfContainer = document.createElement('div');
  pdfContainer.style.position = 'absolute';
  pdfContainer.style.left = '-9999px';
  pdfContainer.style.width = '210mm'; // A4 width
  pdfContainer.style.padding = '15mm';
  pdfContainer.style.fontFamily = 'Arial, sans-serif';
  pdfContainer.style.fontSize = '12px';
  pdfContainer.style.color = '#333';
  pdfContainer.style.backgroundColor = 'white';
  
  // Build the PDF content
  pdfContainer.innerHTML = `
   <div style="text-align: center; margin-bottom: 20px;">
  <img 
    src="/payLogo.png" 
    alt="Olive Payment Solutions Logo" 
    style="display: block; margin: 0 auto 10px auto; width: 100px; height: auto;" 
  />
  <h1 style="font-size: 24px; margin-bottom: 5px; color: #0B3D3B;">
    OLIVE PAYMENT SOLUTIONS LIMITED
  </h1>
  <h2 style="font-size: 18px; color: #555;">
    AGENT POS APPLICATION FORM
  </h2>
</div>

    
    <div style="margin-bottom: 15px;">
      <h3 style="font-size: 16px; border-bottom: 2px solid #0B3D3B; padding-bottom: 5px; color: #0B3D3B;">
        SECTION 1: PERSONAL INFORMATION
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="width: 40%; padding: 5px; border: 1px solid #ddd;"><strong>Full Name:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.fullName || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Date of Birth:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.dob || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Gender:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.gender || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>State of Origin:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.stateOfOrigin || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>L.G.A:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.lga || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>ID Number (NIN):</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.idNumber || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>BVN:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.bvn || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Phone Number:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.phone || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Email Address:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.email || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Residential Address:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.address || 'Not provided'}</td></tr>
      </table>
    </div>
    
    <div style="margin-bottom: 15px;">
      <h3 style="font-size: 16px; border-bottom: 2px solid #0B3D3B; padding-bottom: 5px; color: #0B3D3B;">
        SECTION 2: BUSINESS INFORMATION
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="width: 40%; padding: 5px; border: 1px solid #ddd;"><strong>Business Name:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.businessName || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Business Address:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.businessAddress || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Type of Business:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.businessType || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>CAC Reg No:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.cacRegNo || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>CAC Payment Option:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.cacPaymentOption || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Years in Business:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.yearsInBusiness || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Existing POS Agent:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.existingAgent || 'Not provided'}</td></tr>
        ${formData.existingAgent === 'YES' ? `<tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Current Bank/Provider:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.existingAgentBank || 'Not provided'}</td></tr>` : ''}
      </table>
    </div>
    
    <div style="margin-bottom: 15px;">
      <h3 style="font-size: 16px; border-bottom: 2px solid #0B3D3B; padding-bottom: 5px; color: #0B3D3B;">
        SECTION 3: POS REQUIREMENT
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="width: 40%; padding: 5px; border: 1px solid #ddd;"><strong>Account Number:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.accountNumber || 'Not provided'}</td></tr>
        <tr><td style="width: 40%; padding: 5px; border: 1px solid #ddd;"><strong>Account Name:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.accountName || 'Not provided'}</td></tr>
        <tr><td style="width: 40%; padding: 5px; border: 1px solid #ddd;"><strong>Account Type:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.accountType || 'Not provided'}</td></tr>
        <tr><td style="width: 40%; padding: 5px; border: 1px solid #ddd;"><strong>Monthly Turnover:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">₦${formData.monthlyTurnover || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Daily Cash Limit:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">₦${formData.dailyCashLimit || 'Not provided'}</td></tr>
      <tr><td style="width: 40%; padding: 5px; border: 1px solid #ddd;"><strong>POS Terminals Needed:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.posTerminalsNeeded || 'Not provided'}</td></tr>
      <tr><td style="width: 40%; padding: 5px; border: 1px solid #ddd;"><strong>Debit Consent:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.debitConsent || 'Not provided'}</td></tr>
      <tr><td style="width: 40%; padding: 5px; border: 1px solid #ddd;"><strong>POS Features:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.posFeatures || 'Not provided'}</td></tr>
<<<<<<< HEAD
         <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Relationship Manager:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.relationshipManager || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Relationship Manager Branch:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.relationshipManagerBranch || 'Not provided'}</td></tr>
      </table>
      </table>
=======
        </table>
>>>>>>> 06a90e2b9afd1e1215fa17a5c24a6b0dd37e3eb3
    </div>
    
    <div style="margin-bottom: 15px;">
      <h3 style="font-size: 16px; border-bottom: 2px solid #0B3D3B; padding-bottom: 5px; color: #0B3D3B;">
        SECTION 4: POS LOCATION INFORMATION
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
         <tr><td style="width: 40%; padding: 5px; border: 1px solid #ddd;"><strong>Primary Usage Location:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.primaryUsageLocation || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Primary Usage Location Address:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.locationAddress || 'Not provided'}</td></tr>
        <tr><td style="width: 40%; padding: 5px; border: 1px solid #ddd;"><strong>Terminal Location:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.terminalLocation.join(', ') || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Electricity Supply:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.electricitySupply || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Backup Power:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.backupPower || 'Not provided'}</td></tr>
      
        </table>
    </div>
    

    <div style="margin-bottom: 15px;">
      <h3 style="font-size: 16px; border-bottom: 2px solid #0B3D3B; padding-bottom: 5px; color: #0B3D3B;">
        SECTION 5: DECLARATION AND SIGNATURE
      </h3>
      <p style="margin-bottom: 10px;">
        I, ${formData.fullName || 'Not provided'}, hereby declare that the information provided in this application is accurate and complete to the best of my knowledge. I understand that any false information may lead to the rejection of my application or termination of my engagement as a POS agent.
      </p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="width: 40%; padding: 5px; border: 1px solid #ddd;"><strong>Signature:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${fileNames.signature ? 'Attached' : 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Date:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.date || 'Not provided'}</td></tr>
<<<<<<< HEAD
=======
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Relationship Manager:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.relationshipManager || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Relationship Manager Branch:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.relationshipManagerBranch || 'Not provided'}</td></tr>
>>>>>>> 06a90e2b9afd1e1215fa17a5c24a6b0dd37e3eb3
      </table>
    </div>
    
    <div style="margin-bottom: 15px;">
      <h3 style="font-size: 16px; border-bottom: 2px solid #0B3D3B; padding-bottom: 5px; color: #0B3D3B;">
        ATTACHMENTS
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="width: 40%; padding: 5px; border: 1px solid #ddd;"><strong>ID Proof:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${fileNames.idProof || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Address Proof:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${fileNames.addressProof || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Business Registration:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${fileNames.businessRegistration || 'Not provided'}</td></tr>
      </table>
    </div>
    



    <div style="margin-top: 20px; font-size: 10px; color: #777; text-align: center;">
      <p>Application submitted on: ${new Date().toLocaleString()}</p>
      <p>© 2025 Olive Payment Solutions Limited. All rights reserved.</p>
    </div>
  `;

  // Add the container to the document
  document.body.appendChild(pdfContainer);

  try {
    // Generate PDF from the container
    const canvas = await html2canvas(pdfContainer, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;
    
    pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    // Remove the temporary container
    document.body.removeChild(pdfContainer);
    
    // Generate PDF as base64 string
    const pdfOutput = pdf.output('datauristring');
    const base64PDF = pdfOutput.split(',')[1];
    
    return base64PDF;
  } catch (error) {
    console.error('Error generating PDF:', error);
    document.body.removeChild(pdfContainer);
    throw new Error('Failed to generate PDF');
  }
};


// Add this function to your existing utils/generatePdf.js file
export const generateMerchantPDF = async (formData, fileNames) => {
  // Create a temporary div to hold our PDF content
  const pdfContainer = document.createElement('div');
  pdfContainer.style.position = 'absolute';
  pdfContainer.style.left = '-9999px';
  pdfContainer.style.width = '210mm'; // A4 width
  pdfContainer.style.padding = '15mm';
  pdfContainer.style.fontFamily = 'Arial, sans-serif';
  pdfContainer.style.fontSize = '12px';
  pdfContainer.style.color = '#333';
  pdfContainer.style.backgroundColor = 'white';
  
  // Build the PDF content
  pdfContainer.innerHTML = `
  <div style="text-align: center; margin-bottom: 20px;">
  <img 
    src="/payLogo.png" 
    alt="Olive Payment Solutions Logo" 
    style="display: block; margin: 0 auto 10px auto; width: 100px; height: auto;" 
  />
  <h1 style="font-size: 24px; margin-bottom: 5px; color: #0B3D3B;">
    OLIVE PAYMENT SOLUTIONS LIMITED
  </h1>
  <h2 style="font-size: 18px; color: #555;">
    MERCHANT POS APPLICATION FORM
  </h2>
</div>

    
    <div style="margin-bottom: 15px;">
      <h3 style="font-size: 16px; border-bottom: 2px solid #0B3D3B; padding-bottom: 5px; color: #0B3D3B;">
        BUSINESS INFORMATION
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="width: 40%; padding: 5px; border: 1px solid #ddd;"><strong>Business Name:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.businessName || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Business Address:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.businessAddress || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>City/Town:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.city || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>State:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.state || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>L.G.A:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.lga || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Business Phone:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.businessPhone || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Business Email:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.businessEmail || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Business Website:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.businessWebsite || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Business Type:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.businessType || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>CAC Registration Number:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.cacRegNo || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>TIN:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.tin || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Nature of Business:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.natureOfBusiness || 'Not provided'}</td></tr>
<<<<<<< HEAD
        </table>
=======
         <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Existing POS Agent:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.existingAgent || 'Not provided'}</td></tr>
        ${formData.existingAgent === 'YES' ? `<tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Current Bank/Provider:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.existingAgentBank || 'Not provided'}</td></tr>` : ''}
      </table>
>>>>>>> 06a90e2b9afd1e1215fa17a5c24a6b0dd37e3eb3
    </div>
    


    <div style="margin-bottom: 15px;">
      <h3 style="font-size: 16px; border-bottom: 2px solid #0B3D3B; padding-bottom: 5px; color: #0B3D3B;">
        BUSINESS OWNER/REPRESENTATIVE DETAILS
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="width: 40%; padding: 5px; border: 1px solid #ddd;"><strong>Full Name:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.ownerName || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Title/Position:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.ownerTitle || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Phone Number:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.ownerPhone || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>ID Number:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.ownerIdNo || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Email Address:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.ownerEmail || 'Not provided'}</td></tr>
      </table>
    </div>
    
    <div style="margin-bottom: 15px;">
      <h3 style="font-size: 16px; border-bottom: 2px solid #0B3D3B; padding-bottom: 5px; color: #0B3D3B;">
        BANK ACCOUNT INFORMATION
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
<<<<<<< HEAD
        <tr><td style="width: 40%; padding: 5px; border: 1px solid #ddd;"><strong>Account Number:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.accountNumber || 'Not provided'}</td></tr>
=======
        <tr><td style="width: 40%; padding: 5px; border: 1px solid #ddd;"><strong>Bank Name:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.accountNumber || 'Not provided'}</td></tr>
>>>>>>> 06a90e2b9afd1e1215fa17a5c24a6b0dd37e3eb3
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Account Name:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.accountName || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Account Type:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.accountType || 'Not provided'}</td></tr>
      </table>
    </div>
    
    <div style="margin-bottom: 15px;">
      <h3 style="font-size: 16px; border-bottom: 2px solid #0B3D3B; padding-bottom: 5px; color: #0B3D3B;">
        POS REQUIREMENT
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="width: 40%; padding: 5px; border: 1px solid #ddd;"><strong>POS Terminals Needed:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.posTerminalsNeeded || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Monthly Transaction Volume:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">₦${formData.monthlyTransactionVolume || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Average Transaction Size:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">₦${formData.averageTransactionSize || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>POS Features:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.posFeatures.join(', ') || 'Not provided'}</td></tr>
<<<<<<< HEAD
         <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Existing POS Agent:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.existingAgent || 'Not provided'}</td></tr>
        ${formData.existingAgent === 'YES' ? `<tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Current Bank/Provider:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.existingAgentBank || 'Not provided'}</td></tr>` : ''}
=======
>>>>>>> 06a90e2b9afd1e1215fa17a5c24a6b0dd37e3eb3
      <tr><td style="width: 40%; padding: 5px; border: 1px solid #ddd;"><strong>Debit Consent:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.debitConsent || 'Not provided'}</td></tr>
        </table>
    </div>
    
    <div style="margin-bottom: 15px;">
      <h3 style="font-size: 16px; border-bottom: 2px solid #0B3D3B; padding-bottom: 5px; color: #0B3D3B;">
       POS LOCATION INFORMATION
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="width: 40%; padding: 5px; border: 1px solid #ddd;"><strong>Primary Place of Usage:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.primaryUsageLocation || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Location Address:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.locationAddress || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Has Multiple Stores:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.hasMultipleStores || 'Not provided'}</td></tr>
        ${formData.hasMultipleStores === 'YES' ? `<tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Additional Locations:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.additionalLocations || 'Not provided'}</td></tr>` : ''}
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Operating Period:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.operatingPeriod.join(', ') || 'Not provided'}</td></tr>
      </table>
    </div>
    
    <div style="margin-bottom: 15px;">
      <h3 style="font-size: 16px; border-bottom: 2px solid #0B3D3B; padding-bottom: 5px; color: #0B3D3B;">
        REFERENCES
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="width: 40%; padding: 5px; border: 1px solid #ddd;"><strong>Bank Reference Name:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.bankReferenceName || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Bank Reference Phone:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.bankReferencePhone || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Relationship Manager:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.relationshipManager || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Relationship Manager Branch:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.relationshipManagerBranch || 'Not provided'}</td></tr>
      </table>
    </div>
    
    <div style="margin-bottom: 15px;">
      <h3 style="font-size: 16px; border-bottom: 2px solid #0B3D3B; padding-bottom: 5px; color: #0B3D3B;">
        ATTACHMENTS
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="width: 40%; padding: 5px; border: 1px solid #ddd;"><strong>CAC Document:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${fileNames.cacDocument || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>ID Document:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${fileNames.idDocument || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Proof of Address:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${fileNames.proofOfAddress || 'Not provided'}</td></tr>
<<<<<<< HEAD
=======
       <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Relationship Manager:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.relationshipManager || 'Not provided'}</td></tr>
        <tr><td style="padding: 5px; border: 1px solid #ddd;"><strong>Relationship Manager Branch:</strong></td><td style="padding: 5px; border: 1px solid #ddd;">${formData.relationshipManagerBranch || 'Not provided'}</td></tr>
      </table>
>>>>>>> 06a90e2b9afd1e1215fa17a5c24a6b0dd37e3eb3
    </div>
    
    <div style="margin-bottom: 15px;">
      <h3 style="font-size: 16px; border-bottom: 2px solid #0B3D3B; padding-bottom: 5px; color: #0B3D3B;">
        TERMS ACCEPTANCE
      </h3>
      <p style="margin-bottom: 10px;">
        I hereby certify that the information provided is true and accurate, and I authorize OlivePayment
        Solutions Limited to verify the provided details for processing this application. I have read,
        understood, and agree to the Terms and Conditions.
      </p>
    </div>
    
    <div style="margin-top: 20px; font-size: 10px; color: #777; text-align: center;">
      <p>Application submitted on: ${new Date().toLocaleString()}</p>
      <p>© 2025 Olive Payment Solutions Limited. All rights reserved.</p>
    </div>
  `;

  // Add the container to the document
  document.body.appendChild(pdfContainer);

  try {
    // Generate PDF from the container
    const canvas = await html2canvas(pdfContainer, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;
    
    pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    // Remove the temporary container
    document.body.removeChild(pdfContainer);
    
    // Generate PDF as base64 string
    const pdfOutput = pdf.output('datauristring');
    const base64PDF = pdfOutput.split(',')[1];
    
    return base64PDF;
  } catch (error) {
    console.error('Error generating PDF:', error);
    document.body.removeChild(pdfContainer);
    throw new Error('Failed to generate PDF');
  }
};