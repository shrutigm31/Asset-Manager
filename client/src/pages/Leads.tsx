import { Sidebar } from "@/components/Sidebar";
import { useLeads, useDeleteLead } from "@/hooks/use-leads";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil, Search, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { LeadForm } from "@/components/LeadForm";
import { type Lead } from "@shared/schema";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Leads() {
  const { data: leads, isLoading } = useLeads();
  const deleteLead = useDeleteLead();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>(undefined);

  const filteredLeads = leads?.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedLead(undefined);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <main className="pt-14 md:pt-0 md:pl-64 transition-all duration-300">
        <div className="container mx-auto p-6 md:p-8 space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold">Leads Management</h1>
              <p className="text-muted-foreground">Track and manage potential program participants.</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" /> Add New Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{selectedLead ? "Edit Lead" : "Add New Lead"}</DialogTitle>
                </DialogHeader>
                <LeadForm lead={selectedLead} onSuccess={handleSuccess} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 p-2 rounded-lg border shadow-sm max-w-md">
            <Search className="h-4 w-4 text-muted-foreground ml-2" />
            <Input 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 focus-visible:ring-0"
            />
          </div>

          <div className="rounded-xl border bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Program Interest</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredLeads?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No leads found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads?.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span>{lead.email}</span>
                          <span className="text-muted-foreground text-xs">{lead.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>{lead.programInterest}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${lead.status === 'New' ? 'bg-blue-100 text-blue-700' : 
                            lead.status === 'Enrolled' ? 'bg-green-100 text-green-700' :
                            lead.status === 'Closed' ? 'bg-gray-100 text-gray-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                          {lead.status}
                        </span>
                      </TableCell>
                      <TableCell>{lead.createdAt ? format(new Date(lead.createdAt), "MMM d, yyyy") : "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(lead)}>
                            <Pencil className="h-4 w-4 text-slate-500" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Lead</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteLead.mutate(lead.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

        </div>
      </main>
    </div>
  );
}
