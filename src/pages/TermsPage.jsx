import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

function TermsPage() {
  return (
    <div className="font-body-md text-body-md bg-background min-h-screen flex flex-col">
      <Helmet>
        <title>Terms and Conditions | PREPHAS Resume Builder</title>
        <meta name="description" content="Terms and Conditions for PREPHAS - AI Resume Builder and ATS Score Checker. Review rules, content responsibilities, and service disclaimers." />
        <link rel="canonical" href="https://www.prephas.online/terms-and-conditions" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Terms and Conditions | PREPHAS Resume Builder" />
        <meta property="og:description" content="Understand the terms of service, usage guidelines, and intellectual property conditions for PREPHAS resume builder." />
        <meta property="og:image" content="https://www.prephas.online/og-image.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.prephas.online/terms-and-conditions" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Terms and Conditions | PREPHAS" />
        <meta name="twitter:description" content="Review our user guidelines, disclaimer of warranties, and limitations of liability." />
        <meta name="twitter:image" content="https://www.prephas.online/og-image.png" />
      </Helmet>
      <Navbar />
      <main className="pt-24 pb-20 px-margin-mobile md:px-margin-desktop flex-grow">
        <div className="max-w-3xl mx-auto bg-white border border-primary p-8 md:p-12 block-shadow">
          <h1 className="font-display text-headline-lg md:text-[40px] uppercase text-primary border-b border-primary pb-6 mb-8 leading-tight">
            Terms & Conditions
          </h1>
          <p className="text-secondary font-body-lg mb-6 leading-relaxed">
            Last Updated: June 15, 2026
          </p>
          <p className="text-secondary mb-6 leading-relaxed">
            Welcome to PREPHAS! These Terms & Conditions outline the rules and regulations for the use of PREPHAS's Website and services, located at <a href="https://www.prephas.online" className="text-primary font-bold underline">https://www.prephas.online</a>.
          </p>
          <p className="text-secondary mb-6 leading-relaxed">
            By accessing this website and using our services (including the AI resume builder, ATS analyzer, and template layouts), we assume you accept these terms and conditions in full. Do not continue to use PREPHAS if you do not agree to take all of the terms and conditions stated on this page.
          </p>

          <h2 className="font-headline-md uppercase text-primary mt-8 mb-4">
            1. Acceptance of Terms & Services
          </h2>
          <p className="text-secondary mb-6 leading-relaxed">
            By creating an account, editing resumes, importing files, or navigating our site, you contract to bind yourself under these Terms. You represent that you are at least 18 years of age or the age of legal majority in your jurisdiction.
          </p>

          <h2 className="font-headline-md uppercase text-primary mt-8 mb-4">
            2. User Accounts & Security
          </h2>
          <p className="text-secondary mb-6 leading-relaxed">
            To access major builder tools, you must register for an account. You are solely responsible for maintaining the confidentiality of your credentials (such as email logins or Google OAuth links) and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use or security leaks.
          </p>

          <h2 className="font-headline-md uppercase text-primary mt-8 mb-4">
            3. Content Responsibility & Disclaimers
          </h2>
          <p className="text-secondary mb-6 leading-relaxed">
            You retain all rights to any text, resume details, personal details, or uploaded documents that you enter into PREPHAS. However, you are solely responsible for the accuracy, legality, truthfulness, and quality of your resume content. PREPHAS does not pre-screen or verify the contents of your resume, and is not responsible for any misleading details, credential falsifications, or typographical errors inside exported PDF documents.
          </p>

          <h2 className="font-headline-md uppercase text-primary mt-8 mb-4">
            4. AI Generation & ATS Analysis Disclaimer
          </h2>
          <p className="text-secondary mb-6 leading-relaxed">
            PREPHAS provides AI-powered writing suggestions, bullet generation, and ATS score checking using model configurations from the Google Gemini API. These systems estimate ATS readability and score alignment using mathematical analysis and heuristics. We do not guarantee that the AI-generated suggestions will be error-free or represent your exact professional experience. You must review and edit all AI suggestions before exporting your resume.
          </p>

          <h2 className="font-headline-md uppercase text-primary mt-8 mb-4">
            5. No Guarantee of Interviews or Employment
          </h2>
          <p className="text-secondary mb-6 leading-relaxed">
            PREPHAS provides tools to improve, structure, and format resumes. We make **no guarantees, explicit or implied**, that using our resume builder, templates, or scoring checker will result in job offers, recruiting callbacks, screening passes, or job interviews. Finding employment depends on numerous variables (candidate qualifications, job market status, interviewer criteria) beyond the scope of PREPHAS software tools.
          </p>

          <h2 className="font-headline-md uppercase text-primary mt-8 mb-4">
            6. Intellectual Property
          </h2>
          <p className="text-secondary mb-6 leading-relaxed">
            All code, structural designs, layout templates, UI assets, logos, and custom CSS elements displayed on PREPHAS are the intellectual property of PREPHAS and are protected by copyright laws. You are granted a limited, personal, non-transferable license to customize our templates to build and export your own resumes. You may not copy, reverse-engineer, sell, resell, or distribute our templates, stylesheets, or UI scripts as competitive commercial products.
          </p>

          <h2 className="font-headline-md uppercase text-primary mt-8 mb-4">
            7. Service Availability & Plan Modification
          </h2>
          <p className="text-secondary mb-6 leading-relaxed">
            We strive to provide continuous website availability, but we make no guarantee of uninterrupted uptime. We reserve the right to temporarily disable features, update stylesheets, modify templates, adjust plan limitations, or terminate hosting routes at our discretion for maintenance, security updates, or feature enhancements.
          </p>

          <h2 className="font-headline-md uppercase text-primary mt-8 mb-4">
            8. Limitation of Liability
          </h2>
          <p className="text-secondary mb-6 leading-relaxed">
            To the maximum extent permitted by applicable law, in no event shall PREPHAS, its founders, or affiliates, be liable for any indirect, incidental, special, exemplary, or consequential damages (including, without limitation, loss of employment opportunities, data corruption, profit losses, or business interruption) arising out of the use, inability to use, or results of using our services.
          </p>

          <h2 className="font-headline-md uppercase text-primary mt-8 mb-4">
            9. Changes to Terms
          </h2>
          <p className="text-secondary mb-6 leading-relaxed">
            We reserve the right to modify these Terms & Conditions at any time. We will indicate changes by updating the "Last Updated" date at the top of this document. Your continued use of the website after changes are posted constitutes your acceptance of the revised Terms.
          </p>

          <h2 className="font-headline-md uppercase text-primary mt-8 mb-4">
            10. Contact Information
          </h2>
          <p className="text-secondary mb-6 leading-relaxed">
            If you have any queries regarding any of our terms, please contact us:
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

export default TermsPage;
