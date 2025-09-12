import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-80px)] flex flex-col">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -left-24 size-[400px] rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 size-[400px] rounded-full bg-secondary/30 blur-3xl" />
          </div>
          <div className="container mx-auto px-6 py-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 backdrop-blur px-3 py-1 text-sm text-muted-foreground">
              <span className="size-2 rounded-full bg-green-500" />
              Now with TRPC-powered AI chat
            </div>
            <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight">
              Career guidance powered by AI
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Get personalized advice on resumes, interviews, and growth. Start a chat and let the assistant help you plan your next move.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/chat">Open Chat</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/greeting">Try Greetings</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 pb-20 grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Image src="/globe.svg" width={20} height={20} alt="Globe" />
              </div>
              <h3 className="font-semibold text-lg">Smart Sessions</h3>
              <p className="text-muted-foreground mt-1">Organize conversations by topic and pick up where you left off.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Image src="/window.svg" width={20} height={20} alt="Window" />
              </div>
              <h3 className="font-semibold text-lg">Clean UI</h3>
              <p className="text-muted-foreground mt-1">Built with shadcn components and modern design tokens.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Image src="/file.svg" width={20} height={20} alt="File" />
              </div>
              <h3 className="font-semibold text-lg">Actionable Advice</h3>
              <p className="text-muted-foreground mt-1">Receive concise, structured recommendations tailored to your goals.</p>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}