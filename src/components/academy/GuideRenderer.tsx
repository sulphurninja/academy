"use client";

import Link from "next/link";
import {
  Lightbulb,
  AlertTriangle,
  Info,
  CheckCircle2,
  Zap,
  ArrowRight,
  Copy,
  ExternalLink,
  Star,
  Target,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Renders rich lesson content from a custom markup format.
 *
 * Supported blocks (delimited by lines starting with :::):
 *   :::tip        → green tip callout
 *   :::warning    → amber warning callout
 *   :::info       → blue info callout
 *   :::pro-tip    → gradient pro-tip card
 *   :::steps      → numbered step list (each line starting with - is a step)
 *   :::checklist  → interactive-looking checklist
 *   :::highlight  → highlighted quote/stat card
 *   :::cta url text → call-to-action button
 *
 * Regular content is rendered as paragraphs with rich inline formatting:
 *   **bold**, *italic*, `code`, [text](url)
 *
 * Lines starting with # ## ### are headings.
 * Lines starting with - are bullet points.
 * Lines starting with > are blockquotes.
 * Empty lines separate paragraphs.
 */

const CALLOUT_CONFIG = {
  tip: {
    icon: Lightbulb,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    iconColor: "text-emerald-600",
    titleColor: "text-emerald-800",
    title: "Pro Tip",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconColor: "text-amber-600",
    titleColor: "text-amber-800",
    title: "Watch Out",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconColor: "text-blue-600",
    titleColor: "text-blue-800",
    title: "Good to Know",
  },
  "pro-tip": {
    icon: Zap,
    bg: "bg-gradient-to-br from-violet-50 to-fuchsia-50",
    border: "border-violet-200",
    iconColor: "text-violet-600",
    titleColor: "text-violet-800",
    title: "Power Move",
  },
  success: {
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    iconColor: "text-emerald-600",
    titleColor: "text-emerald-800",
    title: "Success",
  },
};

function parseInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      nodes.push(<strong key={key++} className="font-bold text-slate-900">{match[2]}</strong>);
    } else if (match[3]) {
      nodes.push(<em key={key++} className="italic">{match[4]}</em>);
    } else if (match[5]) {
      nodes.push(
        <code key={key++} className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[13px] font-mono text-emerald-700">
          {match[6]}
        </code>
      );
    } else if (match[7]) {
      const isExternal = match[9]?.startsWith("http");
      nodes.push(
        isExternal ? (
          <a
            key={key++}
            href={match[9]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-700 font-semibold underline underline-offset-2 decoration-emerald-300 hover:decoration-emerald-500 transition-colors"
          >
            {match[8]}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <Link key={key++} href={match[9]} className="text-emerald-700 font-semibold underline underline-offset-2 decoration-emerald-300 hover:decoration-emerald-500 transition-colors">
            {match[8]}
          </Link>
        )
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function Callout({ type, children }: { type: keyof typeof CALLOUT_CONFIG; children: string }) {
  const config = CALLOUT_CONFIG[type];
  const Icon = config.icon;
  return (
    <div className={cn("rounded-2xl border p-5 my-5", config.bg, config.border)}>
      <div className="flex items-center gap-2.5 mb-2">
        <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 shadow-sm", config.iconColor)}>
          <Icon className="h-4 w-4" />
        </span>
        <span className={cn("text-xs font-extrabold uppercase tracking-widest", config.titleColor)}>
          {config.title}
        </span>
      </div>
      <div className="text-sm text-slate-700 leading-relaxed">
        {children.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-2" : ""}>{parseInline(line.trim())}</p>
        ))}
      </div>
    </div>
  );
}

function Steps({ children }: { children: string }) {
  const steps = children
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2));

  return (
    <div className="my-6 space-y-3">
      {steps.map((step, i) => {
        const [title, ...desc] = step.split(" — ");
        return (
          <div key={i} className="flex gap-4 group">
            <div className="flex flex-col items-center">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 text-sm font-black ring-2 ring-emerald-200 group-hover:bg-emerald-200 transition-colors">
                {i + 1}
              </span>
              {i < steps.length - 1 && <div className="w-0.5 flex-1 bg-emerald-100 mt-1" />}
            </div>
            <div className="pb-4">
              <div className="text-sm font-bold text-slate-900">{parseInline(title)}</div>
              {desc.length > 0 && (
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{parseInline(desc.join(" — "))}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Checklist({ children }: { children: string }) {
  const items = children
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2));

  return (
    <div className="my-5 rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-emerald-600" /> Checklist
        </span>
      </div>
      <div className="p-4 space-y-2.5">
        {items.map((item, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer group">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 border-slate-300 bg-white group-hover:border-emerald-400 transition-colors">
              <CheckCircle2 className="h-3 w-3 text-transparent group-hover:text-emerald-300 transition-colors" />
            </span>
            <span className="text-sm text-slate-700 leading-relaxed">{parseInline(item)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function Highlight({ children }: { children: string }) {
  return (
    <div className="my-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
      <div className="absolute top-3 right-3 opacity-10">
        <Star className="h-16 w-16" />
      </div>
      <div className="relative text-lg font-black leading-snug tracking-tight">
        {children.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-2" : ""}>{parseInline(line.trim())}</p>
        ))}
      </div>
    </div>
  );
}

function CtaButton({ url, text }: { url: string; text: string }) {
  const isExternal = url.startsWith("http");
  const Comp = isExternal ? "a" : Link;
  const extraProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <div className="my-5 flex justify-center">
      <Comp
        href={url}
        {...extraProps}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/30 transition-all"
      >
        {text}
        <ArrowRight className="h-4 w-4" />
      </Comp>
    </div>
  );
}

export default function GuideRenderer({ content }: { content: string }) {
  const blocks: React.ReactNode[] = [];
  const lines = content.split("\n");
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Block-level markers
    if (line.startsWith(":::")) {
      const blockType = line.slice(3).trim().split(" ");
      const type = blockType[0];

      if (type === "cta") {
        const url = blockType[1] || "#";
        const text = blockType.slice(2).join(" ") || "Learn more";
        blocks.push(<CtaButton key={key++} url={url} text={text} />);
        i++;
        continue;
      }

      // Collect block content until closing :::
      const blockLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith(":::")) {
        blockLines.push(lines[i]);
        i++;
      }
      i++; // skip closing :::
      const blockContent = blockLines.join("\n").trim();

      if (type in CALLOUT_CONFIG) {
        blocks.push(<Callout key={key++} type={type as keyof typeof CALLOUT_CONFIG}>{blockContent}</Callout>);
      } else if (type === "steps") {
        blocks.push(<Steps key={key++}>{blockContent}</Steps>);
      } else if (type === "checklist") {
        blocks.push(<Checklist key={key++}>{blockContent}</Checklist>);
      } else if (type === "highlight") {
        blocks.push(<Highlight key={key++}>{blockContent}</Highlight>);
      }
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={key++} className="text-lg font-black text-slate-900 mt-8 mb-3 flex items-center gap-2">
          <Flame className="h-4 w-4 text-emerald-600" />
          {parseInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={key++} className="text-xl font-black text-slate-900 mt-10 mb-4 pb-2 border-b border-slate-100">
          {parseInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push(
        <h1 key={key++} className="text-2xl sm:text-3xl font-black text-slate-900 mt-6 mb-4 tracking-tight">
          {parseInline(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [line.slice(2)];
      i++;
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      blocks.push(
        <blockquote key={key++} className="my-5 border-l-4 border-emerald-300 bg-emerald-50/50 rounded-r-xl pl-5 pr-4 py-4">
          <p className="text-sm text-slate-700 leading-relaxed italic font-medium">
            {parseInline(quoteLines.join(" "))}
          </p>
        </blockquote>
      );
      continue;
    }

    // Bullet list
    if (line.startsWith("- ")) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      blocks.push(
        <ul key={key++} className="my-4 space-y-2.5 pl-1">
          {listItems.map((item, j) => (
            <li key={j} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <span>{parseInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="my-4 space-y-2.5 pl-1">
          {listItems.map((item, j) => (
            <li key={j} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 text-[11px] font-black">
                {j + 1}
              </span>
              <span>{parseInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Horizontal rule
    if (line.trim() === "---") {
      blocks.push(<hr key={key++} className="my-8 border-slate-100" />);
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Regular paragraph
    blocks.push(
      <p key={key++} className="text-[15px] text-slate-700 leading-[1.8] my-3">
        {parseInline(line)}
      </p>
    );
    i++;
  }

  return <div className="guide-content">{blocks}</div>;
}
