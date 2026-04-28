function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="text-sm text-slate-500">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6 text-slate-700">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            1. Information We Collect
          </h2>
          <p>
            We collect information that you provide directly to us, including
            your name, email address, phone number, and payment information when
            you create an account or make a purchase.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            2. How We Use Your Information
          </h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Process your orders and deliver products</li>
            <li>Send you order confirmations and updates</li>
            <li>Respond to your questions and provide customer support</li>
            <li>Improve our website and services</li>
            <li>Send promotional emails (with your consent)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            3. Information Sharing
          </h2>
          <p>
            We do not sell or rent your personal information to third parties.
            We may share your information with service providers who help us
            operate our business, such as payment processors and shipping
            companies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal
            information from unauthorized access, alteration, disclosure, or
            destruction. However, no method of transmission over the internet is
            100% secure.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your personal information</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">6. Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to improve your
            browsing experience, analyze site traffic, and personalize content.
            You can control cookies through your browser settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at{" "}
            <a
              href="mailto:privacy@shopbee.com"
              className="text-indigo-600 hover:text-indigo-700"
            >
              privacy@shopbee.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPage;
