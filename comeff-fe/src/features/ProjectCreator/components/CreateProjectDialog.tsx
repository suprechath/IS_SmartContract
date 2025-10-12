// src/features/ProjectCreator/components/CreateProjectDialog.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreatorActions } from "../hooks/useCreatorActions";
import { Plus, Loader2, MapPin, DollarSign, Calendar, Leaf, TrendingUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";


// 1. Define the validation schema with Zod
const formSchema = z.object({
  title: z.string()
    .min(3, { message: "Title must be at least 3 characters." })
    .max(255, { message: "Title cannot exceed 255 characters." }),
  project_overview: z.string()
    .min(10, { message: "Project overview must be at least 10 characters." }),
  proposed_solution: z.string().min(10, { message: "Proposed solution must be at least 10 characters." }),
  location: z.string()
    .min(1, { message: "Location is required." }),
  cover_image_url: z.string()
    .url({ message: "Please enter a valid URL." })
    .optional()
    .or(z.literal('')), // Allow empty string
  tags: z.string()
    .min(1, { message: "Please enter at least one tag." })
    .transform(val => val.split(',').map(tag => tag.trim())), // Transforms into array
  co2_reduction: z.coerce.number().positive().optional(),
  projected_roi: z.coerce
    .number()
    .positive({ message: "Projected ROI must be a positive number." }),
  projected_payback_period_months: z.coerce.number().positive().optional(),
  project_plan_url: z.string()
    .url({ message: "Please enter a valid URL for the project plan." }),
  technical_specifications_urls: z.string()
    .optional()
    .transform((val) => val ? val.split(/[\n,]/).map(url => url.trim()).filter(Boolean) : [])
    .pipe(z.array(z.string().url({ message: "One of the technical URLs is invalid." }))),
  third_party_verification_urls: z.string()
    .optional()
    .transform((val) => val ? val.split(/[\n,]/).map(url => url.trim()).filter(Boolean) : [])
    .pipe(z.array(z.string().url({ message: "One of the verification URLs is invalid." }))),
  funding_USDC_goal: z.coerce
    .number()
    .positive({ message: "Funding goal must be a positive number." }),
  funding_duration_second: z.coerce
    .number()
    .int()
    .positive({ message: "Duration must be a positive whole number of seconds." }),
});

interface CreateProjectDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onProjectCreated: () => void;
}

export const CreateProjectDialog = ({ isOpen, setIsOpen, onProjectCreated }: CreateProjectDialogProps) => {
  const { createProject, isCreating } = useCreatorActions(onProjectCreated);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      project_overview: "",
      proposed_solution: "",
      location: "",
      cover_image_url: "",
      tags: [] as any,
      co2_reduction: "" as any,
      projected_roi: "" as any,
      projected_payback_period_months: "" as any,
      project_plan_url: "",
      technical_specifications_urls: [] as any,
      third_party_verification_urls: [] as any,
      funding_USDC_goal: "" as any, // Use empty string for initial state
      funding_duration_second: "" as any,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const res = await createProject(values);
    if (!res) return;
    form.reset();
    setIsOpen(false);
    onProjectCreated();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} modal>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create Project
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle className="text-primary font-bold text-center text-2xl">Create a New Project</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground font-semibold">
            Fill in the details below to start your funding campaign.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[70vh] pr-6">
              <div className="space-y-4 text-emerald-950">
                <FormField control={form.control} name="title" render={({ field }) => (<FormItem> <FormLabel>Project Title *</FormLabel> <FormControl><Input placeholder="e.g., HVAC Upgrade for Green Tower" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                <FormField control={form.control} name="location" render={({ field }) => (<FormItem> <FormLabel> <MapPin className="h-4 w-4" /> Location *</FormLabel> <FormControl><Input placeholder="City, Country" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                <FormField control={form.control} name="project_overview" render={({ field }) => (<FormItem> <FormLabel>Project Overview</FormLabel> <FormControl><Textarea className="h-28" placeholder="Describe the project's goals, scope, and expected impact..." {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                <FormField control={form.control} name="proposed_solution" render={({ field }) => (<FormItem> <FormLabel>Proposed Solution</FormLabel> <FormControl><Textarea className="h-28" placeholder="Detail the technical solution to be implemented..." {...field} /></FormControl> <FormMessage /> </FormItem>)} />

                {/* --- GROUP 2: FINANCIALS (No Changes) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="funding_USDC_goal" render={({ field }) => (<FormItem> <FormLabel><DollarSign className="h-4 w-4" /> Funding Goal (USDC) *</FormLabel> <FormControl><Input type="number" placeholder="50000" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                  <FormField control={form.control} name="funding_duration_second" render={({ field }) => (<FormItem> <FormLabel><Calendar className="h-4 w-4" /> Funding Duration (seconds) *</FormLabel> <FormControl><Input type="number" placeholder="2592000" {...field} /></FormControl> <FormDescription>30 days = 2,592,000 seconds</FormDescription> <FormMessage /> </FormItem>)} />
                  <FormField control={form.control} name="projected_roi" render={({ field }) => (<FormItem> <FormLabel><TrendingUp className="h-4 w-4" /> Projected ROI (%) *</FormLabel> <FormControl><Input type="number" placeholder="15" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                  <FormField control={form.control} name="projected_payback_period_months" render={({ field }) => (<FormItem> <FormLabel>Payback Period (Months)</FormLabel> <FormControl><Input type="number" placeholder="36" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                </div>

                {/* --- GROUP 3: METADATA & DOCUMENTS (Changes Here) --- */}
                <FormField control={form.control} name="co2_reduction" render={({ field }) => (<FormItem> <FormLabel><Leaf className="h-4 w-4" /> CO2 Reduction (tons/year) *</FormLabel> <FormControl><Input placeholder="100 tCO2e" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                <FormField control={form.control} name="tags" render={({ field }) => (<FormItem> <FormLabel>Tags *</FormLabel> <FormControl><Input placeholder="Energy, HVAC, Smart Building" {...field} /></FormControl> <FormDescription>Comma-separated list of relevant tags.</FormDescription> <FormMessage /> </FormItem>)} />
                <FormField control={form.control} name="project_plan_url" render={({ field }) => (<FormItem> <FormLabel>Project Plan URL *</FormLabel> <FormControl><Input type="url" placeholder="https://example.com/plan.pdf" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                <FormField control={form.control} name="cover_image_url" render={({ field }) => (<FormItem> <FormLabel>Cover Image URL</FormLabel> <FormControl><Input type="url" placeholder="https://example.com/image.png" {...field} /></FormControl> <FormMessage /> </FormItem>)} />

                <FormField control={form.control} name="technical_specifications_urls" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technical Specification URLs</FormLabel>
                    <FormControl>
                      <Textarea placeholder="https://example.com/spec1.pdf&#10;https://example.com/spec2.pdf" {...field} />
                    </FormControl>
                    <FormDescription>Enter each URL on a new line or separated by a comma.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="third_party_verification_urls" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Third-Party Verification URLs</FormLabel>
                    <FormControl>
                      <Textarea placeholder="https://example.com/verify1.pdf&#10;https://example.com/verify2.pdf" {...field} />
                    </FormControl>
                    <FormDescription>Enter each URL on a new line or separated by a comma.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </ScrollArea>
            <DialogFooter className="pt-6">
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit" 
              // disabled={!form.formState.isValid}
              >
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};