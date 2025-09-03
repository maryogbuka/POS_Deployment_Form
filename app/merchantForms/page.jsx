'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { generateMerchantPDF } from '@/utils/generatePdf';

export default function MerchantForm() {
  const [formData, setFormData] = useState({
    // BUSINESS INFORMATION
    businessName: '',
    tradingName: '',
    businessAddress: '',
    city: '',
    state: '',
    lga: '',
    businessPhone: '',
    businessEmail: '',
    businessWebsite: '',
    businessType: '',
    cacRegNo: '',
    tin: '',
    natureOfBusiness: '',
    
    // BUSINESS OWNER/REPRESENTATIVE DETAILS
    ownerName: '',
    ownerTitle: '',
    ownerPhone: '',
    ownerIdNo: '',
    ownerEmail: '',
    
    // BANK ACCOUNT INFORMATION
    bankName: '',
    accountName: '',
    accountNumber: '', // Added missing property
    accountType: '',
    debitConsent: '', // Added missing property
    
    // POS REQUIREMENT
    posTerminalsNeeded: '',
    monthlyTransactionVolume: '',
    averageTransactionSize: '',
    posFeatures: [],
    
    // LOCATION INFORMATION
    primaryUsageLocation: '',
    locationAddress: '',
    hasMultipleStores: '',
    additionalLocations: '',
    operatingPeriod: [],
    
    // REFERENCES
    bankReferenceName: '',
    bankReferencePhone: '',
    
    // Files
    cacDocument: null,
    idDocument: null,
    proofOfAddress: null,
  });

  const [fileNames, setFileNames] = useState({
    cacDocument: null,
    idDocument: null,
    proofOfAddress: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      if (name === 'posFeatures' || name === 'operatingPeriod') {
        const exists = formData[name].includes(value);
        setFormData((prev) => ({
          ...prev,
          [name]: exists
            ? prev[name].filter((v) => v !== value)
            : [...prev[name], value],
        }));
        return;
      }
    }

    // This Restricts NIN, BVN, Phone to digits only (max 11)
    if (["businessPhone", "ownerPhone", "tradeReferencePhone", "bankReferencePhone", "ownerIdNo"].includes(name)) {
      if (!/^\d*$/.test(value)) return; // only digits
      if (value.length > 11) return;   // max 11
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

    // This formats money fields with commas but keeps raw number
    if (["monthlyTransactionVolume", "averageTransactionSize"].includes(name)) {
      const raw = value.replace(/,/g, "");
      if (!/^\d*$/.test(raw)) return; // only digits
      const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      setFormData((prev) => ({ ...prev, [name]: formatted }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0] || null;
    setFormData((prev) => ({ ...prev, [name]: file }));
    setFileNames((prev) => ({ ...prev, [name]: file ? file.name : null }));
  };

  // helpers
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // remove "data:<mime>;base64,"
        const result = String(reader.result);
        const base64 = result.includes(',')
          ? result.split(',')[1]
          : result;
        resolve(base64);
      };
      reader.onerror = (err) => reject(err);
    });

  const fileToAttachment = async (file, fallbackName) => {
    if (!file) return null;
    // optional size limit: 5MB
    const max = 5 * 1024 * 1024;
    if (file.size > max) {
      throw new Error(`${file.name || fallbackName} is larger than 5MB`);
    }
    const content = await toBase64(file);
    return {
      filename: file.name || fallbackName,
      type: file.type || 'application/octet-stream',
      content,
      disposition: 'attachment',
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!acceptedTerms) {
      setSubmitMessage('You must accept the Terms and Conditions to submit the application');
      return;
    }
    
    let website = formData.businessWebsite.trim();
    if (website && !/^https?:\/\//i.test(website)) {
      website = "https://" + website;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Generate PDF first
      let pdfBase64 = null;
      try {
        pdfBase64 = await generateMerchantPDF(formData, fileNames);
      } catch (pdfError) {
        console.error("PDF generation failed:", pdfError);
        throw new Error("Failed to generate application PDF");
      }

      // Build attachments array from the file inputs
      const attachments = (await Promise.all([
        fileToAttachment(formData.cacDocument, 'cacDocument'),
        fileToAttachment(formData.idDocument, 'idDocument'),
        fileToAttachment(formData.proofOfAddress, 'proofOfAddress'),
      ])).filter(Boolean); 

      // Add PDF to attachments
      attachments.push({
        filename: `MerchantApplication_${formData.businessName || 'Unknown'}_${new Date().getTime()}.pdf`,
        type: 'application/pdf',
        content: pdfBase64,
        disposition: 'attachment'
      });

      // Build JSON payload with minimal data since PDF contains all details
      const payload = {
        businessName: formData.businessName,
        businessEmail: formData.businessEmail,
        ownerName: formData.ownerName,
        ownerEmail: formData.ownerEmail,
        submittedAt: new Date().toISOString(),
        monthlyTransactionVolume: formData.monthlyTransactionVolume.replace(/,/g, ""),
        averageTransactionSize: formData.averageTransactionSize.replace(/,/g, ""),
        attachments,
      };

      const res = await fetch('/api/merchantForms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setSubmitMessage('Application submitted successfully!');
        // reset form
        setFormData({
          businessName: '',
          businessAddress: '',
          city: '',
          state: '',
          lga: '',
          businessPhone: '',
          businessEmail: '',
          businessWebsite: '',
          businessType: '',
          cacRegNo: '',
          tin: '',
          natureOfBusiness: '',
          ownerName: '',
          ownerTitle: '',
          ownerPhone: '',
          ownerIdNo: '',
          ownerEmail: '',
          bankName: '',
          accountName: '',
          accountNumber: '',
          accountType: '',
          debitConsent: '',
          relationshipManager: '',
          relationshipManagerBranch: '',
          existingAgent: '',
          existingAgentBank: '',
          posTerminalsNeeded: '',
          monthlyTransactionVolume: '',
          averageTransactionSize: '',
          posFeatures: [],
          primaryUsageLocation: '',
          locationAddress: '',
          hasMultipleStores: '',
          additionalLocations: '',
          operatingPeriod: [],
          bankReferenceName: '',
          bankReferencePhone: '',
          cacDocument: null,
          idDocument: null,
          proofOfAddress: null,
        });
        setFileNames({
          cacDocument: null,
          idDocument: null,
          proofOfAddress: null,
        });
        setAcceptedTerms(false);
      } else {
        setSubmitMessage(result?.message || 'Failed to submit application.');
      }
    } catch (err) {
      console.error(err);
      setSubmitMessage(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className='bg-gray-100'>
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
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
            <p className="text-xl text-gray-700 pt-5 font-semibold">
              MERCHANT (POS) APPLICATION FORM
            </p>
          </h1>
        </div>

        {submitMessage && (
          <div className={`mb-4 p-4 rounded-md ${submitMessage.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {submitMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* BUSINESS INFORMATION SECTION */}
          <section className="border-b pb-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">
              BUSINESS INFORMATION
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Name */}
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
                  placeholder="Enter business name"
                  required
                />
              </div>
            
              
              {/* Business Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Address *
                </label>
                <textarea
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter business address"
                  rows="3"
                  required
                ></textarea>
              </div>
              
              {/* City/Town */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City/Town *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter city/town"
                  required
                />
              </div>
              
              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter state"
                  required
                />
              </div>
              
              {/* L.G.A */}
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
                  placeholder="Enter Local Government Area"
                  required
                />
              </div>
              
              {/* Business Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Phone Number *
                </label>
                <input
                  type="number"
                  name="businessPhone"
                  value={formData.businessPhone}
                  onChange={handleChange}
                  maxLength={11}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter business phone number"
                  required
                />
              </div>
              
              {/* Business Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Email Address *
                </label>
                <input
                  type="email"
                  name="businessEmail"
                  value={formData.businessEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter business email"
                  required
                />
              </div>
              
              {/* Business Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Website
                </label>
                <input
                  type="text"
                  name="businessWebsite"
                  value={formData.businessWebsite}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter website URL"
                />
              </div>
              
              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type *
                </label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select business type</option>
                  <option value="Retail">Retail</option>
                  <option value="Services">Services</option>
                  <option value="Hospitality">Hospitality</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              {/* CAC Registration Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CAC Registration Number
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
              
              {/* TIN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TIN (Tax Identification Number)
                </label>
                <input
                  type="text"
                  name="tin"
                  value={formData.tin}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter TIN"
                />
              </div>
              
              {/* Nature of Business */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nature of Business *
                </label>
                <textarea
                  name="natureOfBusiness"
                  value={formData.natureOfBusiness}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Describe the nature of your business"
                  rows="3"
                  required
                ></textarea>
              </div>
            </div>
          </section>

          {/* BUSINESS OWNER/REPRESENTATIVE DETAILS SECTION */}
          <section className="border-b pb-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">
              BUSINESS OWNER/REPRESENTATIVE DETAILS
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Owner Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              {/* Owner Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title/Position *
                </label>
                <input
                  type="text"
                  name="ownerTitle"
                  value={formData.ownerTitle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter title/position"
                  required
                />
              </div>
             
              {/* Owner Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="number"
                  name="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={handleChange}
                  maxLength={11}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              
              {/* Owner ID Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Number *
                </label>
                <input
                  type="number"
                  name="ownerIdNo"
                  value={formData.ownerIdNo}
                  onChange={handleChange}
                  maxLength={11}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter ID number"
                  required
                />
              </div>
              
              {/* Owner Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            {/* Business Owner Signature */}
            <div>
              <label className="block text-sm font-medium pt-5 text-gray-700 mb-1">
                Business Owner Signature *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-bold text-[#0B3D3B] hover:text-green-500">
                      <span>Upload signature</span>
                      <input
                        type="file"
                        name="proofOfAddress"
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
                  {fileNames.proofOfAddress && (
                    <p className="text-sm text-[#0B3D3B] mt-2">
                      ✓ {fileNames.proofOfAddress}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* BANK ACCOUNT INFORMATION SECTION */}
          <section className="border-b pb-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">
              BANK ACCOUNT INFORMATION
            </h3>
            
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
              
              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number *
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter account number"
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
            </div>
          </section>

          {/* POS REQUIREMENT SECTION */}
          <section className="border-b pb-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">
              POS REQUIREMENT
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* POS Terminals Needed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of POS Terminals Needed *
                </label>
                <input
                  type="number"
                  name="posTerminalsNeeded"
                  value={formData.posTerminalsNeeded}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter number of terminals"
                  min="1"
                  required
                />
              </div>
              
              {/* Monthly Transaction Volume */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Monthly Transaction Volume *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    ₦
                  </span>
                  <input
                    type="text"
                    name="monthlyTransactionVolume"
                    value={formData.monthlyTransactionVolume}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-2 border text-black border-gray-300 rounded-md"
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>
              
              {/* Average Transaction Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Average Transaction Size *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    ₦
                  </span>
                  <input
                    type="text"
                    name="averageTransactionSize"
                    value={formData.averageTransactionSize}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-2 border text-black border-gray-300 rounded-md"
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>
              
              {/* Preferred POS Features */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PREFERRED POS FEATURES (SELECT ALL THAT APPLY)
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

              {/** This is where we render the existing agent input */}
              <div>
                <label className="block text-sm mt-5 font-medium text-gray-700 mb-1">
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
                <div className="md:col-span-2 *:mt-4  ">
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
          </section>

          {/* LOCATION INFORMATION SECTION */}
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
              
              {/* Has Multiple Stores */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Do you have multiple stores/locations? *
                </label>
                <div className="flex space-x-4 mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="hasMultipleStores"
                      value="YES"
                      checked={formData.hasMultipleStores === 'YES'}
                      onChange={handleChange}
                      className="text-green-600"
                      required
                    />
                    <span className="ml-2 text-gray-700">YES</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="hasMultipleStores"
                      value="NO"
                      checked={formData.hasMultipleStores === 'NO'}
                      onChange={handleChange}
                      className="text-green-600"
                    />
                    <span className="ml-2 text-gray-700">NO</span>
                  </label>
                </div>
              </div>
              
              {/* Additional Locations */}
              {formData.hasMultipleStores === 'YES' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Locations
                  </label>
                  <textarea
                    name="additionalLocations"
                    value={formData.additionalLocations}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                    placeholder="List additional locations with addresses"
                    rows="3"
                  ></textarea>
                </div>
              )}
              
              {/* Operating Period */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operating Period (Select all that apply) *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                  {['Weekdays', 'Weekends', '24/7'].map((period) => (
                    <label key={period} className="flex items-center">
                      <input
                        type="checkbox"
                        name="operatingPeriod"
                        value={period}
                        checked={formData.operatingPeriod.includes(period)}
                        onChange={handleChange}
                        className="text-green-600 rounded"
                        required={formData.operatingPeriod.length === 0}
                      />
                      <span className="ml-2 text-gray-700">{period}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
             <p className="overflow-hidden whitespace-nowrap mt-8">
            <span className="inline-block animate-marquee text-sm text-red-600">
              *** Please note: Following our <strong>Geofencing Policy</strong>, the location provided must be the designated service area. ***
            </span>
        </p>
          </section>

          {/* REFERENCES SECTION */}
          <section className="border-b pb-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">
              REFERENCES
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bank Reference Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Reference Contact Name *
                </label>
                <input
                  type="text"
                  name="bankReferenceName"
                  value={formData.bankReferenceName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter bank reference name"
                  required
                />
              </div>
              
              {/* Bank Reference Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Reference Phone Number *
                </label>
                <input
                  type="number"
                  name="bankReferencePhone"
                  value={formData.bankReferencePhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                  placeholder="Enter bank reference phone"
                  required
                />
              </div>
            </div>
          </section>

          {/* REQUIRED ATTACHMENTS SECTION */}
          <section className="border-b pb-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">
              REQUIRED ATTACHMENTS
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CAC Document */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CAC Registration Document *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-bold text-[#0B3D3B] hover:text-green-500">
                        <span>Upload file</span>
                        <input
                          type="file"
                          name="cacDocument"
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
                    {fileNames.cacDocument && (
                      <p className="text-sm text-[#0B3D3B] mt-2">
                        ✓ {fileNames.cacDocument}
                      </p>
                    )}
                </div>
              </div>
            </div>
            
            {/* ID Document */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid ID Document *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-bold text-[#0B3D3B] hover:text-green-500">
                      <span>Upload file</span>
                      <input
                        type="file"
                        name="idDocument"
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
                  {fileNames.idDocument && (
                    <p className="text-sm text-[#0B3D3B] mt-2">
                      ✓ {fileNames.idDocument}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Proof of Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proof of Address (Utility Bill) *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-bold text-[#0B3D3B] hover:text-green-500">
                      <span>Upload file</span>
                      <input
                        type="file"
                        name="proofOfAddress"
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
                  {fileNames.proofOfAddress && (
                    <p className="text-sm text-[#0B3D3B] mt-2">
                      ✓ {fileNames.proofOfAddress}
                    </p>
                  )}
                </div>
              </div>
            </div>            
          </div>
        </section>

        {/* TERMS AND CONDITIONS SECTION */}
        <section className="border-b pb-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4">
            TERMS AND CONDITIONS
          </h3>
          
          <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto mb-4">
             <p className="font-semibold text-gray-700">Effective Date: {new Date().toLocaleDateString()}</p>

            <h4 className="font-bold text-gray-700 mt-2 mb-2">AGREEMENT AND ACKNOWLEDGMENT</h4>
            <p className="text-sm text-gray-600 mb-4">
              By using OlivePay's POS system, you, the Merchant, agree to comply with these Terms and
              Conditions. Please read carefully, as these terms form a binding legal agreement between you
              and OlivePay.
            </p>

            <h4 className="font-bold text-gray-700 mb-2">DEFINITIONS</h4>
            <ul className="text-sm text-gray-600 mb-4 list-disc pl-5">
              <li><strong>Merchant:</strong> Any individual or entity that registers to use OlivePay's POS system for the sale of goods or services.</li>
              <li><strong>Platform:</strong> The Point of Sale (POS) platform operated by OlivePay for conducting transactions.</li>
              <li><strong>Customer:</strong> Any individual purchasing goods or services from the Merchant using the Platform.</li>
              <li><strong>OlivePay:</strong> Refers to Olive Payment Solution Limited.</li>
            </ul>

            <h4 className="font-bold text-gray-700 mb-2">USE OF POS SYSTEM</h4>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Transaction Processing:</strong> The Platform may be used solely for lawful transactions, in compliance with all applicable regulations.
            </p>

            <h4 className="font-bold text-gray-700 mb-2">REGISTRATION AND ACCOUNT MANAGEMENT</h4>
            <ul className="text-sm text-gray-600 mb-4 list-disc pl-5">
              <li><strong>Eligibility:</strong> Merchants must be at least 18 years of age and possess the legal authority to operate a business.</li>
              <li><strong>Account Creation:</strong> Merchants must provide accurate and complete information during the account setup process.</li>
              <li><strong>Account Responsibility:</strong> Merchants are responsible for maintaining the security of their account credentials and are liable for all activities under their account.</li>
              <li><strong>Account Updates:</strong> Merchants agree to keep their account information updated, including contact information, business location, and banking information for pay-outs.</li>
              <li><strong>Product Listing:</strong> Merchants agree to provide accurate product descriptions, pricing, and other details. Misrepresentation of products is prohibited.</li>
              <li><strong>Payments:</strong> All transactions processed through the Platform are subject to OlivePay's processing fees, which may vary based on payment type.</li>
              <li><strong>Refunds and Cancellations:</strong> Merchants must comply with OlivePay's refund policies and make customers aware of any return or refund terms applicable to their purchase.</li>
            </ul>

            <h4 className="font-bold text-gray-700 mb-2">FEES AND PAYMENTS</h4>
            <ul className="text-sm text-gray-600 mb-4 list-disc pl-5">
              <li><strong>Service Fees:</strong> Merchants agree to pay any applicable fees for use of the Platform, which will be deducted from transaction proceeds.</li>
              <li><strong>Disbursement:</strong> Payments will be disbursed to the Merchant's registered bank account within a specified period, subject to processing times.</li>
              <li><strong>Chargebacks:</strong> Merchants are responsible for handling any chargebacks, disputes, or fraud claims arising from transactions on the Platform.</li>
            </ul>

            <h4 className="font-bold text-gray-700 mb-2">DATA PRIVACY AND SECURITY</h4>
            <ul className="text-sm text-gray-600 mb-4 list-disc pl-5">
              <li><strong>Data Collection:</strong> OlivePay may collect certain data from Merchants and Customers to facilitate transactions, subject to the OlivePay Privacy Policy.</li>
              <li><strong>Data Security:</strong> Merchants are required to safeguard Customer data and must not engage in unauthorized data sharing or misuse.</li>
              <li><strong>Compliance:</strong> Merchants must comply with applicable data protection laws.</li>
            </ul>

            <h4 className="font-bold text-gray-700 mb-2">PROHIBITED ACTIVITIES</h4>
            <ul className="text-sm text-gray-600 mb-4 list-disc pl-5">
              <li><strong>Restricted Products:</strong> Merchants may not sell items prohibited by law or that violate OlivePay policies.</li>
              <li><strong>Fraud and Misconduct:</strong> Fraudulent activity, misrepresentation, or abuse of the Platform is prohibited and may result in account termination.</li>
              <li><strong>Intellectual Property:</strong> Merchants may not infringe upon any intellectual property rights in their use of the Platform.</li>
            </ul>

            <h4 className="font-bold text-gray-700 mb-2">TERMINATION AND SUSPENSION</h4>
            <ul className="text-sm text-gray-600 mb-4 list-disc pl-5">
              <li><strong>Termination by Merchant:</strong> Merchants may terminate their account by providing OlivePay with written notice.</li>
              <li><strong>Termination by OlivePay:</strong> OlivePay reserves the right to suspend or terminate a Merchant's account for violation of these Terms or any fraudulent, harmful, or illegal activity.</li>
              <li><strong>Effect of Termination:</strong> Upon termination, the Merchant will lose access to the Platform, and any outstanding payments due will be processed in accordance with the terms.</li>
            </ul>

            <h4 className="font-bold text-gray-700 mb-2">LIMITATION OF LIABILITY</h4>
            <ul className="text-sm text-gray-600 mb-4 list-disc pl-5">
              <li><strong>Disclaimer:</strong> OlivePay makes no guarantees about the performance, security, or reliability of the platform.</li>
              <li><strong>Liability Cap:</strong> OlivePay's liability to the Merchant is limited to the fees paid by the Merchant to OlivePay in the 12 months preceding the claim.</li>
              <li><strong>Indemnification:</strong> The Merchant agrees to indemnify OlivePay against any claims, damages, or expenses arising from the Merchant's use of the Platform.</li>
            </ul>

            <h4 className="font-bold text-gray-700 mb-2">GOVERNING LAW AND DISPUTE RESOLUTION</h4>
            <ul className="text-sm text-gray-600 mb-4 list-disc pl-5">
              <li><strong>Governing Law:</strong> These Terms are governed by the laws of Nigeria.</li>
              <li><strong>Dispute Resolution:</strong> Any disputes arising from or related to these Terms will be resolved through arbitration in Lagos, Nigeria.</li>
            </ul>

            <h4 className="font-bold text-gray-700 mb-2">MODIFICATION TO TERMS</h4>
            <ul className="text-sm text-gray-600 mb-4 list-disc pl-5">
              <li><strong>Updates:</strong> OlivePay reserves the right to modify these terms at any time. Merchants will be notified of significant changes.</li>
              <li><strong>Continued Use:</strong> Continued use of the Platform after changes to the Terms constitutes acceptance of the new terms.</li>
            </ul>

            <h4 className="font-bold text-gray-700 mb-2">CONTACT INFORMATION</h4>
            <p className="text-sm text-gray-600 mb-2">For any questions regarding these Terms, please contact OlivePay at:</p>
            <ul className="text-sm text-gray-600 mb-4 list-none pl-5">
              <li><strong>Email:</strong> support@olivepayment.com</li>
              <li><strong>Phone:</strong> 02013303200</li>
              <li><strong>Address:</strong> 150 Awolowo Road Ikeja, Lagos</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={() => setAcceptedTerms(!acceptedTerms)}
                required
                className="mt-1 text-[#0B3D3B] rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                I hereby certify that the information provided is true and accurate, and I authorize OlivePayment
                Solutions Limited to verify the provided details for processing this application. I have read,
                understood, and agree to the Terms and Conditions above. *
              </span>
            </label>
          </div>
        </section>

          {/* Introducer Name */}
         <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md"
                required
              >
                <option value="">None</option>
                <option value="Retail">Head Office</option>
                <option value="Services">Abuja</option>
                <option value="Hospitality">Victoria Island</option>
                <option value="E-commerce">Enugu</option>
                <option value="E-commerce">Aba</option>
                <option value="E-commerce">Umuahia</option>
                <option value="E-commerce">Ilorin</option>
                <option value="E-commerce">Kano</option>
                <option value="E-commerce">Ibadan</option>
                <option value="E-commerce">Osun</option>
                <option value="E-commerce">Port Harcourt</option>
                <option value="E-commerce">Calabar</option>

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
        <p className="mt-1">Merchant POS Application Form</p>
      </div>
    </div>
    </main>
  );
}