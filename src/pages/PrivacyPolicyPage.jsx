import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

function PrivacyPolicyPage() {
  return (
    <div className="font-body-md text-body-md bg-background min-h-screen flex flex-col">
      <Helmet>
        <title>Privacy Policy | PREPHAS Resume Builder</title>
        <meta name="description" content="Privacy Policy for PREPHAS - AI Resume Builder and ATS Score Checker. Learn how we collect, protect, and handle your account, resume, and analytics data." />
        <link rel="canonical" href="https://www.prephas.online/privacy-policy" />
      </Helmet>
      <Navbar />
      <main className="pt-24 pb-20 px-margin-mobile md:px-margin-desktop flex-grow">
        <div className="max-w-3xl mx-auto bg-white border border-primary p-8 md:p-12 block-shadow">
          <h1 className="font-display text-headline-lg md:text-[40px] uppercase text-primary border-b border-primary pb-6 mb-8 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-secondary font-body-lg mb-6 leading-relaxed">
            Last Updated: June 15, 2026
          </p>
          <p className="text-secondary mb-6 leading-relaxed">
            At PREPHAS, accessible from <a href="https://www.prephas.online" className="text-primary font-bold underline">https://www.prephas.online</a>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by PREPHAS and how we use it.
          </p>
          
          <h2 className="font-headline-md uppercase text-primary mt-8 mb-4">
            1. Information We Collect
          </h2>
          <p className="text-secondary mb-4 leading-relaxed">
            We collect several different types of information for various purposes to provide and improve our service to you:
          </p>
          <ul className="list-disc list-inside text-secondary space-y-2 mb-6 ml-4">
            <li><strong>Account Information:</strong> When you register an account, we collect your email address, full name, and authentication details via Firebase Auth.</li>
            <li><strong>Resume Data:</strong> We store all the structured contents of the resumes you build (basic info, experience, education, skills, projects, and custom sections) on our Firestore database so you can edit and download them at any time.</li>
            <li><strong>ATS & Text Content:</strong> The text uploaded for ATS Analysis is transiently processed by the Gemini API to calculate scores and breakdown details.</li>
          </ul>

          <h2 className="font-headline-md uppercase text-primary mt-8 mb-4">
            2. How We Use Your Data
          </h2>
          <p className="text-secondary mb-4 leading-relaxed">
            PREPHAS uses the collected data for various purposes:
          </p>
          <ul className="list-disc list-inside text-secondary space-y-2 mb-6 ml-4">
            <li>To provide and maintain our resume builder and editing services.</li>
            <li>To calculate ATS Scores and provide job description matching feedback.</li>
            <li>To manage your account registration, authentication, and plan details.</li>
            <li>To monitor application usage and improve platform features.</li>
          </ul>

          <h2 className="font-headline-md uppercase text-primary mt-8 mb-4">
            3. Third-Party Services
          </h2>
          <p className="text-secondary mb-4 leading-relaxed">
            We integrate trusted third-party cloud services to power the PREPHAS application infrastructure:
          </p>
          <ul className="list-disc list-inside text-secondary space-y-2 mb-6 ml-4">
            <li><strong>Firebase:</strong> We use Firebase Authentication to secure accounts, and Cloud Firestore to store your resume documents. Your authentication credentials and database documents are stored on Google Cloud infrastructure.</li>
            <li><strong>Google Analytics 4 (GA4):</strong> We use GA4 to collect anonymous web traffic and conversion data. It tracks page navigation and custom user events (such as downloading a resume or running an ATS check) to help us analyze feature engagement and conversion rates.</li>
            <li><strong>Google Gemini API:</strong> Resume content is processed by Gemini model instances to run the resume improver, summary generator, and ATS checker. No personal resume contents are stored or used for model training.</li>
          </ul>

          <h2 className="font-headline-md uppercase text-primary mt-8 mb-4">
            4. Cookies & Trackers
          </h2>
          <p className="text-secondary mb-6 leading-relaxed">
            Like any other website, PREPHAS uses "cookies". These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information. You can choose to disable cookies through your individual browser options.
          </p>

          <h2 className="font-headline-md uppercase text-primary mt-8 mb-4">
            5. Data Security
          </h2>
          <p className="text-secondary mb-6 leading-relaxed">
            The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means (including SSL encryption, Firestore rule checks, and Firebase security protocols) to protect your Personal Data, we cannot guarantee its absolute security.
          </p>

          <h2 className="font-headline-md uppercase text-primary mt-8 mb-4">
            6. Your Data Rights
          </h2>
          <p className="text-secondary mb-4 leading-relaxed">
            Depending on your location, you may have rights under regional regulations (such as GDPR or CCPA) regarding your personal data:
          </p>
          <ul className="list-disc list-inside text-secondary space-y-2 mb-6 ml-4">
            <li>The right to access, update, or delete the information we have on you.</li>
            <li>The right of rectification (to correct inaccurate information).</li>
            <li>The right to object to or restrict processing of your data.</li>
            <li>The right to data portability.</li>
          </ul>
          <p className="text-secondary mb-6 leading-relaxed">
            You can modify your resume details or delete resumes directly inside the dashboard. To delete your entire account and associated Firestore data, you can contact us at our support address.
          </p>

          <h2 className="font-headline-md uppercase text-primary mt-8 mb-4">
            7. Contact Us
          </h2>
          <p className="text-secondary mb-6 leading-relaxed">
            If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at:
          </p>
          <div className="border-l-4 border-primary pl-4 py-2 bg-zinc-50">
            <p className="font-bold text-primary">PREPHAS Support Team</p>
            <p className="text-secondary text-sm">Email: support@prephas.online</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default PrivacyPolicyPage;
