import { Link } from "wouter";
import { ArrowRight, BarChart3, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="text-xl font-bold text-slate-900 font-display">GrowGuide</span>
          </div>
          <Link href="/setup">
            <button className="px-5 py-2.5 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors text-sm">
              Sign In
            </button>
          </Link>
        </header>

        <main className="mt-16 sm:mt-24">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-primary font-semibold text-sm mb-6 border border-blue-100">
                Resource-Aware Growth Engine
              </div>
              <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight font-display mb-8">
                Grow your business with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">precision.</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-500 mb-10 leading-relaxed">
                Stop guessing. GrowGuide analyzes your budget, time, and goals to provide a tailored growth strategy, vendor matches, and content guidance—no black-box AI magic, just logic.
              </p>
              
              <Link href="/setup">
                <button className="px-8 py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center mx-auto gap-2">
                  Get Started for Free
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { 
                icon: BarChart3, 
                title: "Smart Strategy", 
                desc: "Get a customized growth plan based on your actual resource constraints." 
              },
              { 
                icon: Users, 
                title: "Vendor Matching", 
                desc: "Connect with complementary businesses for high-impact collaborations." 
              },
              { 
                icon: Zap, 
                title: "Actionable Content", 
                desc: "Generate platform-specific content ideas tailored to your audience." 
              }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </motion.div>

          <div className="mt-32 mb-20 relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/60 z-10"></div>
            {/* Unsplash image for business growth/team */}
            {/* Business team collaborating in modern office */}
            <img 
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=2000" 
              alt="Team collaboration" 
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to scale smarter?</h2>
              <Link href="/setup">
                <button className="px-8 py-3 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-100 transition-colors">
                  Build Your Profile
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
