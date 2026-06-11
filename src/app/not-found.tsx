import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <p className="text-muted-foreground font-mono text-5xl font-bold">404</p>
        <h1 className="text-2xl font-bold">Página não encontrada</h1>
        <p className="text-muted-foreground text-sm">
          A página que você procura não existe ou foi movida.
        </p>
      </div>
      <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
        Voltar ao início
      </Link>
    </div>
  );
}
