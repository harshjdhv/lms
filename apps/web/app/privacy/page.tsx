import Link from "next/link";

export const metadata = {
    title: "Privacy Policy — ConnectX",
    description: "Read the ConnectX Privacy Policy.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
            {/* Nav */}
            <header className="border-b border-zinc-100 dark:border-zinc-900 px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
                <Link href="/" className="font-black text-lg tracking-tight">ConnectX</Link>
                <Link href="/auth" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    Back to sign in
                </Link>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-16">
                {/* Header */}
                <div className="mb-12 text-center">
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Legal</p>
                    <h1 className="text-4xl font-black tracking-tight mb-4">Privacy Policy</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Effective date: <time dateTime="2025-01-01">January 1, 2025</time>
                    </p>
                </div>

                <div className="space-y-10 text-[15px] leading-relaxed">

                    <section>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            ConnectX Inc. ("ConnectX", "we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                        </p>
                    </section>

                    <Section title="1. Information We Collect">
                        <p><strong className="text-zinc-800 dark:text-zinc-200">Information you provide directly:</strong></p>
                        <ul>
                            <li><strong className="text-zinc-800 dark:text-zinc-200">Account data</strong> — your name, email address, and password when you register.</li>
                            <li><strong className="text-zinc-800 dark:text-zinc-200">Profile data</strong> — your role (Student or Teacher), institution, and any additional information you add during onboarding.</li>
                            <li><strong className="text-zinc-800 dark:text-zinc-200">Content</strong> — courses, assignments, submissions, announcements, and messages you create or send on the platform.</li>
                        </ul>
                        <p><strong className="text-zinc-800 dark:text-zinc-200">Information collected automatically:</strong></p>
                        <ul>
                            <li><strong className="text-zinc-800 dark:text-zinc-200">Usage data</strong> — pages visited, features used, and interactions with the platform.</li>
                            <li><strong className="text-zinc-800 dark:text-zinc-200">Device data</strong> — browser type, operating system, IP address, and referring URLs.</li>
                            <li><strong className="text-zinc-800 dark:text-zinc-200">Cookies and local storage</strong> — we use these to maintain your session and remember your preferences.</li>
                        </ul>
                    </Section>

                    <Section title="2. How We Use Your Information">
                        <p>We use the information we collect to:</p>
                        <ul>
                            <li>Create and manage your account and authenticate you securely.</li>
                            <li>Provide, operate, and improve the ConnectX platform and its features.</li>
                            <li>Personalize your experience and surface relevant courses and content.</li>
                            <li>Send transactional emails such as email verification, password resets, and important service notices.</li>
                            <li>Monitor platform usage to maintain security, prevent abuse, and debug issues.</li>
                            <li>Comply with legal obligations.</li>
                        </ul>
                        <p>
                            We do not sell your personal data to third parties, and we do not use your data for advertising purposes.
                        </p>
                    </Section>

                    <Section title="3. AI Features and Your Data">
                        <p>
                            ConnectX uses AI-powered features (such as AI pair programming assistance) to enhance the learning experience. When you interact with AI features:
                        </p>
                        <ul>
                            <li>Your inputs may be sent to a third-party AI provider (such as Anthropic) to generate responses.</li>
                            <li>We do not use your content to train AI models without your explicit consent.</li>
                            <li>AI providers we work with are bound by data processing agreements that restrict their use of your data.</li>
                        </ul>
                    </Section>

                    <Section title="4. Sharing Your Information">
                        <p>We may share your information with:</p>
                        <ul>
                            <li><strong className="text-zinc-800 dark:text-zinc-200">Service providers</strong> — trusted vendors who help us operate our platform (e.g., hosting, authentication, email delivery). They are only permitted to use your data to provide services to us.</li>
                            <li><strong className="text-zinc-800 dark:text-zinc-200">Institutions</strong> — if you access ConnectX through an educational institution, certain data (such as grades and assignment completions) may be visible to authorized instructors or administrators within that institution.</li>
                            <li><strong className="text-zinc-800 dark:text-zinc-200">Legal requirements</strong> — we may disclose your information if required to do so by law or in response to valid legal process.</li>
                        </ul>
                    </Section>

                    <Section title="5. Data Retention">
                        <p>
                            We retain your personal data for as long as your account is active or as needed to provide you with our services. If you delete your account, we will delete or anonymize your personal data within 30 days, except where we are required to retain it for legal or compliance reasons.
                        </p>
                    </Section>

                    <Section title="6. Security">
                        <p>
                            We take the security of your data seriously. We use industry-standard practices including encrypted connections (HTTPS), hashed passwords, and role-based access controls to protect your information. However, no system is completely secure, and we cannot guarantee absolute security.
                        </p>
                        <p>
                            If you believe your account has been compromised, please contact us immediately at{" "}
                            <a href="mailto:marrowxhq@gmail.com" className="underline underline-offset-4 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                                marrowxhq@gmail.com
                            </a>
                            .
                        </p>
                    </Section>

                    <Section title="7. Your Rights">
                        <p>Depending on your location, you may have the right to:</p>
                        <ul>
                            <li><strong className="text-zinc-800 dark:text-zinc-200">Access</strong> the personal data we hold about you.</li>
                            <li><strong className="text-zinc-800 dark:text-zinc-200">Correct</strong> inaccurate or incomplete data.</li>
                            <li><strong className="text-zinc-800 dark:text-zinc-200">Delete</strong> your personal data (subject to certain legal obligations).</li>
                            <li><strong className="text-zinc-800 dark:text-zinc-200">Export</strong> your data in a machine-readable format.</li>
                            <li><strong className="text-zinc-800 dark:text-zinc-200">Object</strong> to certain processing activities.</li>
                        </ul>
                        <p>
                            To exercise any of these rights, contact us at{" "}
                            <a href="mailto:marrowxhq@gmail.com" className="underline underline-offset-4 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                                marrowxhq@gmail.com
                            </a>
                            .
                        </p>
                    </Section>

                    <Section title="8. Cookies">
                        <p>
                            ConnectX uses cookies and similar tracking technologies to maintain your authenticated session and store your preferences. You can configure your browser to refuse cookies, but doing so may prevent some parts of the platform from functioning correctly.
                        </p>
                    </Section>

                    <Section title="9. Children's Privacy">
                        <p>
                            ConnectX is not directed to children under the age of 13. We do not knowingly collect personal data from children under 13. If we learn that we have collected such data, we will delete it promptly. If you believe we may have data from a child under 13, please contact us at{" "}
                            <a href="mailto:marrowxhq@gmail.com" className="underline underline-offset-4 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                                marrowxhq@gmail.com
                            </a>
                            .
                        </p>
                    </Section>

                    <Section title="10. Changes to This Policy">
                        <p>
                            We may update this Privacy Policy from time to time. When we do, we will revise the effective date at the top of this page and, where appropriate, notify you by email. Your continued use of ConnectX after any update constitutes your acceptance of the revised policy.
                        </p>
                    </Section>

                    <Section title="11. Contact Us">
                        <p>
                            If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your data, please reach out:
                        </p>
                        <ul>
                            <li>Email: <a href="mailto:marrowxhq@gmail.com" className="underline underline-offset-4 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">marrowxhq@gmail.com</a></li>
                            <li>ConnectX Inc., Engineering Education Platform</li>
                        </ul>
                    </Section>
                </div>

                {/* Footer nav */}
                <div className="mt-16 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-sm text-zinc-400">
                    <span>© {new Date().getFullYear()} ConnectX Inc.</span>
                    <div className="flex items-center gap-6">
                        <Link href="/terms" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">Terms of Service</Link>
                        <Link href="/auth" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">Sign in</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-3">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h2>
            <div className="text-zinc-600 dark:text-zinc-400 space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
                {children}
            </div>
        </section>
    );
}
