import {
  LayoutDashboard,
  BookOpen,
  RotateCcw,
  Layers,
  HelpCircle,
  FileText,
  Settings,
  type LucideIcon,
  Calendar,
  Users,
  Globe,
  Terminal,
  GitBranch,
  BarChart2,
  FileBarChart,
} from "lucide-react";

export type NavItem = {
  id: string;
  key?: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  group: string;
  items: NavItem[];
};
export const NAV_GROUPS: NavGroup[] = [
  {
    group: "Visão geral",
    items: [
      {
        id: "dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/dashboard",
      },
      {
        id: "plan",
        icon: Calendar,
        label: "Plano",
        href: "/plano",
      },
    ],
  },
  {
    group: "Prática",
    items: [
      {
        id: "reviews",
        icon: RotateCcw,
        label: "Revisões",
        href: "/revisoes",
      },
      {
        id: "quizzes",
        icon: HelpCircle,
        label: "Quizzes",
        href: "/quizzes",
      },
      {
        id: "mocks",
        icon: Users,
        label: "Mocks",
        href: "/mocks",
      },
      {
        id: "flashcards",
        icon: Layers,
        label: "Flashcards",
        href: "/flashcards",
      },
      {
        id: "english",
        icon: Globe,
        label: "Inglês técnico",
        href: "/english",
      },
      {
        id: "playground",
        icon: Terminal,
        label: "Playground",
        href: "/playground",
      },
    ],
  },
  {
    group: "Conteúdo",
    items: [
      {
        id: "skill-tree",
        icon: GitBranch,
        label: "Skill Tree",
        href: "/skill-tree",
      },
      {
        id: "notes",
        icon: FileText,
        label: "Notas",
        href: "/notas",
      },
      {
        id: "resources",
        icon: BookOpen,
        label: "Recursos",
        href: "/recursos",
      },
    ],
  },
  {
    group: "Desempenho",
    items: [
      {
        id: "statistics",
        icon: BarChart2,
        label: "Estatísticas",
        href: "/estatisticas",
      },
      {
        id: "reports",
        icon: FileBarChart,
        label: "Relatórios",
        href: "/relatorios",
      },
    ],
  },
  {
    group: "Sistema",
    items: [
      {
        id: "settings",
        icon: Settings,
        label: "Configurações",
        href: "/configuracoes",
      },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) =>
  group.items.map((item) => ({ ...item, key: item.id })),
);
