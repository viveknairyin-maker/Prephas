import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submission received:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="font-body-md text-body-md bg-background min-h-screen flex flex-col antialiased">
      <Helmet>
        <title>Contact Us | PREPHAS</title>
        <meta name="description" content="Get in touch with PREPHAS support. Submit queries regarding resume formatting, ATS scores, account details, or business inquiries." />
        <link rel="canonical" href="https://www.prephas.online/contact" />
        
        {/* Social Meta */}
        <meta property="og:title" content="Contact Us | PREPHAS" />
        <meta property="og:description" content="Reach out to the PREPHAS team. We are here to support your resume building and ATS optimization journey." />
        <meta property="og:image" content="https://www.prephas.online/og-image.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.prephas.online/contact" />
      </Helmet>

      <Navbar />

      <main className="flex-grow pt-24 md:pt-32 pb-24 px-4 md:px-margin-desktop max-w-5xl mx-auto w-full">
        {/* Header */}
        <section className="text-center mb-16 border-b border-primary pb-10">
          <span className="font-label-sm text-xs uppercase tracking-widest text-secondary block mb-3">Communication & Support</span>
          <h1 className="font-display text-4xl md:text-5xl font-black uppercase text-primary tracking-tight leading-none mb-4">
            Contact Us
          </h1>
          <p className="font-body-lg text-secondary max-w-2xl mx-auto text-base">
            Have questions about ATS checks, our template library, or system errors? Reach out and we will get back to you.
          </p>
        </section>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Business Info Column */}
          <div className="md:col-span-5 border border-primary bg-white p-8 md:p-10 block-shadow space-y-8">
            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-3">Business Inquiries</h2>
              <p className="text-secondary text-sm leading-relaxed">
                For partnerships, organization licensing, academic collaborations, or custom requests, please email us directly.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2">Support Email</h2>
              <a href="mailto:support@prephas.online" className="text-primary font-bold underline text-sm block">
                support@prephas.online
              </a>
              <span className="text-[11px] text-zinc-500 mt-1 block">Expected response time: 24-48 hours</span>
            </div>

            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2">Location</h2>
              <p className="text-secondary text-sm leading-relaxed">
                PREPHAS Career Solutions<br />
                Varthur Road, Whitefield,<br />
                Bengaluru, Karnataka 560066<br />
                India 🇮🇳
              </p>
            </div>
          </div>

          {/* Form Column */}
          <div className="md:col-span-7 border border-primary bg-white p-8 md:p-10 block-shadow">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <span className="material-symbols-outlined text-[64px] text-primary" data-icon="mail">mail</span>
                <h2 className="text-xl font-bold uppercase text-primary">Message Received</h2>
                <p className="text-secondary text-sm max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out. The PREPHAS support team has received your query and will contact you via email at our earliest convenience.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 bg-primary text-on-primary px-8 py-3.5 font-semibold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-xl font-bold uppercase text-primary border-b border-zinc-100 pb-3 mb-2">
                  Send a Message
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-zinc-600 block">Name</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-zinc-600 block">Email</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-zinc-600 block">Subject</label>
                  <input
                    id="subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded-none"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-zinc-600 block">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full md:w-auto bg-primary text-on-primary px-8 py-4 font-semibold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  Submit Message
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ContactPage;
