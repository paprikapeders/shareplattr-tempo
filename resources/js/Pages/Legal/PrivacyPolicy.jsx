import { Link } from '@inertiajs/react';

function Section({ title, children }) {
    return (
        <section className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
            {children}
        </section>
    );
}

function Subsection({ title, children }) {
    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {children}
        </div>
    );
}

function List({ children }) {
    return <ul className="list-disc space-y-2 pl-6">{children}</ul>;
}

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-700">
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <Link href="/" className="text-sm font-semibold text-cyan-700 hover:text-cyan-800">
                    Back to Shareplattr
                </Link>

                <article className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <header className="space-y-2 border-b border-slate-100 pb-6">
                        <p className="text-sm font-semibold uppercase text-slate-400">shareplattr.com</p>
                        <h1 className="text-3xl font-bold text-slate-950">Privacy Policy</h1>
                        <p className="text-sm text-slate-500">Effective Date: 1 July 2025</p>
                    </header>

                    <div className="space-y-4 leading-7">
                        <Section title="1. Introduction">
                            <p>
                                Shareplattr Pty Ltd ("Shareplattr", "we", "us", or "our") is committed to protecting the privacy of all individuals who use our peer-to-peer referral platform at shareplattr.com (the "Platform"). This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information.
                            </p>
                            <p>This Policy applies globally and is designed to comply with:</p>
                            <List>
                                <li>The Australian Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).</li>
                                <li>The General Data Protection Regulation (GDPR) (EU) 2016/679, as retained in UK law by the UK GDPR and Data Protection Act 2018.</li>
                                <li>The California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA) for California residents.</li>
                                <li>Other applicable international privacy and data protection laws.</li>
                            </List>
                            <p>
                                By using the Platform, you consent to the practices described in this Policy. If you do not agree, please discontinue use of the Platform.
                            </p>
                        </Section>

                        <Section title="2. Who We Are (Data Controller)">
                            <p>For the purposes of applicable data protection law, the data controller is:</p>
                            <p>
                                Shareplattr Pty Ltd<br />
                                Email: privacy@shareplattr.com<br />
                                Website: www.shareplattr.com
                            </p>
                            <p>
                                For users in the UK/EU, Shareplattr acts as the data controller within the meaning of the UK GDPR and EU GDPR. Where required, Shareplattr will appoint a representative in the relevant jurisdiction.
                            </p>
                        </Section>

                        <Section title="3. Information We Collect">
                            <Subsection title="3.1 Information You Provide">
                                <p>We collect personal information you provide directly to us, including:</p>
                                <List>
                                    <li>Account registration details: name, email address, password, phone number, and profile information.</li>
                                    <li>Business details: company name, ABN/business registration number, billing address, and payment information.</li>
                                    <li>Campaign content: descriptions, images, pricing, and other materials submitted by Businesses.</li>
                                    <li>Referral activity: referral links generated, conversions, and Reward claims submitted by Referrers.</li>
                                    <li>Communications: messages sent to Shareplattr via support channels, email, or in-Platform messaging.</li>
                                </List>
                            </Subsection>
                            <Subsection title="3.2 Information Collected Automatically">
                                <p>When you use the Platform, we automatically collect:</p>
                                <List>
                                    <li>Device and technical data: IP address, browser type and version, operating system, device identifiers.</li>
                                    <li>Usage data: pages visited, features used, clicks, search queries, referral link activity, and session duration.</li>
                                    <li>Cookies and similar tracking technologies, as described in Section 8.</li>
                                </List>
                            </Subsection>
                            <Subsection title="3.3 Information from Third Parties">
                                <p>We may receive personal information from third parties, including:</p>
                                <List>
                                    <li>Payment processors, including Stripe, for transaction verification.</li>
                                    <li>Identity verification providers, where applicable.</li>
                                    <li>Analytics and advertising partners.</li>
                                    <li>Social media platforms, if you connect a social account to your Shareplattr profile.</li>
                                </List>
                            </Subsection>
                        </Section>

                        <Section title="4. How We Use Your Information">
                            <p>We use personal information for the following purposes and, where required by law, rely on the following legal bases:</p>
                            <Subsection title="4.1 Performance of Contract">
                                <List>
                                    <li>Creating and managing your account.</li>
                                    <li>Processing Campaign listings, referral tracking, and Reward payments.</li>
                                    <li>Facilitating transactions between Businesses and Referrers.</li>
                                </List>
                            </Subsection>
                            <Subsection title="4.2 Legitimate Interests">
                                <List>
                                    <li>Improving and personalising the Platform.</li>
                                    <li>Detecting, preventing, and investigating fraud and security incidents.</li>
                                    <li>Analysing usage trends and measuring Platform performance.</li>
                                    <li>Sending service-related communications, including platform updates and policy changes.</li>
                                </List>
                            </Subsection>
                            <Subsection title="4.3 Compliance with Legal Obligations">
                                <List>
                                    <li>Complying with applicable laws, regulations, and legal processes.</li>
                                    <li>Responding to lawful requests from government authorities.</li>
                                    <li>Maintaining records required by tax and financial regulations.</li>
                                </List>
                            </Subsection>
                            <Subsection title="4.4 Consent (where applicable)">
                                <List>
                                    <li>Sending marketing and promotional communications. You may opt out at any time.</li>
                                    <li>Setting non-essential cookies, as described in Section 8.</li>
                                </List>
                            </Subsection>
                        </Section>

                        <Section title="5. How We Share Your Information">
                            <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
                            <List>
                                <li><span className="font-semibold">Service Providers:</span> We share information with trusted third-party vendors who assist us in operating the Platform, including cloud hosting, payment processing, email delivery, and analytics.</li>
                                <li><span className="font-semibold">Businesses and Referrers:</span> Shareplattr may share necessary referral data between Businesses and Referrers to facilitate Campaign operation and Reward payment. Only the minimum necessary information is shared.</li>
                                <li><span className="font-semibold">Legal Requirements:</span> We may disclose information where required by law, court order, or governmental authority, or where we believe disclosure is necessary to protect our rights or the safety of Users.</li>
                                <li><span className="font-semibold">Business Transfers:</span> In the event of a merger, acquisition, or sale of all or part of our business, your information may be transferred to the successor entity.</li>
                                <li><span className="font-semibold">With Your Consent:</span> We may share information for other purposes with your explicit consent.</li>
                            </List>
                        </Section>

                        <Section title="6. International Data Transfers">
                            <p>
                                Shareplattr operates globally and may transfer your personal information to countries outside your country of residence, including Australia, the United States, and the United Kingdom. These countries may have different data protection laws to those in your jurisdiction.
                            </p>
                            <p>Where we transfer personal data from the UK or EEA, we ensure adequate safeguards are in place, including:</p>
                            <List>
                                <li>Standard Contractual Clauses (SCCs) approved by the European Commission or UK ICO.</li>
                                <li>Transfers to countries with an adequacy decision.</li>
                                <li>Other lawful transfer mechanisms as required.</li>
                            </List>
                            <p>For Australian users, we comply with the cross-border disclosure obligations under APP 8.</p>
                        </Section>

                        <Section title="7. Data Retention">
                            <p>We retain personal information only for as long as necessary to fulfil the purposes for which it was collected, or as required by law. In general:</p>
                            <List>
                                <li>Account data is retained for the duration of your account and for up to 7 years after account closure for legal and tax compliance purposes.</li>
                                <li>Campaign and referral data is retained for up to 7 years to comply with financial record-keeping obligations.</li>
                                <li>Marketing data is retained until you withdraw consent or opt out.</li>
                                <li>Technical and log data is generally retained for 12 months.</li>
                            </List>
                            <p>When personal information is no longer required, it is securely deleted or anonymised.</p>
                        </Section>

                        <Section title="8. Cookies and Tracking Technologies">
                            <p>We use cookies and similar technologies to operate and improve the Platform. Cookies are small data files stored on your device. We use:</p>
                            <List>
                                <li>Essential cookies: necessary for the Platform to function, including login sessions and security tokens.</li>
                                <li>Analytics cookies: to understand how Users interact with the Platform.</li>
                                <li>Marketing cookies: to measure the effectiveness of campaigns and deliver relevant advertising.</li>
                            </List>
                            <p>
                                You can manage cookie preferences via your browser settings or our cookie consent tool. Disabling essential cookies may affect Platform functionality. For more information, see our Cookie Policy at www.shareplattr.com/cookies.
                            </p>
                        </Section>

                        <Section title="9. Data Security">
                            <p>
                                We implement appropriate technical and organisational security measures to protect your personal information against unauthorised access, loss, destruction, or alteration. These measures include encryption in transit (TLS), access controls, regular security assessments, and staff training.
                            </p>
                            <p>
                                Despite our efforts, no method of transmission over the internet is completely secure. If you become aware of any security concern related to your account, please contact us immediately at security@shareplattr.com.
                            </p>
                            <p>
                                In the event of a data breach that is likely to result in a risk to your rights and freedoms, we will notify you and the relevant regulatory authorities in accordance with applicable law.
                            </p>
                        </Section>

                        <Section title="10. Your Privacy Rights">
                            <Subsection title="10.1 All Users">
                                <p>Regardless of your location, you have the right to:</p>
                                <List>
                                    <li>Access the personal information we hold about you.</li>
                                    <li>Request correction of inaccurate or incomplete information.</li>
                                    <li>Opt out of marketing communications at any time.</li>
                                    <li>Lodge a complaint with us or a relevant regulatory authority.</li>
                                </List>
                            </Subsection>
                            <Subsection title="10.2 Australian Users (Privacy Act 1988)">
                                <p>Australian users may access and correct personal information in accordance with the APPs and may direct complaints to the Office of the Australian Information Commissioner (OAIC) at www.oaic.gov.au.</p>
                            </Subsection>
                            <Subsection title="10.3 UK and EU Users (UK GDPR / EU GDPR)">
                                <p>In addition to the above, UK and EU users have the right to:</p>
                                <List>
                                    <li>Erasure ("right to be forgotten") in certain circumstances.</li>
                                    <li>Restriction of processing.</li>
                                    <li>Data portability.</li>
                                    <li>Object to processing based on legitimate interests.</li>
                                    <li>Withdraw consent at any time where processing is based on consent.</li>
                                    <li>Lodge a complaint with the UK Information Commissioner's Office (ICO) at www.ico.org.uk or your local EU supervisory authority.</li>
                                </List>
                            </Subsection>
                            <Subsection title="10.4 California Users (CCPA / CPRA)">
                                <p>California residents have the right to:</p>
                                <List>
                                    <li>Know what personal information is collected, used, shared, or sold.</li>
                                    <li>Delete personal information we have collected.</li>
                                    <li>Opt out of the sale or sharing of personal information. We do not sell personal information.</li>
                                    <li>Non-discrimination for exercising your privacy rights.</li>
                                    <li>Correct inaccurate personal information.</li>
                                </List>
                            </Subsection>
                            <p>
                                To exercise any of the above rights, please contact us at privacy@shareplattr.com. We will respond within the timeframe required by applicable law, generally 30 days. We may require identity verification before processing your request.
                            </p>
                        </Section>

                        <Section title="11. Children's Privacy">
                            <p>
                                The Platform is not directed at individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that we have inadvertently collected personal information from a minor, we will delete it promptly. If you believe a minor has provided us with personal information, please contact us at privacy@shareplattr.com.
                            </p>
                        </Section>

                        <Section title="12. Third-Party Links and Services">
                            <p>
                                The Platform may contain links to third-party websites, applications, or services. This Privacy Policy does not apply to those third parties. We encourage you to review the privacy policies of any third-party services you access through the Platform. Shareplattr is not responsible for the privacy practices of third parties.
                            </p>
                        </Section>

                        <Section title="13. Changes to This Privacy Policy">
                            <p>
                                We may update this Privacy Policy from time to time. Material changes will be communicated to you via email or prominent notice on the Platform at least 14 days before the change takes effect. The updated Policy will indicate the revised effective date.
                            </p>
                            <p>Your continued use of the Platform after the effective date of any updated Policy constitutes your acceptance of the revised Policy.</p>
                        </Section>

                        <Section title="14. Contact Us">
                            <p>For any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Privacy Officer:</p>
                            <p>
                                Shareplattr Pty Ltd - Privacy Officer<br />
                                Email: privacy@shareplattr.com<br />
                                Website: www.shareplattr.com
                            </p>
                            <p>For UK/EU data protection queries, you may also contact our UK/EU representative, details available upon request.</p>
                            <p>This Privacy Policy was last updated on 1 July 2025.</p>
                            <p>2025 Shareplattr Pty Ltd. All rights reserved.</p>
                        </Section>
                    </div>
                </article>
            </div>
        </main>
    );
}
