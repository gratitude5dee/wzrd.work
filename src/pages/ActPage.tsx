
import React from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import FadeIn from '../components/animations/FadeIn';
import ActInterface from '../components/act/ActInterface';

const ActPage: React.FC = () => {
  return (
    <DashboardLayout>
      <FadeIn>
        <div className="flex flex-col gap-6">
          <div className="aspect-video w-full rounded-lg overflow-hidden border border-border">
            <iframe
              src="https://tavus.daily.co/c21ffe433b5c"
              className="w-full h-full"
              allow="camera; microphone; fullscreen; speaker; display-capture"
              title="Tavus Meeting"
            />
          </div>
          
          <div className="flex flex-col gap-6 h-[calc(100vh-400px)]">
            <ActInterface />
          </div>
        </div>
      </FadeIn>
    </DashboardLayout>
  );
};

export default ActPage;
