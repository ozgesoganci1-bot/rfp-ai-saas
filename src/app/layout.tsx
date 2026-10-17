import './globals.css';

export const metadata = {
  title: 'RFP & Bid Response SaaS',
  description: 'AI-Powered Bid Response Generator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
