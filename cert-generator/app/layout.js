export const metadata = {
  title: 'Certificate Generator — Ghaith Al Emarat',
  description: 'Generate personalized volunteering certificates for Ghaith Al Emarat Volunteering Team',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
