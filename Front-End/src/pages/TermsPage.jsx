function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">
          Terms and Conditions
        </h1>
        <p className="text-sm text-slate-500">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6 text-slate-700">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using ShopBee, you accept and agree to be bound by
            these Terms and Conditions. If you do not agree with any part of
            these terms, you may not use our services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">2. User Accounts</h2>
          <p>
            To access certain features, you must create an account. You are
            responsible for:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized use</li>
            <li>Providing accurate and complete information</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            3. Product Information
          </h2>
          <p>
            We strive to provide accurate product descriptions and pricing.
            However, we do not warrant that product descriptions, pricing, or
            other content is accurate, complete, or error-free. We reserve the
            right to correct any errors and update information at any time.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            4. Orders and Payment
          </h2>
          <p>
            By placing an order, you agree to provide current, complete, and
            accurate purchase information. We reserve the right to refuse or
            cancel any order for any reason, including product availability,
            errors in pricing, or suspected fraud.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            5. Shipping and Delivery
          </h2>
          <p>
            Shipping times are estimates and may vary. We are not responsible
            for delays caused by shipping carriers or circumstances beyond our
            control. Risk of loss passes to you upon delivery to the carrier.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            6. Returns and Refunds
          </h2>
          <p>
            We accept returns within 30 days of delivery. Items must be unused
            and in original packaging. Refunds will be processed to the original
            payment method within 7-10 business days after receiving the return.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            7. Intellectual Property
          </h2>
          <p>
            All content on ShopBee, including text, graphics, logos, and images,
            is the property of ShopBee or its content suppliers and is protected
            by copyright and trademark laws.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            8. Limitation of Liability
          </h2>
          <p>
            ShopBee shall not be liable for any indirect, incidental, special,
            or consequential damages arising out of or in connection with your
            use of our services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            9. Changes to Terms
          </h2>
          <p>
            We reserve the right to modify these terms at any time. Changes will
            be effective immediately upon posting. Your continued use of ShopBee
            constitutes acceptance of the modified terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">10. Contact Us</h2>
          <p>
            If you have questions about these Terms and Conditions, please
            contact us at{" "}
            <a
              href="mailto:support@shopbee.com"
              className="text-indigo-600 hover:text-indigo-700"
            >
              support@shopbee.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

export default TermsPage;
