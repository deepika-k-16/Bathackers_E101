import { useParams } from "wouter";
import { useVendor } from "@/hooks/use-vendors";
import { Loader2, Copy, Share2, Instagram } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const { data: vendor, isLoading } = useVendor(Number(id));

  const { toast } = useToast();

  const profileUrl = `${window.location.origin}/profile/${id}`;

  if (isLoading || !vendor) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border p-8 space-y-6">
        
        {/* BUSINESS INFO */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {vendor.businessName}
          </h1>
          <p className="text-slate-500 capitalize">
            {vendor.businessCategory} • {vendor.targetAudience}
          </p>
          {vendor.bio && (
            <p className="mt-3 text-slate-700">{vendor.bio}</p>
          )}
        </div>

        {/* INSTAGRAM */}
        {vendor.instagramUrl && (
          <a
            href={vendor.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-pink-600 font-medium hover:underline"
          >
            <Instagram className="w-4 h-4" />
            Visit Instagram
          </a>
        )}

        {/* QR CODE */}
        <div className="flex flex-col items-center gap-2 pt-4">
          <QRCodeSVG value={profileUrl} size={160} />

          <span className="text-xs text-slate-400">
            Scan to view profile
          </span>
        </div>

        {/* SHARE ACTIONS */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => {
              navigator.clipboard.writeText(profileUrl);
              toast({ title: "Profile link copied" });
            }}
            className="flex-1 py-2 rounded-xl border text-sm font-semibold hover:bg-slate-50 flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy Link
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: vendor.businessName,
                  text: "Check out this business on GrowGuide",
                  url: profileUrl,
                });
              } else {
                navigator.clipboard.writeText(profileUrl);
                toast({ title: "Link copied (share not supported)" });
              }
            }}
            className="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        <div className="pt-4 text-center text-xs text-slate-400">
          Powered by GrowGuide 🚀
        </div>
      </div>
    </div>
  );
}
