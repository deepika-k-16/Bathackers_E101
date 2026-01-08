import { useEffect, useState } from "react";
import { useExpansionRequests, useCreateExpansionRequest } from "@/hooks/use-expansion";
import { Loader2, Plus, Megaphone, Handshake, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";

const myVendorId = Number(localStorage.getItem("growguide_vendor_id"));

async function expressInterest(targetVendorId: number) {
  await apiRequest("POST", "/api/collaboration-requests", {
    fromVendorId: myVendorId,
    toVendorId: targetVendorId,
    message: "I'm interested in collaborating. Let's connect!"
  });

  alert("Interest sent to vendor!");
}

const pitchSchema = z.object({
  pitch: z.string().min(10, "Pitch needs to be at least 10 characters"),
  supportType: z.enum(["partner", "promotion"]),
});

type PitchFormValues = z.infer<typeof pitchSchema>;

export default function Expansion() {
  const [vendorId, setVendorId] = useState<number | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("growguide_vendor_id");
    if (id) setVendorId(Number(id));
  }, []);

  const { data: requests, isLoading } = useExpansionRequests();
  const createRequest = useCreateExpansionRequest();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm<PitchFormValues>({
    resolver: zodResolver(pitchSchema),
  });

  const onSubmit = (data: PitchFormValues) => {
    if (!vendorId) return;

    createRequest.mutate(
      {
        vendorId,
        pitch: data.pitch,
        supportType: data.supportType,
      },
      {
        onSuccess: () => {
          toast({
            title: "Pitch Posted",
            description: "Your expansion request is live.",
          });
          setIsDialogOpen(false);
          reset();
        },
      }
    );
  };

  const handleExpressInterest = (targetVendorId?: number) => {
    if (!vendorId || !targetVendorId) return;

    if (vendorId === targetVendorId) {
      toast({
        title: "Action not allowed",
        description: "You cannot express interest in your own pitch.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Interest Sent 🚀",
      description: "The vendor has been notified of your interest.",
    });
  };

  return (
    <div className="space-y-8 animate-enter">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">
            Community Board
          </h1>
          <p className="text-slate-500 mt-1">
            Pitch ideas and find partners for expansion.
          </p>
        </div>

        {/* POST PITCH */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Post Pitch
            </button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Post an Expansion Pitch</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Type of Support Needed
                </label>
                <select
                  {...register("supportType")}
                  className="w-full px-4 py-3 rounded-xl border"
                >
                  <option value="partner">Strategic Partner</option>
                  <option value="promotion">Cross Promotion</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Your Pitch
                </label>
                <textarea
                  {...register("pitch")}
                  className="w-full px-4 py-3 rounded-xl border min-h-[120px]"
                />
              </div>

              <button
                type="submit"
                disabled={createRequest.isPending}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold"
              >
                {createRequest.isPending ? (
                  <Loader2 className="animate-spin w-5 h-5 mx-auto" />
                ) : (
                  "Post Pitch"
                )}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* PITCH CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center p-10">
            <Loader2 className="animate-spin w-8 h-8 text-primary" />
          </div>
        ) : requests?.length === 0 ? (
          <div className="col-span-full text-center py-20 text-slate-400 bg-white rounded-3xl border">
            No active pitches yet.
          </div>
        ) : (
          requests?.map((req) => (
            <div
              key={req.id}
              className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      req.supportType === "partner"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {req.supportType === "partner" ? (
                      <Handshake className="w-4 h-4" />
                    ) : (
                      <Megaphone className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {req.vendor?.businessName}
                    </h3>
                    <p className="text-xs text-slate-500 capitalize">
                      {req.supportType} request
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(req.createdAt!).toLocaleDateString()}
                </span>
              </div>

              {/* INSTAGRAM */}
              {req.vendor?.instagramUrl && (
                <a
                  href={req.vendor.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-pink-600 hover:underline flex items-center gap-1 mb-3"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Instagram
                </a>
              )}

              {/* PITCH */}
              <p className="text-slate-700 text-sm mb-6">
                “{req.pitch}”
              </p>

              {/* EXPRESS INTEREST */}
              <button
                onClick={() => handleExpressInterest(req.vendor?.id)}
                className="w-full py-2 rounded-lg border text-sm font-semibold hover:bg-slate-50"
              >
                Express Interest
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
