import { useEffect, useState } from "react";
import { useVendorDashboard } from "@/hooks/use-vendors";
import { useGenerateContent } from "@/hooks/use-ai";
import { ScoreChart } from "@/components/ScoreChart";
import { Loader2, CheckCircle2, XCircle, Lightbulb, Share2, Wand2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [vendorId, setVendorId] = useState<number | null>(null);
  
  useEffect(() => {
    const id = localStorage.getItem("growguide_vendor_id");
    if (id) setVendorId(Number(id));
  }, []);

  const { data, isLoading } = useVendorDashboard(vendorId);
  const generateContent = useGenerateContent();
  const { toast } = useToast();

  const [topic, setTopic] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("Instagram");
  const [contentResult, setContentResult] = useState<{ caption: string, hashtags: string[] } | null>(null);

  const handleGenerate = () => {
    if (!topic) return;
    generateContent.mutate(
      { topic, platform: selectedPlatform },
      {
        onSuccess: (res) => {
          setContentResult(res);
          toast({ title: "Content Generated", description: "Your caption is ready!" });
        }
      }
    );
  };

  if (isLoading || !data) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const { vendor, resourceScore, growthStrategy, platformRecommendations } = data;

  return (
    <div className="space-y-8 animate-enter">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">
            Welcome back, {vendor.businessName}
          </h1>
          <p className="text-slate-500 mt-1">Here is your resource-aware growth engine.</p>
        </div>
        <div className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-semibold text-sm">
          Strategy: {growthStrategy.strategyName}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resource Score Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-6 bg-primary rounded-full" />
            Resource Analysis
          </h3>
          <div className="flex-1 flex items-center justify-center -ml-4">
            <ScoreChart score={resourceScore} />
          </div>
          <div className="mt-4 text-center">
             <div className="text-sm text-slate-500">Growth Capacity</div>
             <div className="text-3xl font-extrabold text-slate-900">{resourceScore.growthCapacity}%</div>
          </div>
        </div>

        {/* Strategy Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-green-500 rounded-full" />
            Strategic Roadmap
          </h3>
          <div className="space-y-4">
            {growthStrategy.actions.map((item, idx) => (
              <div key={idx} className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col md:flex-row gap-4 items-start">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block">Do This:</span>
                      <p className="text-slate-700">{item.action}</p>
                    </div>
                  </div>
                </div>
                <div className="w-px bg-slate-200 h-12 hidden md:block" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block">Avoid This:</span>
                      <p className="text-slate-700">{item.avoid}</p>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-auto bg-blue-50 px-3 py-2 rounded-lg text-xs text-blue-700 font-medium md:max-w-[150px]">
                  Why: {item.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Recommendations */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-purple-500 rounded-full" />
            Where to Focus
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {platformRecommendations.map((rec, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-purple-200 hover:bg-purple-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900">{rec.platform}</h4>
                  <span className="text-xs font-bold px-2 py-1 bg-white rounded border border-slate-200">
                    {rec.suitabilityScore}/10
                  </span>
                </div>
                <p className="text-sm text-slate-600">{rec.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Content Lab */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-400" />
            AI Content Lab
          </h3>

          <div className="space-y-4 relative z-10">
            <div>
              <label className="text-sm text-slate-300 mb-1 block">What's on your mind?</label>
              <input 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
                placeholder="e.g. Summer sale announcement..."
              />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm text-slate-300 mb-1 block">Platform</label>
                <select 
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none [&>option]:text-black"
                >
                  {platformRecommendations.map(p => <option key={p.platform} value={p.platform}>{p.platform}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={handleGenerate}
                  disabled={generateContent.isPending || !topic}
                  className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generateContent.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create"}
                </button>
              </div>
            </div>

            {contentResult && (
              <div className="mt-6 p-4 rounded-xl bg-white/10 border border-white/10 animate-enter">
                <p className="text-sm leading-relaxed text-slate-200 mb-3 whitespace-pre-wrap">{contentResult.caption}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {contentResult.hashtags.map(tag => (
                    <span key={tag} className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded-md">{tag}</span>
                  ))}
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${contentResult.caption}\n\n${contentResult.hashtags.join(' ')}`);
                    toast({ title: "Copied to clipboard" });
                  }}
                  className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                >
                  <Copy className="w-3 h-3" /> Copy Text
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
