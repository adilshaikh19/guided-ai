import "./globals.css";
import { TRPCProvider } from "./_trpc/Provider";

export const metadata = {
  title: "Guided.AI",
  description: "tRPC and Next.js Auth",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
