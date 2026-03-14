import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import MainNav from "../components/navigation/MainNav";
import PropFirmCard from "../components/insight/PropFirmCard";
import PerformanceStats from "../components/insight/PerformanceStats";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PROP_FIRMS = [
  "TopStep", "Tradovate", "Apex", "Alpha Futures", "FTMO", 
  "Earn2Trade", "The5ers", "Bulenox", "My Forex Funds"
];

export default function InsightLayer() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFirm, setSelectedFirm] = useState("");
  const [accountId, setAccountId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const queryClient = useQueryClient();

  const { data: connections = [] } = useQuery({
    queryKey: ['propConnections'],
    queryFn: () => base44.entities.PropFirmConnection.list()
  });

  const { data: trades = [] } = useQuery({
    queryKey: ['trades'],
    queryFn: () => base44.entities.Trade.list()
  });

  const createConnection = useMutation({
    mutationFn: (data) => base44.entities.PropFirmConnection.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['propConnections']);
      setDialogOpen(false);
      setSelectedFirm("");
      setAccountId("");
      setApiKey("");
    }
  });

  const updateConnection = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PropFirmConnection.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['propConnections'])
  });

  const handleConnect = () => {
    if (!selectedFirm || !accountId || !apiKey) return;
    createConnection.mutate({
      firm_name: selectedFirm,
      account_id: accountId,
      api_key: apiKey,
      status: "connected",
      last_sync: new Date().toISOString()
    });
  };

  const handleDisconnect = (firm) => {
    updateConnection.mutate({
      id: firm.id,
      data: { status: "disconnected" }
    });
  };

  const connectedFirms = connections.filter(c => c.status === "connected");
  const availableFirms = PROP_FIRMS.filter(
    firm => !connections.find(c => c.firm_name === firm && c.status === "connected")
  ).map(name => ({ name, status: "not_connected" }));

  return (
    <div className="min-h-screen bg-gray-950 pl-16">
      <MainNav />
      
      <div className="border-b border-gray-800 bg-gray-900/60 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Performance Statistics</h1>
          <p className="text-sm text-gray-400">Track your trading performance across all prop firms</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              <Plus className="w-3 h-3 mr-1" />
              Connect
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Connect Prop Firm</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-gray-300">Prop Firm</Label>
                <Select value={selectedFirm} onValueChange={setSelectedFirm}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select firm" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {PROP_FIRMS.map(firm => (
                      <SelectItem key={firm} value={firm} className="text-white">
                        {firm}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300">Account ID</Label>
                <Input
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Enter account ID"
                />
              </div>
              <div>
                <Label className="text-gray-300">API Key</Label>
                <Input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Enter API key"
                  type="password"
                />
              </div>
              <Button 
                onClick={handleConnect}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!selectedFirm || !accountId || !apiKey}
              >
                Connect
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-6 space-y-8">
        <div>
          <PerformanceStats trades={trades} />
        </div>

        {connectedFirms.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Connected Firms</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {connectedFirms.map((firm) => (
                <PropFirmCard
                  key={firm.id}
                  firm={firm}
                  onConnect={() => {}}
                  onDisconnect={handleDisconnect}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}