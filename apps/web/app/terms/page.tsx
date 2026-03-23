import Link from "next/link";

export const metadata = {
    title: "Terms of Service — ConnectX",
    description: "Read the ConnectX Terms of Service.",
};

export default function TermsPage() {
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
                    <h1 className="text-4xl font-black tracking-tight mb-4">Terms of Service</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Effective date: <time dateTime="2025-01-01">January 1, 2025</time>
                    </p>
                </div>

                <div className="prose prose-zinc dark:prose-invert max-w-none space-y-10 text-[15px] leading-relaxed">

                    <section>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Welcome to ConnectX. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully before using our services.
                        </p>
                    </section>

                    <Section title="1. Acceptance of Terms">
                        <p>
                            By creating an account or accessing ConnectX in any way, you confirm that you are at least 13 years old and that you agree to these Terms. If you are using ConnectX on behalf of an institution or organization, you represent that you have the authority to bind that entity to these Terms.
                        </p>
                    </Section>

                    <Section title="2. Description of Service">
                        <p>
                            ConnectX is an engineering education platform that provides tools for AI-assisted pair programming, real-time collaboration, 3D visualizations, and course management. Features are available to registered users and may vary based on account type (Student, Teacher, or Administrator).
                        </p>
                    </Section>

                    <Section title="3. Account Registration">
                        <p>You are responsible for:</p>
                        <ul>
                            <li>Providing accurate and complete registration information.</li>
                            <li>Maintaining the confidentiality of your account credentials.</li>
                            <li>All activity that occurs under your account.</li>
                            <li>Notifying us immediately of any unauthorized use of your account.</li>
                        </ul>
                        <p>
                            ConnectX reserves the right to suspend or terminate accounts that violate these Terms or that contain inaccurate information.
                        </p>
                    </Section>

                    <Section title="4. Acceptable Use">
                        <p>You agree not to:</p>
                        <ul>
                            <li>Use the platform for any unlawful purpose or in violation of any applicable laws or regulations.</li>
                            <li>Upload, share, or distribute content that is harmful, offensive, abusive, or infringes on the rights of others.</li>
                            <li>Attempt to gain unauthorized access to any part of the platform, other accounts, or related systems.</li>
                            <li>Interfere with or disrupt the integrity or performance of the platform.</li>
                            <li>Use automated scripts, bots, or scrapers to access or collect data from ConnectX without prior written consent.</li>
                            <li>Reverse engineer, decompile, or otherwise attempt to derive the source code of ConnectX.</li>
                        </ul>
                    </Section>

                    <Section title="5. Intellectual Property">
                        <p>
                            All content, trademarks, logos, and software on ConnectX are the property of ConnectX Inc. or its licensors and are protected by applicable intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the platform for its intended educational purposes.
                        </p>
                        <p>
                            Content you create and upload to ConnectX (such as course materials, assignments, and submissions) remains your property. By uploading it, you grant ConnectX a non-exclusive, worldwide license to host and display that content as necessary to provide the service.
                        </p>
                    </Section>

                    <Section title="6. AI Features">
                        <p>
                            ConnectX uses AI-powered features (including AI pair programming assistance) to enhance the learning experience. These features are provided as-is and are intended as educational aids, not as authoritative or production-ready solutions. You are responsible for evaluating and verifying any AI-generated output.
                        </p>
                    </Section>

                    <Section title="7. Privacy">
                        <p>
                            Your use of ConnectX is also governed by our{" "}
                            <Link href="/privacy" className="underline underline-offset-4 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                                Privacy Policy
                            </Link>
                            , which is incorporated into these Terms by reference. Please review it to understand how we collect, use, and protect your information.
                        </p>
                    </Section>

                    <Section title="8. Termination">
                        <p>
                            You may stop using ConnectX at any time by deleting your account. ConnectX may suspend or terminate your access at any time, with or without cause, including if we believe you have violated these Terms. Upon termination, your right to use the platform ceases immediately.
                        </p>
                    </Section>

                    <Section title="9. Disclaimers">
                        <p>
                            ConnectX is provided "as is" without warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, error-free, or completely secure. Use of the platform is at your own risk.
                        </p>
                    </Section>

                    <Section title="10. Limitation of Liability">
                        <p>
                            To the fullest extent permitted by law, ConnectX Inc. and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the platform, even if advised of the possibility of such damages.
                        </p>
                    </Section>

                    <Section title="11. Changes to These Terms">
                        <p>
                            We may update these Terms from time to time. When we do, we will revise the effective date at the top of this page. Continued use of ConnectX after any changes constitutes your acceptance of the new Terms. We encourage you to review this page periodically.
                        </p>
                    </Section>

                    <Section title="12. Contact">
                        <p>
                            If you have any questions about these Terms, please contact us at{" "}
                            <a href="mailto:marrowxhq@gmail.com" className="underline underline-offset-4 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                                marrowxhq@gmail.com
                            </a>
                            .
                        </p>
                    </Section>
                </div>

                {/* Footer nav */}
                <div className="mt-16 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-sm text-zinc-400">
                    <span>© {new Date().getFullYear()} ConnectX Inc.</span>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">Privacy Policy</Link>
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
