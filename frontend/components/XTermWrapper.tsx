"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

export default function XTermWrapper() {
  const terminalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal();
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    term.writeln("Welcome to AetherHost Terminal");
  }, []);

  return <div ref={terminalRef} style={{ height: "300px", width: "100%" }} />;
}
