'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { generateApplicationPDF } from '@/utils/generatePdf';

export default function AgentForm() {
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    dob: '',
    gender: '',
    stateOfOrigin: '',
    lga: '',
    idType: '',
    idNumber: '',
    bvn: '',
    phone: '',
    email: '',
    address: '',

    // Business Information
    accountNumber: '',
    businessName: '',
    businessAddress: '',
    businessType: '',
    cacRegNo: '',
    cacPaymentOption: '',
    yearsInBusiness: '',
    existingAgent: '',
    existingAgentBank: '',

    // Financial Information
    accountType: '',
    accountName: '',
    accountNumber: '',
    monthlyTurnover: '',
    dailyCashLimit: '',

    // POS Requirements
    posTerminalsNeeded: '', 
    posFeatures: [],
    operatingPeriod: [],
    debitConsent: '',

    // Infrastructure
    primaryUsageLocation: '',
    primaryUsageLocationAddress: '',
    terminalLocation: [],
    electricitySupply: '',
    backupPower: '',

    // Declaration
    date: '',
    relationshipManager: '',
    relationshipManagerBranch: '',

    // Files
    idProof: null,
    addressProof: null,
    businessRegistration: null,
    signature: null,
  });

  const [fileNames, setFileNames] = useState({
    idProof: null,
    addressProof: null,
    businessRegistration: null,
    signature: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox' && (name === 'terminalLocation' || name === 'posFeatures' || name === 'operatingPeriod')) {
      const exists = formData[name].includes(value);
      setFormData((prev) => ({
        ...prev,
        [name]: exists
          ? prev[name].filter((v) => v !== value)
          : [...prev[name], value],
      }));
      return;
    }
    // This Restricts NIN, BVN, Phone to digits only (max 11)
    if (["idNumber", "bvn", "phone"].includes(name)) {
      if (!/^\d*$/.test(value)) return; // only digits
      if (value.length > 11) return;   // max 11
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

    // This formats money fields with commas but keeps raw number
    if (["monthlyTurnover", "dailyCashLimit"].includes(name)) {
      const raw = value.replace(/,/g, "");

      
      if (!/^\d*$/.test(raw)) return;
      const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      setFormData((prev) => ({ ...prev, [name]: formatted }));
      return;
    }

    // This Restricts NIN, BVN, Phone to digits only (max 11)
    if (["idNumber", "bvn", "phone"].includes(name)) {
      if (!/^\d*$/.test(value)) return; // only digits
      if (value.length > 11) return;   // max 11
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

    // This formats money fields with commas but keeps raw number
    if (["monthlyTurnover", "dailyCashLimit"].includes(name)) {
      const raw = value.replace(/,/g, "");

      // This ensures the value is a valid number
      if (!/^\d*$/.test(raw)) return;
      const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      setFormData((prev) => ({ ...prev, [name]: formatted }));
      return;
    }
    // This updates the form data for all other fields
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  // This is where we handle file changes
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0] || null;
    setFormData((prev) => ({ ...prev, [name]: file }));
    setFileNames((prev) => ({ ...prev, [name]: file ? file.name : null }));
  };


// // This is where we handle errors during file conversion

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = String(reader.result);
        const base64 = result.includes(',')
          ? result.split(',')[1]
          : result;
        resolve(base64);
      };

      // This is where we handle errors during file conversion
      reader.onerror = (err) => reject(err);
    });


    // This is where we create the attachment object
  const fileToAttachment = async (file, fallbackName) => {
    if (!file) return null;
    const max = 5 * 1024 * 1024;
    if (file.size > max) {
      throw new Error(`${file.name || fallbackName} is larger than 5MB`);
    }

    // This is where we convert the file to base64
    const content = await toBase64(file);
    return {
      filename: file.name || fallbackName,
      type: file.type || 'application/octet-stream',
      content,
      disposition: 'attachment',
    };
  };

// This is where we handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Generate PDF first
      let pdfBase64 = null;
      
      
      
      // This is where we handle PDF generation
      try {
        pdfBase64 = await generateApplicationPDF(formData, fileNames);
      } catch (pdfError) {
        console.error("PDF generation failed:", pdfError);
        throw new Error("Failed to generate application PDF");
      }



      // This is where we build attachments array from the four file inputs
      const attachments = (await Promise.all([
        fileToAttachment(formData.idProof, 'idProof'),
        fileToAttachment(formData.addressProof, 'addressProof'),
        fileToAttachment(formData.businessRegistration, 'businessRegistration'),
        fileToAttachment(formData.signature, 'signature'),
      ])).filter(Boolean); 



      // This is where we add PDF to attachments
      attachments.push({
        filename: `AgentApplication_${formData.fullName || 'Unknown'}_${new Date().getTime()}.pdf`,
        type: 'application/pdf',
        content: pdfBase64,
        disposition: 'attachment'
      });

      // This is where we only send minimal data in the payload, the PDF contains all form data
      const payload = {
        applicantName: formData.fullName,
        applicantEmail: formData.email,
        applicantPhone: formData.phone,
        submittedAt: new Date().toISOString(),
        monthlyTurnover: formData.monthlyTurnover.replace(/,/g, ""),
        dailyCashLimit: formData.dailyCashLimit.replace(/,/g, ""),
        attachments,
      };


      // This is where we send the form data to the server
      const res = await fetch('/api/agentForms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // This is where we handle the server response
      const result = await res.json();


     
      if (res.ok && result.success) {
        setSubmitMessage('Application submitted successfully!');
        setFormData({
          fullName: '',
          dob: '',
          gender: '',
          stateOfOrigin: '',
          lga: '',
          idType: '',
          idNumber: '',
          bvn: '',
          phone: '',
          email: '',
          address: '',
          businessName: '',
          businessAddress: '',
          businessType: '',
          cacRegNo: '',
          cacPaymentOption: '',
          yearsInBusiness: '',
          existingAgent: '',
          existingAgentBank: '',
          monthlyTurnover: '',
          dailyCashLimit: '',
          terminalLocation: [],
          primaryUsageLocation: '',
          primaryUsageLocationAddress: '',
          locationAddress: '',
          electricitySupply: '',
          backupPower: '',
          accountNumber: '',
          accountType: '',
          accountName: '',
          date: '',
          posTerminalsNeeded: '',
          posFeatures: [],
          operatingPeriod: [],
          existingAgent: '',
          existingAgentBank: '',
          debitConsent: '',
          relationshipManager: '',
          relationshipManagerBranch: '',
          idProof: null,
          addressProof: null,
          businessRegistration: null,
          signature: null,
        });

        // This is where we reset the form and file names
        setFileNames({
          idProof: null,
          addressProof: null,
          businessRegistration: null,
          signature: null,
        });
      } 

      // This is where we handle errors during form submission
      else {
        setSubmitMessage(result?.message || 'Failed to submit application.');
      }
    } 
    
    // This is where we catch any unexpected errors
    catch (err) {
      console.error(err);
      setSubmitMessage(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (

    <main className='bg-gray-100'>
      <div className="max-w-4xl mx-auto  p-6 bg-white shadow-lg rounded-lg">
        <div className="flex text-center mb-8">
         <Link href="/">
          <img 
            src="/payLogo.png" 
            alt="Olive Payment Solutions Logo" 
            className="mb-6 w-24 items-start justify-self-start" 
          />
        </Link>
          <h1 className="text-2xl text-gray-700 font-bold md:ml-22 sm:ml-9 lg:ml-28 text-green">
            OLIVE PAYMENT SOLUTIONS LIMITED
            <p className="text-xl text-gray-700 mt-5 font-semibold">
            AGENT (POS) APPLICATION FORM 
            </p>
          </h1>
        </div>

       {/** This is where we render the form submission message */}
        {submitMessage && (
          <div className={`mb-4 p-4 rounded-md ${submitMessage.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {submitMessage}
          </div>
        )}

        {/** This is where we render the form */}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/** SECTION 1: PERSONAL INFORMATION */}
          <section className="border-b pb-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">
            PERSONAL INFORMATION
            </h3>
            {/** This is where we render the personal information inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/** This is where we render the full name input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter your full name"
                  required
                />
              </div>
             

              {/** This is where we render the date of birth input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md"
                  required
                />
              </div>
           

            {/** This is where we render the gender input */ }
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <div className="flex space-x-4 mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={formData.gender === 'Male'}
                      onChange={handleChange}
                      className="text-gray-700"
                      required
                    />
                    {/** This is where we render the male gender option */}
                    <span className="ml-2 text-gray-700">Male</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={formData.gender === 'Female'}
                      onChange={handleChange}
                      className="text-gray-700"
                    />

                    {/** This is where we render the female gender option */}
                    <span className="ml-2 text-gray-700">Female</span>
                  </label>
                </div>
              </div>

              {/** This is where we render the state of origin input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State of Origin *
                </label>
                <input
                  type="text"
                  name="stateOfOrigin"
                  value={formData.stateOfOrigin}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter your state of origin"
                  required
                />
              </div>


              {/** This is where we render the LGA input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  L.G.A *
                </label>
                <input
                  type="text"
                  name="lga"
                  value={formData.lga}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter your Local Government Area"
                  required
                />
              </div>
              {/** This is where we render the means of identification input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Means of Identification (NIN) *
                </label>
                <input
                  type="number"
                  name="idNumber"
                  value={formData.idNumber}
                  maxLength={11}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter your NIN number"
                  required
                />
              </div>
              {/** This is where we render the BVN input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  BVN *
                </label>
                <input
                  type="number"
                  name="bvn"
                  value={formData.bvn}
                  maxLength={11}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter your Bank Verification Number"
                  required
                />
              </div>

              {/** This is where we render the phone number input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="number"
                  name="phone"
                  value={formData.phone}
                  maxLength={11}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter your phone number"
                  required
                />
              </div>


              {/** This is where we render the email input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter your email address"
                  required
                />
              </div>



              {/** This is where we render the residential address input */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Residential Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter your full residential address"
                  rows="3"
                  required
                />
              </div>
            </div>
          </section>

          {/* SECTION 2: BUSINESS INFORMATION */}
          <section className="border-b pb-6">
            {/** This is where we render the business information section */}
            <h3 className="text-lg font-bold text-gray-700 mb-4">
     BUSINESS INFORMATION
            </h3>


            {/** This is where we render the business information inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">



              {/** This is where we render the business name input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter your business name"
                />
              </div>
              

              {/** This is where we render the business address input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Address
                </label>
                <input
                  type="text"
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter your business address"
                />
              </div>
              

              {/** This is where we render the business type input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type of Business
                </label>
                <input
                  type="text"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="e.g. Retail, Services, etc."
                />
              </div>
              

              {/** This is where we render the CAC registration number input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CAC Reg No *
                </label>
                <input
                  type="text"
                  name="cacRegNo"
                  value={formData.cacRegNo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter CAC registration number"
                />
              </div>



        {/** This is where we render the means of identification input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  If No CAC Registration (Payment Options)
                </label>
                <div className="flex space-x-4 mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="cacPaymentOption"
                      value="Outright Payment"
                      checked={formData.cacPaymentOption === 'Outright Payment'}
                      onChange={handleChange}
                      className="text-green-600"
                    />


                    {/** This is where we render the type of identification payment input */}
                    <span className="ml-2 text-gray-700">Outright Payment</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="cacPaymentOption"
                      value="Installments"
                      checked={formData.cacPaymentOption === 'Installments'}
                      onChange={handleChange}
                      className="text-green-600"
                    />
                    {/** This is where we render the type of identification payment input */}
                    <span className="ml-2 text-gray-700">Installments</span>
                  </label>
                </div>
              </div>

              {/** This is where we render the years in business input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years in Business
                </label>
                <input
                  type="number"
                  name="yearsInBusiness"
                  value={formData.yearsInBusiness}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter number of years"
                  min="0"
                />
              </div>

              {/** This is where we render the existing agent input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Are you currently a POS agent for another bank or provider? *
                </label>
                <div className="flex space-x-4 mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="existingAgent"
                      value="YES"
                      checked={formData.existingAgent === 'YES'}
                      onChange={handleChange}
                      className="text-green-600"
                      required
                    />

                    {/** This is where we render the existing agent input */}
                    <span className="ml-2 text-gray-700">YES</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="existingAgent"
                      value="NO"
                      checked={formData.existingAgent === 'NO'}
                      onChange={handleChange}
                      className="text-green-600"
                    />
                    <span className="ml-2 text-gray-700">NO</span>
                  </label>
                </div>
              </div>


              {/** This is where we render the existing agent input */}
              {formData.existingAgent === 'YES' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Which bank/provider are you currently working with? *
                  </label>
                  <input
                    type="text"
                    name="existingAgentBank"
                    value={formData.existingAgentBank}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                    placeholder="Enter bank or provider name"
                    required={formData.existingAgent === 'YES'}
                  />
                </div>
              )}
            </div>
          </section>


          {/* SECTION 3: POS REQUIREMENT SECTION */}
          <section className="border-b pb-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">
          POS REQUIREMENT
            </h3>

      {/** This is where we render the state of origin input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                 Account Number *
                </label>
                <input
                  type="number"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter your account number"
                  required
                />
              </div>
            <p className="text-sm text-gray-600 mb-4">
              Please provide your financial information to help us assess your application.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">



           {/* Account Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter account name"
                  required
                />
              </div>
              
              {/* Account Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type *
                </label>
                <select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md"
                  required
                >
                  <option value=" text-">Select account type</option>
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                  <option value="Corporate">Corporate</option>
                </select>
              </div>

              {/** This is where we render the financial information inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Turnover (estimated) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    ₦
                  </span>
                  <input
                    type="text"
                    name="monthlyTurnover"
                    value={formData.monthlyTurnover}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-2 border text-black border-gray-300 rounded-md"
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>

              {/** This is where we render the daily cash transaction limit input */}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Cash Transaction Limit *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    ₦
                  </span>
                  <input
                    type="text"
                    name="dailyCashLimit"
                    value={formData.dailyCashLimit}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-2 border text-black border-gray-300 rounded-md"
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>
            </div>

      {/* POS Terminals Needed */}
          
          
            <div>
              <label className="block text-sm font-medium pt-5 text-gray-700 mb-1">
                Number of POS Terminals Needed *
              </label>
              <input
                type="number"
                name="posTerminalsNeeded"
                value={formData.posTerminalsNeeded}
                onChange={handleChange}
                className="w-full pl-4 px-3 py-2 border text-black border-gray-300 rounded-md"
                placeholder="Enter number of terminals"
                min="1"
                required
              />
            </div>
         

        {/** Customer Debit Consent */}
         <div className="mb-4 pt-5">
           <label className="block text-sm font-medium text-gray-700 mb-2">
            Do you authorize us to debit your account with the sum of <strong> ₦21,500</strong> as <strong>POS caution fee</strong>?
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex text-gray-700 items-center">
              <input
                type="radio"
                name="debitConsent"
                value="yes"
                checked={formData.debitConsent === "yes"}
                onChange={handleChange}
                className="mr-2"
                required
              />
              Yes
            </label>
            <label className="flex text-gray-700 items-center">
              <input
                type="radio"
                name="debitConsent"
                value="no"
                checked={formData.debitConsent === "no"}
                onChange={handleChange}
                className="mr-2"
                required
              />
              No
            </label>
          </div>
        </div>

           {/* Preferred POS Features */}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium pt-5 text-gray-700 mb-1">
                <strong>PREFERRED POS FEATURES (SELECT ALL THAT APPLY) *</strong>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {['Contactless Payment', 'Mobile payment (NFC, QR code)', 'Card Payments', 'Transfer Services', 'Bill Payments', 'Airtime Purchase', 'Cash Withdrawal', 'Balance Inquiry', 'Receipt printing', 'Inventory Management'].map((feature) => (
                  <label key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      name="posFeatures"
                      value={feature}
                      checked={formData.posFeatures.includes(feature)}
                      onChange={handleChange}
                      className="text-green-600 rounded"
                    />
                    <span className="ml-2 text-gray-700">{feature}</span>
                  </label>
                ))}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="posFeatures"
                    value="Other"
                    checked={formData.posFeatures.includes('Other')}
                    onChange={handleChange}
                    className="text-green-600 rounded"
                  />
                  <span className="ml-2 text-gray-700">Others (please specify)</span>
                </div>
              </div>
            </div>
      </section>
         

          {/* SECTION 4: LOCATION INFORMATION  */}
          <section className="border-b pb-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">
           POS LOCATION INFORMATION
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Primary Place of Usage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Place of Usage *
                </label>
                <input
                  type="text"
                  name="primaryUsageLocation"
                  value={formData.primaryUsageLocation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter primary usage location"
                  required
                />
              </div>

             {/* Location Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Address *
                </label>
                <input
                  type="text"
                  name="locationAddress"
                  value={formData.locationAddress}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter location address"
                  required
                />
              </div>
              
              {/** This is where we render the location and infrastructure inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location/Area of POS Terminal Usage *
                </label>
                <div className="space-y-2 mt-2">
                  {['Market', 'Shopping Complex', 'Stand-alone Kiosk', 'Other'].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        name="terminalLocation"
                        value={option}
                        checked={formData.terminalLocation.includes(option)}
                        onChange={handleChange}
                        className="text-green-600 rounded"
                      />
                      <span className="ml-2 text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/** This is where we render the electricity supply input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Electricity Supply *
                </label>
                <div className="space-y-2 mt-2">
                  {['Regular', 'Irregular'].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="electricitySupply"
                        value={option}
                        checked={formData.electricitySupply === option}
                        onChange={handleChange}
                        className="text-green-600"
                        required
                      />
                      <span className="ml-2 text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/** This is where we render the backup power source input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Backup Power Source (if any)
                </label>
                <input
                  type="text"
                  name="backupPower"
                  value={formData.backupPower}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="e.g. Generator, Solar, Inverter, etc."
                />
              </div>
            </div>
        <p className="overflow-hidden whitespace-nowrap mt-2">
            <span className="inline-block animate-marquee text-sm text-red-600">
              *** Please note: Following our <strong>Geofencing Policy</strong>, the location provided must be the designated service area. ***
            </span>
        </p>

          </section>

          {/* SECTION 5: DECLARATION AND SIGNATURE */}
          <section className="border-b pb-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">
           DECLARATION AND SIGNATURE
            </h3>
            {/** This is where we render the name declaration inputs */}
            <div className="space-y-4">
              <p className="text-gray-700">
                I, <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-72 px-3 py-2 border text-black border-green rounded-md"
                  placeholder="Enter your full name"
                  required
                />, 
                hereby declare that the information provided in this application is accurate and complete 
                to the best of my knowledge. I understand that any false information may lead to the 
                rejection of my application or termination of my engagement as a POS agent.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">

                {/** This is where we render the signature input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Signature *
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md">
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-bold text-[#0B3D3B] hover:text-green-500">
                          <span>Upload Signature</span>
                          <input
                            type="file"
                            name="signature"
                            onChange={handleFileChange}
                            className="sr-only"
                            accept=".pdf,.jpg,.jpeg,.png"
                            required
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, JPG, PNG up to 5MB
                      </p>
                      {fileNames.signature && (
                        <p className="text-sm text-[#0B3D3B] mt-2">
                          ✓ {fileNames.signature}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                

                {/** This is where we render the date input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border text-gray-800 border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          {/* REQUIRED ATTACHMENTS */}
          <section className="border-b pb-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">
              REQUIRED ATTACHMENTS
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Copy of means of identification (NIN) *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-bold text-[#0B3D3B] hover:text-green-500">
                        <span>Upload file</span>
                        <input
                          type="file"
                          name="idProof"
                          onChange={handleFileChange}
                          className="sr-only"
                          accept=".pdf,.jpg,.jpeg,.png"
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, JPG, PNG up to 5MB
                    </p>
                    {fileNames.idProof && (
                      <p className="text-sm text-[#0B3D3B] mt-2">
                        ✓ {fileNames.idProof}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proof of address (Utility bill) *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-bold text-[#0B3D3B] hover:text-blue-700">
                        <span>Upload file</span>
                        <input
                          type="file"
                          name="addressProof"
                          onChange={handleFileChange}
                          className="sr-only"
                          accept=".pdf,.jpg,.jpeg,.png"
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, JPG, PNG up to 5MB
                    </p>
                    {fileNames.addressProof && (
                      <p className="text-sm text-[#0B3D3B] mt-2">
                        ✓ {fileNames.addressProof}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business registration *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-bold text-[#0B3D3B] hover:text-green-500">
                        <span>Upload file</span>
                        <input
                          type="file"
                          name="businessRegistration"
                          onChange={handleFileChange}
                          className="sr-only"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, JPG, PNG up to 5MB
                    </p>
                    {fileNames.businessRegistration && (
                      <p className="text-sm text-[#0B3D3B] mt-2">
                        ✓ {fileNames.businessRegistration}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* TERMS AND CONDITIONS */}
          <section className="border-b pb-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">
              TERMS AND CONDITIONS FOR POS AGENTS
            </h3>
            
            <div className="bg-gray-100 p-4 rounded-md max-h-96 overflow-y-auto">
              <div className="text-sm text-gray-700 space-y-4">
                <p className="font-semibold">Effective Date: {new Date().toLocaleDateString()}</p>
                
                <p>These Terms and Conditions govern the relationship between Olive Payment Solutions Limited, hereinafter referred to as "the Company," and the individual or entity acting as a POS Agent, hereinafter referred to as "the Agent."</p>
                
                <div>
                  <h4 className="font-semibold mt-4">1. Eligibility and Registration</h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>The Agent must be at least 18 years old and legally capable of entering into binding agreements.</li>
                    <li>The Agent shall provide valid identification, business registration (if applicable), and other documents as required by the Company for Know Your Customer (KYC) compliance.</li>
                    <li>The Company reserves the right to approve or reject any application at its sole discretion.</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mt-4">2. Provision of POS Terminal</h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>The Company shall provide a Point of Sale (POS) terminal to the Agent upon successful registration and compliance with all requirements.</li>
                    <li>The POS terminal remains the property of the Company and must be returned upon termination of this agreement.</li>
                    <li>The Agent shall be responsible for the proper use, maintenance, and security of the POS terminal.</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mt-4">3. Services Offered</h4>
                  <p>The Agent is authorized to perform the following services using the POS terminal:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Cash withdrawal</li>
                    <li>Funds transfer</li>
                    <li>Airtime and data top-up</li>
                    <li>Bill payments</li>
                    <li>Other services as may be introduced by the Company from time to time.</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mt-4">4. Commission and Charges</h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>The Agent shall receive commissions on transactions as communicated by the Company.</li>
                    <li>The Company reserves the right to review and adjust commission rates and transaction fees with prior notice.</li>
                    <li>The Agent shall not charge customers above the regulated transaction fees as mandated by the Central Bank of Nigeria (CBN).</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mt-4">5. Obligations of the Agent</h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Ensure compliance with all applicable laws, regulations, and guidelines including CBN regulations on agent banking.</li>
                    <li>Maintain confidentiality of customer information and transaction data.</li>
                    <li>Prevent fraudulent activities and report any suspicious transactions to the Company immediately.</li>
                    <li>Ensure proper record-keeping of all transactions conducted through the POS terminal.</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mt-4">6. Prohibited Activities</h4>
                  <p>The Agent shall not engage in the following:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Money laundering or terrorist financing</li>
                    <li>Unauthorized collection of customer funds</li>
                    <li>Use of POS terminal for personal transactions</li>
                    <li>Tampering with the POS terminal hardware or software</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mt-4">7. Termination</h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>This agreement may be terminated by either party with 30 days written notice.</li>
                    <li>The Company may terminate this agreement immediately in case of fraud, breach of terms, or regulatory violations.</li>
                    <li>Upon termination, the Agent shall return the POS terminal and settle all outstanding balances.</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mt-4">8. Limitation of Liability</h4>
                  <p>The Company shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use the POS terminal.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mt-4">9. Governing Law</h4>
                  <p>This agreement shall be governed by the laws of the Federal Republic of Nigeria, and any disputes arising shall be settled in the competent courts of Nigeria.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mt-4">10. Amendments</h4>
                  <p>The Company reserves the right to amend these Terms and Conditions at any time, with notice to the Agent via email, SMS, or platform notification.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mt-4">Restricted Usage Location:</h4>
                  <p>The merchant agrees that the POS terminal issued by Olive Payment Solutions Limited shall only be used within the approved geographical zone(s), as determined by Olive Payment Solutions Limited.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Terms Agreement */}
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <label className="flex items-start">
              <input
                type="checkbox"
                required
                className="mt-1 text-[#0B3D3B] rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                I agree that the Point of Sale (POS) terminal remains the sole property of Olive Payment Solutions. 
                I understand that possession and use of the terminal are subject to the terms and conditions 
                stipulated in the service agreement, and the terminal must be returned promptly upon request 
                or upon termination of said agreement. I have read and agree to the Terms and Conditions above. *
              </span>
            </label>
          </div>

          {/* Introducer Name */}
         <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Relationship Manager (if any) *
              </label>
              <select
                name="relationshipManager"
                value={formData.relationshipManager}
                onChange={handleChange}
                className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md"
                required
              >
                <option value="">None</option>
                <option value="Retail">ADEBISI OGUNSOLA</option>
                <option value="Services">Abdulhafiz Usman</option>
                <option value="Hospitality">Anthony Ajana</option>
                <option value="E-commerce">Anthony peace chidubem</option>
                <option value="E-commerce">Ayodele Owolabim</option>
                <option value="E-commerce">Chinedu Nnonah</option>
                <option value="E-commerce">Dominic Isisoma Okiah</option>
                <option value="E-commerce">Emmanuel Oluwaseun Chukwuma</option>
                <option value="E-commerce">Folajimi Odulana</option>
                <option value="E-commerce">George Oghale Eriwona</option>
                <option value="E-commerce">Glory chibroma Chinda</option>
                <option value="E-commerce">Haliru Muhammad Lawal</option>
                <option value="E-commerce">Ibrahim Musa</option>
                <option value="E-commerce">Ifeanyi Kinsley Ogah</option>
                <option value="E-commerce">Ikenna Azoribe</option>
                <option value="E-commerce">Ikwuagwu Oluchi</option>
                <option value="E-commerce">Iria Adeyemi</option>
                <option value="E-commerce">Maclean Wokoh</option>
                <option value="E-commerce">Nkeiruka Onyezewe</option>
                <option value="E-commerce">Ogechi Ukaegbu</option>
                <option value="Other">Onyeka David Chima</option>
                <option value="Other">SAMUEL AJOSE</option>
                <option value="Other">Uche Ugochi</option>
                <option value="Other">Victory Emenike</option>
                <option value="Other">Other</option>

              </select>
            </div>

       {/* Introducer Branch */}
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship Manager Branch (if any) *
              </label>
              <select
                name="relationshipManagerBranch"
                value={formData.relationshipManagerBranch}
                onChange={handleChange}
                className="w-full px-3 py-2 border text-gray-800 border-gray-300 rounded-md"
                required
              >
                <option value="">None</option>
                <option value="Retail">Head Office</option>
                <option value="Services">Abuja</option>
                <option value="Hospitality">Victoria Island</option>
                <option value="E-commerce">Enugu</option>
                <option value="E-commerce">Aba</option>
                <option value="E-commerce">Umuahia</option>
               

              </select>
            </div>




          {/* Submit Button */}
          <div className="mt-8 text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#0B3D3B] text-[#d7d8d4] font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'SUBMITTING...' : 'Submit Application'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center text-xs text-gray-500">
          <p>© 2025 Olive Payment Solutions Limited. All rights reserved.</p>
          <p className="mt-1">POS Agent Application Form</p>
        </div>
      </div>
    </main>
  );
}