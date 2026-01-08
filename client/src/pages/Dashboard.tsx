import { useEffect, useState } from "react";
import { useVendorDashboard } from "@/hooks/use-vendors";
import { useGenerateContent } from "@/hooks/use-ai";
import { ScoreChart } from "@/components/ScoreChart";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Wand2,
  Copy,
  ExternalLink,
  Instagram,
  Share2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QRCodeCanvas } from "qrcode.react";


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
  const [contentResult, setContentResult] = useState<{
    caption: string;
    hashtags: string[];
  } | null>(null);

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Enter a topic first", variant: "destructive" });
      return;
    }

    generateContent.mutate(
      { topic, platform: selectedPlatform },
      {
        onSuccess: (res) => {
          setContentResult(res);
          toast({
            title: "Content Generated ✨",
            description: "Your caption is ready!",
          });
        },
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

  // 🔗 Public profile link
  const profileLink = `${window.location.origin}/profile/${vendor.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileLink);
    toast({ title: "Profile link copied!" });
  };

  return (
    <div className="space-y-8 animate-enter">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">
            Welcome back, {vendor.businessName}
          </h1>
          <p className="text-slate-500 mt-1">
            Here is your resource-aware growth engine.
          </p>

          {/* INSTAGRAM LINK */}
          {vendor.instagramUrl && (
            <a
              href={vendor.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 text-sm text-pink-600 hover:underline"
            >
              <Instagram className="w-4 h-4" />
              View Instagram Profile
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* SHARE PROFILE */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share Profile
            </button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Your Profile</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-center">
              <QRCodeCanvas value={profileLink} size={180} />


              <p className="text-sm text-slate-500 break-all">
                {profileLink}
              </p>

              <button
                onClick={handleCopyLink}
                className="w-full py-2 bg-primary text-white rounded-lg font-bold flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* RESOURCE + STRATEGY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border p-6 flex flex-col">
          <h3 className="text-lg font-bold mb-4">Resource Analysis</h3>
          <div className="flex-1 flex items-center justify-center">
            <ScoreChart score={resourceScore} />
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm text-slate-500">Growth Capacity</div>
            <div className="text-3xl font-extrabold">
              {resourceScore.growthCapacity}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border p-6">
          <h3 className="text-lg font-bold mb-6">Strategic Roadmap</h3>
          <div className="space-y-4">
            {growthStrategy.actions.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-xl p-5 border flex flex-col md:flex-row gap-4"
              >
                <div className="flex-1">
                  <CheckCircle2 className="w-5 h-5 text-green-600 inline mr-2" />
                  <strong>Do:</strong> {item.action}
                </div>
                <div className="flex-1">
                  <XCircle className="w-5 h-5 text-red-500 inline mr-2" />
                  <strong>Avoid:</strong> {item.avoid}
                </div>
                <div className="text-xs bg-blue-50 px-3 py-2 rounded-lg text-blue-700">
                  Why: {item.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PLATFORM + AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platforms */}
        <div className="bg-white rounded-2xl border p-6">
          <h3 className="text-lg font-bold mb-4">Where to Focus</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {platformRecommendations.map((rec, i) => (
              <div key={i} className="p-4 rounded-xl border bg-slate-50">
                <div className="flex justify-between mb-2">
                  <strong>{rec.platform}</strong>
                  <span className="text-xs font-bold">
                    {rec.suitabilityScore}/10
                  </span>
                </div>
                <p className="text-sm text-slate-600">{rec.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI CONTENT LAB */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-400" />
            AI Content Lab
          </h3>

          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Summer sale announcement"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border mb-4"
          />

          <div className="flex gap-4 mb-4">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border"
            >
              {platformRecommendations.map((p) => (
                <option key={p.platform} value={p.platform}>
                  {p.platform}
                </option>
              ))}
            </select>

            <button
              onClick={handleGenerate}
              disabled={generateContent.isPending}
              className="px-6 py-3 bg-purple-500 rounded-xl font-bold"
            >
              {generateContent.isPending ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                "Create"
              )}
            </button>
          </div>

          {contentResult && (
            <div className="bg-white/10 p-4 rounded-xl">
              <p className="mb-3 whitespace-pre-wrap">
                {contentResult.caption}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {contentResult.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-purple-500/20 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${contentResult.caption}\n\n${contentResult.hashtags.join(
                      " "
                    )}`
                  );
                  toast({ title: "Copied to clipboard" });
                }}
                className="text-xs flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
