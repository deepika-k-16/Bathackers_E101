import { useEffect, useState } from "react";
import { useVendorMatches as useMatches } from "@/hooks/use-vendors";
import {
  useCollaborationRequests as useRequests,
  useCreateCollaborationRequest as useCreateReq,
  useUpdateCollaborationStatus as useUpdateStatus
} from "@/hooks/use-collaboration";
import { Loader2, UserPlus, Check, X, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Collaboration() {
  const [vendorId, setVendorId] = useState<number | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("growguide_vendor_id");
    if (id) setVendorId(Number(id));
  }, []);

  const { data: matches, isLoading: loadingMatches } = useMatches(vendorId);
  const { data: sentRequests } = useRequests(vendorId, "sent");
  const { data: receivedRequests } = useRequests(vendorId, "received");

  const createRequest = useCreateReq();
  const updateStatus = useUpdateStatus();
  const { toast } = useToast();

  const [message, setMessage] = useState("");
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);

  const handleConnect = (toId: number) => {
    if (!vendorId) return;

    createRequest.mutate(
      {
        fromVendorId: vendorId,
        toVendorId: toId,
        message: message || "Hi! I'd love to collaborate with your business."
      },
      {
        onSuccess: () => {
          toast({ title: "Request Sent", description: "The vendor has been notified." });
          setSelectedMatch(null);
          setMessage("");
        }
      }
    );
  };

  const handleStatusUpdate = (reqId: number, status: "accepted" | "rejected") => {
    updateStatus.mutate(
      { id: reqId, status },
      { onSuccess: () => toast({ title: `Request ${status}` }) }
    );
  };

  return (
    <div className="space-y-8 animate-enter">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-display">
          Collaboration Hub
        </h1>
        <p className="text-slate-500 mt-1">
          Connect with complementary businesses to grow together.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ================= MATCHES ================= */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Recommended Matches</h2>

          {loadingMatches ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : matches?.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-300 text-center text-slate-500">
              No matches found right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches?.map((match) => {
                const vendor = match.vendor;

                return (
                  <div
                    key={vendor.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
                  >
                    <h3 className="text-lg font-bold text-slate-900">
                      {vendor.businessName}
                    </h3>

                    <p className="text-sm text-slate-500 capitalize">
                      {vendor.businessCategory}
                    </p>

                    {vendor.instagramUrl && (
                      <a
                        href={vendor.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-pink-600 hover:underline mt-1 inline-block"
                      >
                        View Instagram
                      </a>
                    )}

                    <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                      {vendor.bio || "No bio available."}
                    </p>

                    <Dialog
                      open={selectedMatch === vendor.id}
                      onOpenChange={(open) =>
                        setSelectedMatch(open ? vendor.id : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <button className="mt-4 w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm flex items-center justify-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          Connect
                        </button>
                      </DialogTrigger>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Connect with {vendor.businessName}
                          </DialogTitle>
                        </DialogHeader>

                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full p-3 border rounded-xl"
                          placeholder="Hi! I noticed we target similar audiences..."
                        />

                        <button
                          onClick={() => handleConnect(vendor.id)}
                          className="w-full py-3 bg-primary text-white rounded-xl flex justify-center gap-2"
                        >
                          <Send className="w-4 h-4" /> Send Request
                        </button>
                      </DialogContent>
                    </Dialog>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= REQUESTS ================= */}
        <div className="bg-slate-50 rounded-2xl border p-6">
          <Tabs defaultValue="received">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="received">Received</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
            </TabsList>

            {/* RECEIVED */}
            <TabsContent value="received" className="space-y-4">
              {receivedRequests?.map((req) => (
                <div key={req.id} className="bg-white p-4 rounded-xl border">
                  <strong>{req.fromVendor?.businessName}</strong>

                  {req.fromVendor?.instagramUrl && (
                    <a
                      href={req.fromVendor.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-pink-600 hover:underline"
                    >
                      View Instagram
                    </a>
                  )}

                  <p className="text-sm mt-2">{req.message}</p>

                  {req.status === "open" && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleStatusUpdate(req.id, "accepted")}
                        className="flex-1 text-green-700 bg-green-50 rounded-lg py-1.5"
                      >
                        <Check className="inline w-3 h-3" /> Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(req.id, "rejected")}
                        className="flex-1 text-red-700 bg-red-50 rounded-lg py-1.5"
                      >
                        <X className="inline w-3 h-3" /> Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>

            {/* SENT */}
            <TabsContent value="sent" className="space-y-4">
              {sentRequests?.map((req) => (
                <div key={req.id} className="bg-white p-4 rounded-xl border">
                  <strong>To: {req.toVendor?.businessName}</strong>

                  {req.toVendor?.instagramUrl && (
                    <a
                      href={req.toVendor.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-pink-600 hover:underline"
                    >
                      View Instagram
                    </a>
                  )}

                  <p className="text-xs text-slate-500 mt-1">
                    {req.message}
                  </p>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
