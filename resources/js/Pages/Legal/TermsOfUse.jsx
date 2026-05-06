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

export default function TermsOfUse() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-700">
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <Link href="/" className="text-sm font-semibold text-cyan-700 hover:text-cyan-800">
                    Back to Shareplattr
                </Link>

                <article className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <header className="space-y-2 border-b border-slate-100 pb-6">
                        <p className="text-sm font-semibold uppercase text-slate-400">shareplattr.com</p>
                        <h1 className="text-3xl font-bold text-slate-950">Terms of Use</h1>
                        <p className="text-sm text-slate-500">Effective Date: 1 July 2025</p>
                    </header>

                    <div className="space-y-4 leading-7">
                        <Section title="1. Introduction and Acceptance">
                            <p>
                                Welcome to Shareplattr. These Terms of Use ("Terms") constitute a legally binding agreement between you and Shareplattr Pty Ltd ("Shareplattr", "we", "us", or "our"), governing your access to and use of the Shareplattr platform, website, and associated services (collectively, the "Platform").
                            </p>
                            <p>
                                By accessing or using the Platform, registering an account, posting a campaign, or participating as a Referrer, you agree to be bound by these Terms. If you do not agree, you must not use the Platform.
                            </p>
                            <p>
                                These Terms apply globally, including users in Australia, the United States, the United Kingdom, and all other jurisdictions. Where local laws impose additional requirements, those requirements apply to the extent mandated by law.
                            </p>
                        </Section>

                        <Section title="2. Definitions">
                            <p>In these Terms, the following definitions apply:</p>
                            <List>
                                <li>"Platform" means the Shareplattr website, mobile application, APIs, and all related services.</li>
                                <li>"Business" means any individual, company, or organisation that creates and publishes a Campaign on the Platform.</li>
                                <li>"Referrer" means any individual who shares a Campaign via a unique referral link and may earn a Reward.</li>
                                <li>"Campaign" means a promotional offer, product listing, or service advertisement created by a Business and made available on the Marketplace.</li>
                                <li>"Marketplace" means the section of the Platform where Campaigns are listed and discoverable by Referrers.</li>
                                <li>"Reward" means the monetary or non-monetary compensation offered by a Business to a Referrer upon a successful referral, as defined in each Campaign.</li>
                                <li>"User" means any person or entity accessing or using the Platform, including Businesses and Referrers.</li>
                                <li>"Content" means any material uploaded, posted, or transmitted via the Platform, including text, images, links, and campaign details.</li>
                            </List>
                        </Section>

                        <Section title="3. Eligibility">
                            <p>To use the Platform you must:</p>
                            <List>
                                <li>Be at least 18 years of age, or the age of majority in your jurisdiction, whichever is higher.</li>
                                <li>Have the legal capacity to enter into a binding contract.</li>
                                <li>Not be prohibited from using the Platform under applicable law.</li>
                                <li>If registering as a Business, be duly authorised to act on behalf of that business entity.</li>
                            </List>
                            <p>
                                By using the Platform, you represent and warrant that you meet all eligibility requirements. Shareplattr reserves the right to suspend or terminate accounts that do not meet these requirements.
                            </p>
                        </Section>

                        <Section title="4. Account Registration">
                            <p>To access certain features of the Platform, you must register for an account. When registering, you agree to:</p>
                            <List>
                                <li>Provide accurate, current, and complete information.</li>
                                <li>Maintain and promptly update your account information.</li>
                                <li>Keep your login credentials confidential and not share them with any third party.</li>
                                <li>Notify Shareplattr immediately of any unauthorised use of your account.</li>
                            </List>
                            <p>
                                You are responsible for all activity that occurs under your account. Shareplattr is not liable for any loss or damage arising from your failure to maintain account security.
                            </p>
                        </Section>

                        <Section title="5. Businesses - Campaign Creation and Marketplace">
                            <Subsection title="5.1 Campaign Listings">
                                <p>Businesses may create Campaigns and list them on the Marketplace subject to these Terms and any additional Business guidelines published on the Platform. By creating a Campaign, the Business:</p>
                                <List>
                                    <li>Warrants that the product, service, or offer described is lawful, accurately represented, and compliant with all applicable laws and advertising standards, including Australian Consumer Law, FTC guidelines in the US, and the UK CAP Code.</li>
                                    <li>Accepts sole responsibility for fulfilling the Campaign, including delivering the advertised product or service and honouring all stated Rewards.</li>
                                    <li>Grants Shareplattr a non-exclusive, royalty-free licence to display, reproduce, and distribute Campaign Content on the Platform for the purpose of operating the Marketplace.</li>
                                </List>
                            </Subsection>
                            <Subsection title="5.2 Reward Obligations">
                                <p>
                                    Businesses must clearly specify Reward terms within each Campaign, including amount, currency, eligibility conditions, and payment timeframe. Shareplattr acts as a facilitator only and is not responsible for a Business's failure to pay Rewards. However, Shareplattr reserves the right to suspend or remove any Business that consistently fails to honour Reward commitments.
                                </p>
                            </Subsection>
                            <Subsection title="5.3 Prohibited Campaigns">
                                <p>Businesses must not create Campaigns relating to:</p>
                                <List>
                                    <li>Illegal products or services.</li>
                                    <li>Gambling, adult content, weapons, tobacco, or illicit substances, unless explicitly permitted in a separate agreement.</li>
                                    <li>Misleading, deceptive, or fraudulent offers.</li>
                                    <li>Content that infringes third-party intellectual property rights.</li>
                                </List>
                            </Subsection>
                        </Section>

                        <Section title="6. Referrers - Sharing and Earning">
                            <Subsection title="6.1 Referral Links">
                                <p>Upon joining a Campaign, Referrers receive a unique referral link. Referrers may share this link through personal networks, social media, websites, and other lawful channels. Referrers must:</p>
                                <List>
                                    <li>Disclose their referral relationship in accordance with applicable law, including Australian Competition and Consumer Commission guidance, FTC endorsement guidelines, and UK ASA rules.</li>
                                    <li>Not engage in spam, unsolicited bulk messaging, or any deceptive promotion.</li>
                                    <li>Not misrepresent the Campaign, Business, or Shareplattr in any way.</li>
                                </List>
                            </Subsection>
                            <Subsection title="6.2 Reward Eligibility">
                                <p>
                                    Rewards are subject to the specific terms of each Campaign. Shareplattr does not guarantee the payment of any Reward and is not liable for disputes between Businesses and Referrers regarding Reward eligibility or payment. Referrers are solely responsible for any tax obligations arising from Rewards received.
                                </p>
                            </Subsection>
                            <Subsection title="6.3 Prohibited Conduct">
                                <p>Referrers must not:</p>
                                <List>
                                    <li>Generate fraudulent, simulated, or self-referrals.</li>
                                    <li>Use bots, automated tools, or artificial means to inflate referral metrics.</li>
                                    <li>Engage in any conduct that is deceptive, misleading, or otherwise unlawful.</li>
                                </List>
                            </Subsection>
                        </Section>

                        <Section title="7. Fees and Payment">
                            <p>
                                Shareplattr may charge fees to Businesses for accessing the Platform, creating Campaigns, or other premium features. All applicable fees will be clearly communicated prior to commitment. Fees are non-refundable unless otherwise stated or required by law.
                            </p>
                            <p>
                                All payments are processed through third-party payment providers. By making a payment, you also agree to the terms of the applicable payment provider. Shareplattr is not responsible for payment processing errors by third-party providers.
                            </p>
                        </Section>

                        <Section title="8. Intellectual Property">
                            <p>
                                All intellectual property rights in the Platform, including its design, software, trademarks, logos, and content created by Shareplattr, are owned by or licensed to Shareplattr. Nothing in these Terms grants you any rights in or to the Platform's intellectual property beyond the limited right to use the Platform in accordance with these Terms.
                            </p>
                            <p>
                                You retain ownership of Content you submit to the Platform. By submitting Content, you grant Shareplattr a worldwide, non-exclusive, royalty-free, sublicensable licence to use, reproduce, distribute, and display that Content for the purpose of operating and promoting the Platform.
                            </p>
                        </Section>

                        <Section title="9. General Prohibited Conduct">
                            <p>All Users must not:</p>
                            <List>
                                <li>Violate any applicable local, national, or international law or regulation.</li>
                                <li>Attempt to gain unauthorised access to the Platform or another User's account.</li>
                                <li>Introduce malware, viruses, or other harmful code.</li>
                                <li>Scrape, copy, or harvest Platform data without prior written consent from Shareplattr.</li>
                                <li>Use the Platform for any unlawful, fraudulent, or malicious purpose.</li>
                                <li>Post or transmit any Content that is defamatory, obscene, harassing, or discriminatory.</li>
                            </List>
                        </Section>

                        <Section title="10. Disclaimers">
                            <p>
                                The Platform is provided on an "as is" and "as available" basis. To the maximum extent permitted by applicable law, Shareplattr makes no warranties, express or implied, regarding the Platform, including warranties of merchantability, fitness for a particular purpose, or non-infringement.
                            </p>
                            <p>
                                Shareplattr does not warrant that the Platform will be uninterrupted, error-free, or free of viruses or other harmful components. Shareplattr is a marketplace facilitator only and is not party to any agreement between a Business and a Referrer.
                            </p>
                        </Section>

                        <Section title="11. Limitation of Liability">
                            <p>
                                To the maximum extent permitted by law, Shareplattr and its directors, employees, agents, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Platform, including loss of revenue, loss of data, or loss of goodwill.
                            </p>
                            <p>
                                Shareplattr's total aggregate liability to any User for any claim arising under these Terms shall not exceed the greater of (a) the total fees paid by that User to Shareplattr in the 12 months preceding the claim, or (b) AUD $100 / USD $100 / GBP 50.
                            </p>
                            <p>
                                Nothing in these Terms limits liability for fraud, death or personal injury caused by negligence, or any liability that cannot be excluded or limited under applicable law.
                            </p>
                        </Section>

                        <Section title="12. Indemnification">
                            <p>
                                You agree to indemnify, defend, and hold harmless Shareplattr and its affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable legal fees, arising out of or in any way connected with: (a) your use of the Platform; (b) your breach of these Terms; (c) your Content; or (d) your violation of any third-party rights.
                            </p>
                        </Section>

                        <Section title="13. Termination and Suspension">
                            <p>
                                Shareplattr may suspend or terminate your account and access to the Platform at any time, with or without notice, for any reason including breach of these Terms, fraudulent activity, or conduct harmful to other Users or the Platform.
                            </p>
                            <p>
                                You may close your account at any time by contacting Shareplattr at legal@shareplattr.com. Upon termination, your right to use the Platform ceases immediately. Clauses that by their nature should survive termination will continue to apply.
                            </p>
                        </Section>

                        <Section title="14. Governing Law and Dispute Resolution">
                            <p>
                                These Terms are governed by the laws of Victoria, Australia, without regard to conflict of law principles. For Users in the United States or United Kingdom, mandatory local consumer protection laws may also apply.
                            </p>
                            <p>
                                Any dispute arising in connection with these Terms shall first be submitted to good-faith mediation. If mediation fails, disputes shall be resolved by the courts of Victoria, Australia, subject to any mandatory local jurisdictional requirements applicable to consumer Users.
                            </p>
                        </Section>

                        <Section title="15. Changes to These Terms">
                            <p>
                                Shareplattr may update these Terms from time to time. Material changes will be notified to Users via email or prominent notice on the Platform at least 14 days before taking effect. Your continued use of the Platform after the effective date constitutes acceptance of the revised Terms.
                            </p>
                        </Section>

                        <Section title="16. Contact Us">
                            <p>If you have any questions about these Terms, please contact us:</p>
                            <p>
                                Shareplattr Pty Ltd<br />
                                Email: legal@shareplattr.com<br />
                                Website: www.shareplattr.com
                            </p>
                            <p>These Terms were last updated on 1 July 2025.</p>
                            <p>2025 Shareplattr Pty Ltd. All rights reserved.</p>
                        </Section>
                    </div>
                </article>
            </div>
        </main>
    );
}
