import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";

// Pages
import Landing from "@/pages/Landing";
import Setup from "@/pages/Setup";
import Dashboard from "@/pages/Dashboard";
import Collaboration from "@/pages/Collaboration";
import Expansion from "@/pages/Expansion";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/setup" component={Setup} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/collaboration" component={Collaboration} />
        <Route path="/expansion" component={Expansion} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
