'use client';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-blue-600">
          <GraduationCap size={32} />
          <span className="text-xl font-bold tracking-tight text-slate-800">ASTU Smart</span>
        </div>
        <Link 
          href="/login" 
          className="bg-slate-900 text-white px-6 py-2 rounded-full font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200"
        >
          Login
        </Link>
      </nav>

      {/* Hero Section */}
      <header className="px-8 py-20 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight">
          University Support, <br />
          <span className="text-blue-600">Powered by AI.</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          The official ASTU smart ticketing system. Resolve your complaints, 
          chat with our AI assistant for instant help, and track your requests in real-time.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link 
            href="/login" 
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition"
          >
            Get Started <ArrowRight size={20} />
          </Link>
        </div>
      </header>

      {/* Features Grid */}
      <section className="px-8 py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Instant AI Answers</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Powered by Gemini 2.5 Flash. Get immediate answers regarding registration, 
              campus life, and academic policies 24/7.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="bg-green-100 text-green-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Smart Ticketing</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Submit complaints directly to the relevant department and track progress 
              from your personalized student dashboard.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
              <GraduationCap size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Staff & Admin Hub</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              A streamlined interface for university staff to manage requests, 
              provide remarks, and resolve issues efficiently.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-slate-400 text-sm">
        <p>© 2026 Addis Ababa Science and Technology University. All rights reserved.</p>
      </footer>
    </div>
  );
}