"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ServiceCard from "@/components/ServiceCard";
import { useRouter } from "next/navigation";
import "xterm/css/xterm.css";
import dynamic from "next/dynamic";

const XTermDynamic = dynamic(
  async () => {
    const { Terminal } = await import("xterm");
    const { FitAddon } = await import("xterm-addon-fit");
    return { Terminal, FitAddon };
  },
  { ssr: false }
);

type User = {
  id: number;
  email: string;
  username?: string | null;
  is_active: boolean;
};

type Container = {
  id: string;
  name: string;
  image: string;
  status: string;
  ports?: Record<string, { HostIp: string; HostPort: string }[]>;
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCompute, setShowCompute] = useState(false);
  const [image, setImage] = useState("");
  const [containers, setContainers] = useState<Container[]>([]);
  const [logs, setLogs] = useState<string>("");
  const [showLogs, setShowLogs] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [commandOutput, setCommandOutput] = useState<string>("");
  const [showCommandModal, setShowCommandModal] = useState(false);

  const term = useRef<any>(null);
  const fitAddon = useRef<any>(null);
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // ✅ Auth check
  useEffect(() => {
    console.log("🚀 API URL:", API);
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    axios
      .get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [API]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const fetchContainers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(`${API}/compute/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContainers(res.data);
    } catch (e) {
      console.error("Error fetching containers:", e);
    }
  };

  const handleCreateContainer = async () => {
    const token = localStorage.getItem("token");
    if (!token || !image) return;
    try {
      await axios.post(
        `${API}/compute/create?image=${encodeURIComponent(image)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setImage("");
      fetchContainers();
    } catch (e) {
      alert("⚠️ Failed to launch container. Check image name or backend logs.");
      console.error(e);
    }
  };

  const handleStopContainer = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.delete(`${API}/compute/stop/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchContainers();
    } catch (e) {
      alert("⚠️ Failed to stop container.");
      console.error(e);
    }
  };

  const handleViewLogs = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(`${API}/compute/logs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data.logs || "No logs available.");
      setSelectedContainer(id);
      setShowLogs(true);
    } catch (e) {
      setLogs("⚠️ Failed to fetch logs.");
      setShowLogs(true);
      console.error(e);
    }
  };

  // 🧠 Modern Terminal inside modal
  useEffect(() => {
    if (showCommandModal && selectedContainer) {
      (async () => {
        const { Terminal } = await import("xterm");
        const { FitAddon } = await import("xterm-addon-fit");

        if (!document.getElementById("terminal")) return;
        term.current = new Terminal({
          theme: { background: "#0d1117", foreground: "#00ff88" },
          cursorBlink: true,
          fontSize: 14,
          fontFamily: "Fira Code, monospace",
          allowTransparency: true,
        });
        fitAddon.current = new FitAddon();
        term.current.loadAddon(fitAddon.current);
        term.current.open(document.getElementById("terminal")!);
        fitAddon.current.fit();
        term.current.focus();

        // smooth scroll & styling
        const viewport = document.querySelector(".xterm-viewport") as HTMLElement;
        if (viewport) viewport.style.overflow = "hidden";

        let buffer = "";
        term.current.writeln(`Connected to container: ${selectedContainer}`);
        term.current.write("$ ");

        term.current.onData(async (data) => {
          const token = localStorage.getItem("token");
          if (!selectedContainer || !token) return;

          if (data === "\r") {
            const cmd = buffer.trim();
            buffer = "";
            term.current.write("\r\n");
            if (!cmd) {
              term.current.write("$ ");
              return;
            }

            try {
              const res = await axios.post(
                `${API}/compute/exec/${selectedContainer}`,
                { command: cmd },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              term.current.write((res.data.output || "No output") + "\r\n$ ");
            } catch {
              term.current.write("⚠️ Command failed\r\n$ ");
            }
          } else if (data === "\u007F") {
            if (buffer.length > 0) {
              buffer = buffer.slice(0, -1);
              term.current.write("\b \b");
            }
          } else {
            buffer += data;
            term.current.write(data);
          }
        });
      })();
    }
  }, [showCommandModal, selectedContainer]);

  useEffect(() => {
    if (showCompute) fetchContainers();
  }, [showCompute]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-300">
        Loading your dashboard…
      </div>
    );

  if (!user)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-300 mb-4">Please log in to view your dashboard.</p>
        <a
          href="/login"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Go to Login
        </a>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome, {user.username || user.email} 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage your cloud services from one place.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800 transition"
          >
            Logout
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <ServiceCard
            title="🌩 Aether Compute"
            description="Launch and manage live Docker containers."
            action={{
              label: "Open Console",
              onClick: () => setShowCompute(true),
            }}
          />
          <ServiceCard
            title="💾 Aether Storage"
            description="S3-compatible object storage powered by MinIO."
            action={{ label: "Open Storage Console", href: "http://localhost:9001" }}
          />
          <ServiceCard
            title="🧠 Aether Intelligence"
            description="Run AI inference via OpenAI/Hugging Face."
            action={{
              label: "Open (coming soon)",
              onClick: () => alert("AI UI coming soon."),
            }}
          />
          <ServiceCard
            title="🛡 Aether Identity"
            description="Manage users, API tokens, and access policies."
            action={{
              label: "Open (coming soon)",
              onClick: () => alert("Identity UI coming soon."),
            }}
          />
          <ServiceCard
            title="🗄 Aether DB"
            description="Provision databases (PostgreSQL, Mongo) for apps."
            action={{
              label: "Open (coming soon)",
              onClick: () => alert("DB UI coming soon."),
            }}
          />
          <ServiceCard
            title="📊 Aether Control"
            description="Metrics & monitoring with Grafana/Prometheus."
            action={{
              label: "Open (coming soon)",
              onClick: () => alert("Control/Monitoring UI coming soon."),
            }}
          />
        </div>

        {/* 🧠 Compute Modal */}
        {showCompute && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-[450px] shadow-2xl relative">
  {/* ✖️ Close button */}
  <button
    onClick={() => setShowCompute(false)}
    className="absolute top-3 right-4 text-gray-400 hover:text-white text-lg font-semibold transition"
    aria-label="Close Console"
  >
    ✕
  </button>
              <h2 className="text-xl font-semibold text-white mb-4">Launch Container</h2>

              <select
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full p-3 mb-4 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select image template…</option>
                <option value="python:3.11">🐍 Python 3.11</option>
                <option value="node:20">🟢 Node.js 20</option>
                <option value="nginx:latest">🌐 Nginx (web server)</option>
                <option value="ubuntu:22.04">💻 Ubuntu 22.04</option>
                <option value="alpine:latest">🧊 Alpine (lightweight)</option>
              </select>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCompute(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateContainer}
                  disabled={!image}
                  className={`px-4 py-2 rounded-lg text-white transition ${
                    image
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-600 cursor-not-allowed"
                  }`}
                >
                  Launch
                </button>
              </div>

              <hr className="my-4 border-gray-700" />

              <h3 className="text-lg text-white mb-2">Your Containers</h3>
              <div className="max-h-72 overflow-y-auto space-y-3">
                {containers.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white font-medium">{c.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          c.status === "running"
                            ? "bg-green-800 text-green-300"
                            : "bg-yellow-800 text-yellow-300"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{c.image}</p>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewLogs(c.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition"
                      >
                        Logs
                      </button>
                     {(c.image.includes("nginx") || c.image.includes("node")) && c.status === "running" && (
  <button
    key={`viewapp-${c.id}`}
    onClick={() => {
      try {
        const ports = c.ports || {};
        const firstPort = Object.values(ports)[0];
        const hostPort =
          Array.isArray(firstPort) && firstPort[0]?.HostPort
            ? firstPort[0].HostPort
            : "8081";

        window.open(`http://localhost:${hostPort}`, "_blank");
      } catch (err) {
        console.error("Error opening app:", err);
        alert("⚠️ Unable to open app — no port mapping found.");
      }
    }}
    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition"
  >
    🌐 View App
  </button>
)}



                      <button
                        onClick={() => {
                          setSelectedContainer(c.id);
                          setShowCommandModal(true);
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg transition"
                      >
                        Terminal
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Stop container ${c.name}?`)) {
                            handleStopContainer(c.id);
                          }
                        }}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition"
                      >
                        Stop
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 💻 Terminal Modal */}
        {showCommandModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-[90%] max-w-2xl shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4">
                Live Terminal — {selectedContainer}
              </h2>
              <div
                id="terminal"
                className="w-full h-64 rounded-xl bg-[#0d1117] text-[#00ff88] shadow-inner ring-1 ring-gray-800 overflow-hidden outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
              />
              {commandOutput && (
                <pre className="bg-black text-gray-300 mt-4 p-3 rounded-md text-sm overflow-x-auto max-h-60">
                  {commandOutput}
                </pre>
              )}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowCommandModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🪶 Logs Modal */}
        {showLogs && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-[90%] max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4">
                Logs — {selectedContainer}
              </h2>
              <pre className="bg-black text-gray-300 p-3 rounded-md text-sm overflow-x-auto">
                {logs}
              </pre>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowLogs(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
