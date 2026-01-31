import { Sidebar } from "@/components/Sidebar";
import { useApplications, useDeleteApplication } from "@/hooks/use-applications";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil, Calendar, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { ApplicationForm } from "@/components/ApplicationForm";
import { type Application } from "@shared/schema";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Applications() {
  const { data: applications, isLoading } = useApplications();
  const deleteApp = useDeleteApplication();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | undefined>(undefined);

  const handleEdit = (app: Application) => {
    setSelectedApp(app);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedApp(undefined);
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
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-display font-bold">Applications</h1>
              <p className="text-muted-foreground">Manage enrollment applications and reviews.</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" /> New Application
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{selectedApp ? "Edit Application" : "New Application"}</DialogTitle>
                </DialogHeader>
                <ApplicationForm application={selectedApp} onSuccess={handleSuccess} />
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications?.map((app) => (
                <Card key={app.id} className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-bold">
                          {app.lead?.name || "Unknown Lead"}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {app.program}
                        </p>
                      </div>
                      <Badge variant={
                        app.status === 'Accepted' ? 'default' : 
                        app.status === 'Rejected' ? 'destructive' : 
                        'outline'
                      } className={
                        app.status === 'Accepted' ? 'bg-green-600' : ''
                      }>
                        {app.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        Applied: {app.createdAt ? format(new Date(app.createdAt), "MMM d, yyyy") : "-"}
                      </div>
                      {app.notes && (
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md text-slate-600 dark:text-slate-300 italic text-xs mt-4">
                          "{app.notes}"
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-end gap-2 border-t mt-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(app)}>
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        if (confirm("Delete this application?")) {
                          deleteApp.mutate(app.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              {applications?.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground bg-white rounded-xl border border-dashed">
                  No applications found. Create one to get started.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
