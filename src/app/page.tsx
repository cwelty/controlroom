import Link from "next/link";
import { Activity, Shield, Zap, Database } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary to-background-secondary flex items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-6xl font-bold font-orbitron mb-4 neon-glow">TaskFeed</h1>
          <p className="text-xl text-neon-cyan/80 font-exo mb-6">
            Synthwave Task Management & Activity Feed System
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-neon-cyan to-neon-blue mx-auto rounded-full neon-glow"></div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="bg-background-secondary/50 backdrop-blur-sm border border-neon-cyan/20 rounded-lg p-6 neon-glow-hover">
            <div className="text-neon-cyan mb-4">
              <Shield size={48} className="mx-auto neon-glow" />
            </div>
            <h3 className="text-xl font-semibold font-exo mb-2">Admin Control Room</h3>
            <p className="text-neon-cyan/70 text-sm mb-4">
              Secure administrative interface for task creation with template hotkeys, 
              quick-add functionality, and real-time management.
            </p>
            <div className="text-xs text-neon-cyan/50">
              Protected by admin secret • No caching for real-time updates
            </div>
          </div>

          <div className="bg-background-secondary/50 backdrop-blur-sm border border-neon-cyan/20 rounded-lg p-6 neon-glow-hover">
            <div className="text-neon-blue mb-4">
              <Activity size={48} className="mx-auto neon-glow" />
            </div>
            <h3 className="text-xl font-semibold font-exo mb-2">Public Activity Feed</h3>
            <p className="text-neon-cyan/70 text-sm mb-4">
              Read-only timeline view with chronological grouping, 
              collapsible sections, and month-by-month pagination.
            </p>
            <div className="text-xs text-neon-cyan/50">
              ISR cached • LA timezone • Public tasks only
            </div>
          </div>

          <div className="bg-background-secondary/50 backdrop-blur-sm border border-neon-purple/20 rounded-lg p-6 neon-glow-hover">
            <div className="text-neon-purple mb-4">
              <Zap size={48} className="mx-auto neon-glow" />
            </div>
            <h3 className="text-xl font-semibold font-exo mb-2">Template System</h3>
            <p className="text-neon-cyan/70 text-sm mb-4">
              Customizable task templates with hotkey shortcuts, 
              drag-and-drop reordering, and tag management.
            </p>
            <div className="text-xs text-neon-cyan/50">
              Keyboard shortcuts • CRUD operations • Sort management
            </div>
          </div>

          <div className="bg-background-secondary/50 backdrop-blur-sm border border-neon-magenta/20 rounded-lg p-6 neon-glow-hover">
            <div className="text-neon-magenta mb-4">
              <Database size={48} className="mx-auto neon-glow" />
            </div>
            <h3 className="text-xl font-semibold font-exo mb-2">Vercel Postgres</h3>
            <p className="text-neon-cyan/70 text-sm mb-4">
              Scalable database with UTC storage, public/private visibility, 
              and optimized indexing for performance.
            </p>
            <div className="text-xs text-neon-cyan/50">
              Cloud database • Automatic scaling • Production ready
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/log"
              className="btn-neon px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105"
            >
              <Activity size={20} className="inline mr-2" />
              View Activity Feed
            </Link>
            
            <Link
              href="/admin"
              className="btn-neon px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105"
            >
              <Shield size={20} className="inline mr-2" />
              Access Control Room
            </Link>
          </div>

          <div className="text-sm text-neon-cyan/60">
            <p>Admin access requires authentication • Public feed is open to all</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-neon-cyan/40 space-y-2">
          <p>Built with Next.js App Router • Deployed on Vercel • Powered by Postgres</p>
          <p>Tron Legacy / Synthwave inspired design • Production ready architecture</p>
        </div>
      </div>
    </div>
  );
}
