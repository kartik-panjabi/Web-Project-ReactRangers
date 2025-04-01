import "../styles/globals.css";
import ClientNavbar from "../components/ClientNavbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="flex min-h-screen flex-col">
                <ClientNavbar />
                <main className="flex-1">
                    {children}
                </main>
            </body>
        </html>
    );
}