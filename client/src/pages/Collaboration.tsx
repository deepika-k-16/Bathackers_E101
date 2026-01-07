import { useEffect, useState } from "react";
import { useVendorMatches, useCollaborationRequests, useCreateCollaborationRequest, useUpdateCollaborationStatus } from "@/hooks/use-vendors"; // Note: actually importing from use-collaboration below but combined in thought process. Fixing import path.
import { useVendorMatches as useMatches } from "@/hooks/use-vendors";
import { useCollaborationRequests as useRequests, useCreateCollaborationRequest as useCreateReq, useUpdateCollaborationStatus as useUpdateStatus } from "@/hooks/use-collaboration";
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
  const { data: sentRequests } = useRequests(vendorId, 'sent');
  const { data: receivedRequests } = useRequests(vendorId, 'received');
  
  const createRequest = useCreateReq();
  const updateStatus = useUpdateStatus();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);

  const handleConnect = (toId: number) => {
    if (!vendorId) return;
    createRequest.mutate({
      fromVendorId: vendorId,
      toVendorId: toId,
      message: message || "Hi! I'd love to collaborate with your business."
    }, {
      onSuccess: () => {
        toast({ title: "Request Sent", description: "The vendor has been notified." });
        setSelectedMatch(null);
        setMessage("");
      }
    });
  };

  const handleStatusUpdate = (reqId: number, status: 'accepted' | 'rejected') => {
    updateStatus.mutate({ id: reqId, status }, {
      onSuccess: () => toast({ title: `Request ${status}` })
    });
  };

  return (
    <div className="space-y-8 animate-enter">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-display">Collaboration Hub</h1>
        <p className="text-slate-500 mt-1">Connect with complementary businesses to grow together.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Matches Column */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Recommended Matches</h2>
          {loadingMatches ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
          ) : matches?.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-300 text-center text-slate-500">
              No matches found right now. Check back later!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches?.map((match) => (
                <div key={match.vendor.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{match.vendor.businessName}</h3>
                      <span className="text-sm text-slate-500 capitalize">{match.vendor.businessCategory}</span>
                    </div>
                    <div className="bg-green-50 text-green-700 font-bold text-xs px-2 py-1 rounded-full border border-green-100">
                      {match.matchScore}% Match
                    </div>
                  </div>
                  
                  <div className="mb-6 space-y-2">
                    <p className="text-sm text-slate-600 line-clamp-2">{match.vendor.bio || "No bio available."}</p>
                    <div className="flex flex-wrap gap-2">
                      {match.reasons.slice(0, 2).map((reason, i) => (
                        <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Dialog open={selectedMatch === match.vendor.id} onOpenChange={(open) => setSelectedMatch(open ? match.vendor.id : null)}>
                    <DialogTrigger asChild>
                      <button className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Connect
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Connect with {match.vendor.businessName}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <p className="text-sm text-slate-500">Send a message to introduce yourself and propose a collaboration.</p>
                        <textarea 
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Hi! I noticed we target similar audiences..."
                          className="w-full p-3 rounded-xl border border-slate-200 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <button 
                          onClick={() => handleConnect(match.vendor.id)}
                          disabled={createRequest.isPending}
                          className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex justify-center items-center gap-2"
                        >
                          {createRequest.isPending ? <Loader2 className="animate-spin w-4 h-4"/> : <Send className="w-4 h-4" />}
                          Send Request
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Requests Column */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 h-fit">
          <Tabs defaultValue="received">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="received">Received</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
            </TabsList>
            
            <TabsContent value="received" className="space-y-4">
              {receivedRequests?.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No pending requests.</p>}
              {receivedRequests?.map(req => (
                <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-900">{req.fromVendor?.businessName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${req.status === 'open' ? 'bg-yellow-100 text-yellow-700' : req.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{req.message}</p>
                  {req.status === 'open' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStatusUpdate(req.id, 'accepted')}
                        className="flex-1 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 flex justify-center items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Accept
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(req.id, 'rejected')}
                        className="flex-1 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 flex justify-center items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="sent" className="space-y-4">
              {sentRequests?.length === 0 && <p className="text-sm text-slate-400 text-center py-4">You haven't sent any requests.</p>}
              {sentRequests?.map(req => (
                <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 opacity-80 hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-900">To: {req.toVendor?.businessName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${req.status === 'open' ? 'bg-yellow-100 text-yellow-700' : req.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{req.message}</p>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
