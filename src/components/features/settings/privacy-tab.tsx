import { Shield, HardDrive, Wifi, FileX, Database } from "lucide-react";

const PRIVACY_POINTS = [
  {
    icon: <HardDrive className="size-4" />,
    title: "Dados ficam no seu dispositivo",
    description:
      "Todo o progresso, notas, flashcards e histórico são armazenados exclusivamente no seu navegador via IndexedDB.",
  },
  {
    icon: <Wifi className="size-4" />,
    title: "Sem backend ou servidor",
    description:
      "O aplicativo não possui servidor próprio. Não há login, não há conta, não há nuvem.",
  },
  {
    icon: <Shield className="size-4" />,
    title: "Nenhum dado é transmitido",
    description: "Nenhuma informação é enviada a terceiros, rastreadores ou serviços externos.",
  },
  {
    icon: <FileX className="size-4" />,
    title: "Áudio fica local",
    description:
      "Gravações de mock são armazenadas localmente e não são incluídas nos backups de texto.",
  },
  {
    icon: <Database className="size-4" />,
    title: "Limpar cache pode apagar dados",
    description:
      "Limpar dados do navegador ou desinstalar o app apaga permanentemente seus dados. Exporte backups regularmente.",
  },
];

export function PrivacyTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-1">Privacidade local</h3>
        <p className="text-xs text-muted-foreground">
          O Uber Prep é um app local-first. Veja abaixo como seus dados são tratados.
        </p>
      </div>

      <div className="space-y-3">
        {PRIVACY_POINTS.map(({ icon, title, description }) => (
          <div key={title} className="flex gap-3 p-3 rounded-lg border bg-background">
            <div className="shrink-0 mt-0.5 text-primary">{icon}</div>
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-lg bg-muted/50 text-sm space-y-2">
        <p className="font-medium">Recomendação</p>
        <p className="text-muted-foreground text-xs">
          Exporte um backup completo com frequência. Use a aba{" "}
          <span className="font-medium text-foreground">Dados e Backup</span> para baixar um arquivo
          JSON com todo o seu progresso.
        </p>
      </div>
    </div>
  );
}
