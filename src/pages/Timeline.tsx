import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BackToDashboard } from '@/components/BackToDashboard';
import { Layout } from '@/components/Layout';
import { PointerHighlightDemo } from "@/components/HighlightedText";
import { TimelineDemo } from "@/components/Transformjourney";

const Timeline = () => {
    return (
      <Layout backgroundVariant="default">
        <div className="max-w-6xl mx-auto px-6 py-8 bg-background/80 backdrop-blur-sm rounded-lg">
          {/* Header */}
          <div className="mb-8">
            <BackToDashboard />
          </div>

          <div className="text-center mb-12">
            <PointerHighlightDemo/>
          </div>

          <TimelineDemo />
  
          {/* Footer */}
          <div className="mt-12 text-center">
            <Link to="/">
              <Button>
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  };
  
export default Timeline;
  