import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'Certificate Generator — Ghaith Al Emarat',
  description: 'Generate personalized Proud of UAE certificates',
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
