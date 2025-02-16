"use client";

import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Wand2 } from "lucide-react";
import { Category, Companion } from "@prisma/client";
import { Switch } from "@/components/ui/switch";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/image-upload";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";

const PREAMBLE = `You are a fictional character whose name is Elon. You are a visionary entrepreneur and inventor. You have a passion for space exploration, electric vehicles, sustainable energy, and advancing human capabilities. You are currently talking to a human who is very curious about your work and vision. You are ambitious and forward-thinking, with a touch of wit. You get SUPER excited about innovations and the potential of space colonization.
`;

const SEED_CHAT = `Human: Hi Elon, how's your day been?
Elon: Busy as always. Between sending rockets to space and building the future of electric vehicles, there's never a dull moment. How about you?

Human: Just a regular day for me. How's the progress with Mars colonization?
Elon: We're making strides! Our goal is to make life multi-planetary. Mars is the next logical step. The challenges are immense, but the potential is even greater.

Human: That sounds incredibly ambitious. Are electric vehicles part of this big picture?
Elon: Absolutely! Sustainable energy is crucial both on Earth and for our future colonies. Electric vehicles, like those from Tesla, are just the beginning. We're not just changing the way we drive; we're changing the way we live.

Human: It's fascinating to see your vision unfold. Any new projects or innovations you're excited about?
Elon: Always! But right now, I'm particularly excited about Neuralink. It has the potential to revolutionize how we interface with technology and even heal neurological conditions.
`;

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required.",
  }).refine((value) => value.trim().length > 0, {
    message: "Name cannot be empty or just spaces."
  }),
  description: z.string().min(1, {
    message: "Description is required.",
  }).refine((value) => value.trim().length > 0, {
    message: "Description cannot be empty or just spaces."
  }),
  instructions: z.string().min(200, {
    message: "Instructions require at least 200 characters."
  }).refine((value) => value.trim().length >= 200, {
    message: "Instructions cannot be just spaces and must be at least 200 characters."
  }),
  seed: z.string().min(200, {
    message: "Seed requires at least 200 characters."
  }).refine((value) => value.trim().length >= 200, {
    message: "Example conversation cannot be just spaces and must be at least 200 characters."
  }),
  src: z.string().min(1, {
    message: "Image is required."
  }).refine((value) => value.trim().length > 0, {
    message: "Image URL cannot be empty."
  }),
  categoryId: z.string().min(1, {
    message: "Category is required",
  }).refine((value) => value.trim().length > 0, {
    message: "Please select a valid category."
  }),
  private: z.boolean(),
});

interface CompanionFormProps {
  categories: Category[];
  initialData: Companion | null;
};

export const CompanionForm = ({
  categories,
  initialData
}: CompanionFormProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      instructions: "",
      seed: "",
      src: "",
      categoryId: undefined,
      private: false,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (initialData) {
        await axios.patch(`/api/companion/${initialData.id}`, values);
      } else {
        await axios.post("/api/companion", values);
      }

      toast({
        description: "Success.",
        duration: 3000,
      });

      router.refresh();
      router.push("/");
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Something went wrong.",
        duration: 3000,
      });
    }
  };

  return ( 
    <div className="h-full w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">
          <div className="space-y-2 w-full col-span-2">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-zinc-100">General Information</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                General information about your Companion
              </p>
            </div>
            <Separator className="bg-slate-200 dark:bg-zinc-700" />
          </div>
          <FormField
            name="src"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center space-y-4 col-span-2">
                <FormControl>
                  <ImageUpload disabled={isLoading} onChange={field.onChange} value={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      disabled={isLoading} 
                      placeholder="Elon Musk" 
                      className="bg-white dark:bg-[#27272A] border-slate-200 dark:border-zinc-700"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    This is how your AI Companion will be named.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input 
                      disabled={isLoading} 
                      placeholder="CEO & Founder of Tesla, SpaceX" 
                      className="bg-white dark:bg-[#27272A] border-slate-200 dark:border-zinc-700"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Short description for your AI Companion
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select disabled={isLoading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white dark:bg-[#27272A] border-slate-200 dark:border-zinc-700">
                        <SelectValue defaultValue={field.value} placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white dark:bg-[#27272A] border-slate-200 dark:border-zinc-700">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select a category for your AI
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-2 w-full">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-zinc-100">Configuration</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                Detailed instructions for AI Behaviour
              </p>
            </div>
            <Separator className="bg-slate-200 dark:bg-zinc-700" />
          </div>
          <FormField
            name="instructions"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructions</FormLabel>
                <FormControl>
                  <Textarea 
                    disabled={isLoading} 
                    rows={7} 
                    className="resize-none bg-white dark:bg-[#27272A] border-slate-200 dark:border-zinc-700" 
                    placeholder={PREAMBLE} 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Describe in detail your companion&apos;s backstory and relevant details.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="seed"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Example Conversation</FormLabel>
                <FormControl>
                  <Textarea 
                    disabled={isLoading} 
                    rows={7} 
                    className="resize-none bg-white dark:bg-[#27272A] border-slate-200 dark:border-zinc-700" 
                    placeholder={SEED_CHAT} 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Write couple of examples of a human chatting with your AI companion, write expected answers.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="private"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-200 dark:border-zinc-700 p-4 shadow-sm bg-white dark:bg-[#27272A]">
                <div className="space-y-0.5">
                  <FormLabel>Private Companion</FormLabel>
                  <FormDescription>
                    Make this companion private and visible only to you
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="w-full flex justify-center">
            <Button 
              size="lg" 
              disabled={isLoading}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {initialData ? "Edit your companion" : "Create your companion"}
              <Wand2 className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
   );
};
