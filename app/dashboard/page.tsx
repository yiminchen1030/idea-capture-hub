"use client";

import React, { useState } from "react";
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { IdeaForm } from "@/components/idea-form"
import { IdeasList } from "@/components/ideas-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import data from "@/app/dashboard/data.json"

export default function Page() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>

        <div className="px-4 lg:px-6">
          <Tabs defaultValue="ideas" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ideas">Business Ideas</TabsTrigger>
              <TabsTrigger value="data">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="ideas" className="space-y-6 mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <IdeaForm onSubmitSuccess={() => {
                    // Trigger a refresh of the ideas list
                    const event = new CustomEvent('ideaCreated');
                    window.dispatchEvent(event);
                  }} />
                </div>
                <div className="lg:sticky lg:top-6 h-fit">
                  <IdeasListWrapper />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="data" className="mt-6">
              <DataTable data={data} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

// Wrapper component to handle idea list refresh events
function IdeasListWrapper() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  React.useEffect(() => {
    const handleIdeaCreated = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('ideaCreated', handleIdeaCreated);

    return () => {
      window.removeEventListener('ideaCreated', handleIdeaCreated);
    };
  }, []);

  return <IdeasList refreshTrigger={refreshTrigger} />;
}