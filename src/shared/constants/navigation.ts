import {
  LayoutDashboard,
  BookOpen,
  RotateCcw,
  Layers,
  HelpCircle,
  Mic,
  Code2,
  FileText,
  Library,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  delivery: number;
};

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, delivery: 6 },
  { key: "plano", label: "Plano", href: "/plano", icon: BookOpen, delivery: 5 },
  { key: "revisar", label: "Revisar Hoje", href: "/revisar", icon: RotateCcw, delivery: 7 },
  { key: "flashcards", label: "Flashcards", href: "/flashcards", icon: Layers, delivery: 8 },
  { key: "quizzes", label: "Quizzes", href: "/quizzes", icon: HelpCircle, delivery: 9 },
  { key: "mocks", label: "Mocks", href: "/mocks", icon: Mic, delivery: 11 },
  { key: "playground", label: "Playground", href: "/playground", icon: Code2, delivery: 12 },
  { key: "notas", label: "Notas", href: "/notas", icon: FileText, delivery: 13 },
  { key: "recursos", label: "Recursos", href: "/recursos", icon: Library, delivery: 13 },
  { key: "relatorios", label: "Relatórios", href: "/relatorios", icon: BarChart3, delivery: 15 },
  {
    key: "configuracoes",
    label: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    delivery: 16,
  },
];
