import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertApplicationSchema, PROGRAMS, APPLICATION_STATUSES, type ApplicationInput, type Application } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateApplication, useUpdateApplication } from "@/hooks/use-applications";
import { useLeads } from "@/hooks/use-leads";

interface ApplicationFormProps {
  application?: Application;
  onSuccess?: () => void;
}

export function ApplicationForm({ application, onSuccess }: ApplicationFormProps) {
  const createApplication = useCreateApplication();
  const updateApplication = useUpdateApplication();
  const { data: leads } = useLeads();

  const form = useForm<ApplicationInput>({
    resolver: zodResolver(insertApplicationSchema),
    defaultValues: application || {
      leadId: 0,
      program: PROGRAMS[0],
      status: "Under Review",
      notes: "",
    },
  });

  const onSubmit = async (data: ApplicationInput) => {
    try {
      if (application) {
        await updateApplication.mutateAsync({ id: application.id, ...data });
      } else {
        await createApplication.mutateAsync(data);
      }
      onSuccess?.();
    } catch (error) {
      console.error(error);
    }
  };

  const isPending = createApplication.isPending || updateApplication.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!application && (
          <FormField
            control={form.control}
            name="leadId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Lead</FormLabel>
                <Select 
                  onValueChange={(val) => field.onChange(parseInt(val))} 
                  defaultValue={field.value ? String(field.value) : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a lead" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {leads?.map((lead) => (
                      <SelectItem key={lead.id} value={String(lead.id)}>
                        {lead.name} ({lead.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="program"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PROGRAMS.map((prog) => (
                    <SelectItem key={prog} value={prog}>
                      {prog}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {APPLICATION_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Interview notes, background info..." {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isPending} className="w-full md:w-auto">
            {isPending ? "Saving..." : application ? "Update Application" : "Create Application"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
