"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Database,
  Brain,
  Shield,
  BarChart3,
  Layers,
  Rocket,
  Cloud,
  HelpCircle,
  Play,
  FileText,
  Calculator,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Popular");

  const services = [
    { category: "Popular", title: "Aether Compute", icon: Cpu, desc: "Deploy and manage live Docker containers with ease." },
    { category: "Popular", title: "Aether Storage", icon: Database, desc: "S3-compatible object storage for backups and data." },
    { category: "AI", title: "Aether Intelligence", icon: Brain, desc: "AI inference tools powered by OpenAI and Hugging Face." },
    { category: "Compute", title: "Aether Containers", icon: Layers, desc: "Run isolated workloads in seconds with Docker support." },
    { category: "Identity", title: "Aether Identity", icon: Shield, desc: "Unified identity and access management for your apps." },
    { category: "Monitoring", title: "Aether Control", icon: BarChart3, desc: "Monitor and visualize app performance in real-time." },
  ];

  const filteredServices = activeTab === "Popular" ? services : services.filter(s => s.category === activeTab);

  const faqs = [
    { q: "What is AetherHost Cloud?", a: "AetherHost is a developer-focused cloud platform for compute, storage, AI, and monitoring — all under one unified interface." },
    { q: "Is there a free plan?", a: "Yes! You can start for free with limited resources to explore our services." },
    { q: "How do I deploy my first container?", a: "Simply sign up, head to the dashboard, and use Aether Compute to launch your first Docker image instantly." },
    { q: "What payment options are supported?", a: "We support major credit/debit cards and pay-as-you-go billing for flexibility." },
  ];

  return (
    <div className="bg-gradient-to-b from-sky-50 via-white to-indigo-50 text-gray-800 min-h-screen">
      {/* Hero Section */}
      <section className="text-center py-28 px-6 bg-gradient-to-r from-sky-100 to-indigo-100">
        <h2 className="text-5xl font-extrabold text-sky-700 mb-6">
          Build. Scale. Connect. With AetherHost.
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
          Launch containers, store data, run AI models, and manage identity — all from one modern cloud built for developers, startups, and innovators.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => router.push("/signup")}
            className="bg-sky-600 hover:bg-sky-700 px-6 py-3 rounded-lg text-white font-semibold shadow-md transition"
          >
            Try for Free
          </button>
          <button
            onClick={() => {
              const section = document.getElementById("services");
              section?.scrollIntoView({ behavior: "smooth" });
            }}
            className="border border-sky-600 text-sky-700 hover:bg-sky-100 px-6 py-3 rounded-lg font-semibold transition"
          >
            Explore Services
          </button>
        </div>
      </section>

      {/* Free Services */}
      <section id="services" className="py-20 px-6 bg-gradient-to-b from-white to-sky-50">
        <h3 className="text-3xl font-bold text-center text-sky-700 mb-8">
          Take advantage of free products
        </h3>
        <p className="text-center text-gray-600 mb-10">
          These core services are always free or available for new users.
        </p>

        <div className="flex justify-center flex-wrap gap-3 mb-10">
          {["Popular", "AI", "Compute", "Identity", "Monitoring"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-sky-600 text-white"
                  : "bg-sky-100 text-sky-700 hover:bg-sky-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {filteredServices.map((srv, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-sky-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all p-8"
            >
              <srv.icon className="w-10 h-10 text-sky-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2 text-sky-700 text-center">
                {srv.title}
              </h4>
              <p className="text-gray-600 text-center text-sm mb-4">
                {srv.desc}
              </p>
              <div className="text-center">
                <button className="text-sky-600 hover:text-sky-800 text-sm font-medium">
                  Explore product →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Learn More */}
      <section className="py-20 px-6 bg-gradient-to-b from-indigo-50 to-sky-100">
        <h3 className="text-3xl font-bold text-center text-sky-700 mb-12">
          Learn more about AetherHost
        </h3>
        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            { icon: FileText, title: "Documentation", desc: "Learn how to deploy and scale on AetherHost.", action: "Read more" },
            { icon: Calculator, title: "Pricing Calculator", desc: "Estimate your monthly usage and costs easily.", action: "Get an estimate" },
            { icon: Play, title: "Getting Started Guide", desc: "Watch how to launch your first container.", action: "Watch now" },
            { icon: HelpCircle, title: "Support & Community", desc: "Join our developer community and get support.", action: "Join now" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white border border-sky-100 hover:border-sky-300 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all"
            >
              <item.icon className="w-10 h-10 text-sky-600 mb-3" />
              <h4 className="font-semibold text-lg mb-1">{item.title}</h4>
              <p className="text-gray-600 text-sm mb-3">{item.desc}</p>
              <button className="text-sky-600 hover:text-sky-800 text-sm font-medium">
                {item.action} →
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-20 px-6 bg-gradient-to-r from-sky-100 to-green-100">
        <h3 className="text-3xl font-bold text-center text-sky-700 mb-10">
          Take the next step
        </h3>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow hover:shadow-xl border border-sky-100">
            <h4 className="text-xl font-semibold text-sky-700 mb-2">Start building on Aether Free</h4>
            <p className="text-gray-600 text-sm mb-4">
              Get free credits and explore AetherHost Cloud for 30 days.
            </p>
            <button
              onClick={() => router.push("/signup")}
              className="bg-sky-600 text-white px-5 py-2 rounded-md font-medium hover:bg-sky-700 transition"
            >
              Try for Free
            </button>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow hover:shadow-xl border border-sky-100">
            <h4 className="text-xl font-semibold text-sky-700 mb-2">Get started with pay-as-you-go</h4>
            <p className="text-gray-600 text-sm mb-4">
              Pay only for what you use beyond free resource limits.
            </p>
            <button
              onClick={() => router.push("/pricing")}
              className="bg-sky-600 text-white px-5 py-2 rounded-md font-medium hover:bg-sky-700 transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-green-50 to-sky-50">
        <h3 className="text-3xl font-bold text-center text-sky-700 mb-10">
          Frequently Asked Questions
        </h3>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((f, i) => (
            <details key={i} className="bg-white border border-sky-100 rounded-lg p-4 shadow-sm hover:shadow-md transition">
              <summary className="font-semibold text-sky-700 cursor-pointer">
                {String(i + 1).padStart(2, "0")}. {f.q}
              </summary>
              <p className="text-gray-600 mt-2 text-sm">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-sky-700 to-indigo-700 py-8 text-center text-white shadow-inner">
        <p className="text-sm opacity-90">
          © {new Date().getFullYear()} AetherHost Cloud. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
