import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeadSchema, PROGRAMS, LEAD_STATUSES, type LeadInput, type Lead } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateLead, useUpdateLead } from "@/hooks/use-leads";

interface LeadFormProps {
  lead?: Lead;
  onSuccess?: () => void;
}

export function LeadForm({ lead, onSuccess }: LeadFormProps) {
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();

  const form = useForm<LeadInput>({
    resolver: zodResolver(insertLeadSchema),
    defaultValues: lead || {
      name: "",
      email: "",
      phone: "",
      programInterest: PROGRAMS[0],
      status: "New",
    },
  });

  const onSubmit = async (data: LeadInput) => {
    try {
      if (lead) {
        await updateLead.mutateAsync({ id: lead.id, ...data });
      } else {
        await createLead.mutateAsync(data);
      }
      onSuccess?.();
    } catch (error) {
      console.error(error);
    }
  };

  const isPending = createLead.isPending || updateLead.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="jane@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1 234 567 890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="programInterest"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program Interest</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PROGRAMS.map((program) => (
                    <SelectItem key={program} value={program}>
                      {program}
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
                  {LEAD_STATUSES.map((status) => (
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

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isPending} className="w-full md:w-auto bg-primary text-white">
            {isPending ? "Saving..." : lead ? "Update Lead" : "Add Lead"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
