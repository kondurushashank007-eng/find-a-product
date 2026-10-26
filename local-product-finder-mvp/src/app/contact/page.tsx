"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Merchant Inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate support submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-10">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <Mail className="w-3.5 h-3.5" />
          <span>We&apos;re Here to Help</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
          Get in Touch
        </h1>
        <p className="text-sm text-stone-600">
          Are you a local shop owner needing help importing your catalog? Or a shopper with suggestions? Send our community team a message.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact info cards */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1.5">
            <Mail className="w-5 h-5 text-emerald-600 mb-2" />
            <h3 className="text-sm font-bold text-stone-900">Email Support</h3>
            <p className="text-xs text-stone-500">Fast response within 24 hours</p>
            <a href="mailto:support@localproductfinder.com" className="text-xs text-emerald-700 font-semibold block hover:underline">
              support@localproductfinder.com
            </a>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1.5">
            <Phone className="w-5 h-5 text-emerald-600 mb-2" />
            <h3 className="text-sm font-bold text-stone-900">Merchant Helpdesk</h3>
            <p className="text-xs text-stone-500">Mon-Fri 9:00 AM - 6:00 PM EST</p>
            <a href="tel:+18005550199" className="text-xs text-emerald-700 font-semibold block hover:underline">
              +1 (800) 555-0199
            </a>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1.5">
            <MapPin className="w-5 h-5 text-emerald-600 mb-2" />
            <h3 className="text-sm font-bold text-stone-900">Office Location</h3>
            <p className="text-xs text-stone-600">
              412 Hudson Street<br />
              New York, NY 10014
            </p>
          </div>
        </div>

        {/* Contact form */}
        <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-stone-900">Message Received!</h3>
              <p className="text-stone-600 text-sm max-w-sm mx-auto">
                Thank you for reaching out. A neighborhood representative will review your message and reply promptly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: "", email: "", subject: "Merchant Inquiry", message: "" });
                }}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="Merchant Inquiry">Local Shop Owner - Setup & CSV Help</option>
                  <option value="Catalog Update">Inventory Correction Request</option>
                  <option value="Shopper Feedback">Shopper Feedback & Suggestions</option>
                  <option value="Partnership">Partnership / City Integration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Message *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="How can we help your shop or search experience?..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full text-sm p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
