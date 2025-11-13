"use client";

import { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createIdeaSchema, type CreateIdeaInput } from "@/lib/validations/idea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, Lightbulb, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface AiSuggestion {
  suggestions: string[];
  fieldType: "product" | "customer" | "businessModel";
}

interface IdeaFormProps {
  onSubmitSuccess?: () => void;
}

export function IdeaForm({ onSubmitSuccess }: IdeaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string[]>>({});
  const [loadingSuggestions, setLoadingSuggestions] = useState<Record<string, boolean>>({});
  const popoverTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  const form = useForm<CreateIdeaInput>({
    resolver: zodResolver(createIdeaSchema),
    defaultValues: {
      product: "",
      customer: "",
      businessModel: "",
    },
  });

  // Fetch AI suggestions for a specific field
  const fetchAiSuggestions = useCallback(async (fieldType: "product" | "customer" | "businessModel") => {
    const currentValue = form.watch(fieldType);

    // Don't fetch if already loading
    if (loadingSuggestions[fieldType]) return;

    // Clear any existing timeout for this field
    if (popoverTimeouts.current[fieldType]) {
      clearTimeout(popoverTimeouts.current[fieldType]);
    }

    // Don't fetch if field already has content
    if (currentValue.trim()) {
      setAiSuggestions(prev => ({ ...prev, [fieldType]: [] }));
      return;
    }

    setLoadingSuggestions(prev => ({ ...prev, [fieldType]: true }));

    try {
      const response = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fieldType,
          context: "", // Could pass other field values as context in the future
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data: AiSuggestion = await response.json();
      setAiSuggestions(prev => ({ ...prev, [fieldType]: data.suggestions }));
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      toast.error("Failed to load AI suggestions");
    } finally {
      setLoadingSuggestions(prev => ({ ...prev, [fieldType]: false }));
    }
  }, [form, loadingSuggestions]);

  // Handle field focus with debouncing
  const handleFieldFocus = useCallback((fieldType: "product" | "customer" | "businessModel") => {
    // Debounce the AI suggestion call
    popoverTimeouts.current[fieldType] = setTimeout(() => {
      fetchAiSuggestions(fieldType);
    }, 500);
  }, [fetchAiSuggestions]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((fieldType: "product" | "customer" | "businessModel", suggestion: string) => {
    form.setValue(fieldType, suggestion, { shouldValidate: true });
    setAiSuggestions(prev => ({ ...prev, [fieldType]: [] }));
  }, [form]);

  // Handle form submission
  const onSubmit = async (data: CreateIdeaInput) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create idea");
      }

      const result = await response.json();
      toast.success("Idea created successfully!");

      // Reset form
      form.reset();

      // Call success callback if provided
      onSubmitSuccess?.();

    } catch (error) {
      console.error("Error creating idea:", error);
      toast.error("Failed to create idea. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldConfigs = [
    {
      name: "product" as const,
      label: "Product/Service",
      description: "What product or service are you offering?",
      placeholder: "e.g., A mobile app for personalized meal planning...",
    },
    {
      name: "customer" as const,
      label: "Target Customer",
      description: "Who are your target customers?",
      placeholder: "e.g., Busy professionals who want to eat healthier...",
    },
    {
      name: "businessModel" as const,
      label: "Business Model",
      description: "How will you make money?",
      placeholder: "e.g., Subscription-based mobile application with premium features...",
    },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Capture Your Business Idea
        </CardTitle>
        <CardDescription>
          Record your entrepreneurial idea with these three key elements.
          Get AI-powered suggestions when you're stuck!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {fieldConfigs.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: fieldProps }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      {field.label}
                      <Popover open={aiSuggestions[field.name]?.length > 0}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => fetchAiSuggestions(field.name)}
                            disabled={loadingSuggestions[field.name]}
                          >
                            {loadingSuggestions[field.name] ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Sparkles className="h-3 w-3" />
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="start">
                          <div className="space-y-2">
                            <p className="text-sm font-medium">AI Suggestions:</p>
                            <div className="space-y-1">
                              {aiSuggestions[field.name]?.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-left h-auto p-2 whitespace-normal"
                                  onClick={() => handleSuggestionSelect(field.name, suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={field.placeholder}
                        className="min-h-[80px] resize-none"
                        onFocus={() => handleFieldFocus(field.name)}
                        {...fieldProps}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Idea...
                </>
              ) : (
                "Create Idea"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}