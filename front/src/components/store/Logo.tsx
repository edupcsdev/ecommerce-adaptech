import { Link } from "@tanstack/react-router";
import { Cpu } from "lucide-react";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
        <Cpu className="h-5 w-5" />
      </span>
      <span>Adap<span className="text-gradient">Tech</span></span>
    </Link>
  );
}
