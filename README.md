# POS Application Forms – Olive Payment Solutions

This is a Next.js application I built for managing both **Agent** and **Merchant** POS application forms at Olive Payment Solutions Limited.  
The goal is to make onboarding faster, digital, and more organized with features like PDF generation, file uploads, and email integration.

---

## 🌟 What the website Can Do

- Separate application forms for Agents and Merchants  
- Automatically generates branded PDFs from the submitted data  
- Allows uploads for IDs, CAC documents, utility bills, etc.  
- Validates inputs before submission so errors are reduced  
- Fully mobile responsive with Tailwind CSS  
- Easy state management using React hooks  
- Sends completed forms and attachments via email  

---

## 📋 Types of Forms

### Agent Application Form

- Collects personal details  
- Business and financial info  
- POS requirements  
- Location and infrastructure details  
- Uploads for necessary documents  

### Merchant Application Form

- Captures business information  
- Owner/representative details  
- Bank account info  
- POS requirements and business location  
- Reference checks  
- Document uploads  

---

## 🚀 How to Run It

### Requirements

- Node.js 16.8 or later  
- Either npm, yarn, pnpm, or bun

Install dependencies:

npm install

## or yarn install / pnpm install / bun install

Start the dev server:

npm run dev

Open <http://localhost:3000>
 in your browser to see it.

## Project Structure

 /
├── app/
│   ├── agentForms/        # Agent application form
│   ├── merchantForms/     # Merchant application form
│   └── page.js            # Home page
├── utils/
│   └── generatePdf.js     # PDF helper functions
├── public/                # Static assets
│   └── payLogo.png
└── ...

## 🛠️ Tools I Used

Next.js 14
 – main framework

React
 – component-based UI

Tailwind CSS
 – styling

jsPDF
 – PDF generation

Next.js API Routes
 – handling form submissions

## 🔧 Setup and Config

### Environment Variables

I created a .env.local file to keep sensitive configs safe:

#### Email service (example)

EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_key
SUBMISSION_EMAIL=<olivemfb.ng@gmail.com>

#### Optional: database connection

DATABASE_URL=your_database_url

### API Routes

/api/agentForms – processes Agent form submissions

/api/merchantForms – processes Merchant form submissions

## 📝 How to Use the Forms

### Agents

Go to the Agent Application Form page.

Fill in your personal and business details.

Add financial information and POS requirements.

Enter your location and infrastructure details.

Upload the required documents (ID card, CAC, utility bill, etc.).

Review and submit. A PDF will be created and emailed automatically.

### Merchants

Go to the Merchant Application Form page.

Provide your business and representative details.

Enter your bank details and POS needs.

Add your business location and references.

Upload required supporting documents.

Review and submit. A PDF will also be generated and sent via email.

## 📤 Deployment

### Vercel (for now)

Push the code to GitHub

Link the repo on Vercel

Add the environment variables in the dashboard

Deploy 🚀

It can alsdefinitely be deployed to Netlify, AWS, Google Cloud, DigitalOcean, or any Node.js server.

## 📞 Support

Email: <support@olivepayment.com>

Phone: +234 201 330 3200

Address: 150 Awolowo Road, Ikeja, Lagos

## 📄 License

This is a proprietary project owned by Olive Payment Solutions Limited.

## 🏢 About Olive Payment Solutions

Olive Payment Solutions Limited provides innovative digital payment services including POS solutions, merchant accounts, and gateway integrations across Nigeria.
