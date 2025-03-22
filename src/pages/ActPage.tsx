
import React from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import FadeIn from '../components/animations/FadeIn';
import ActInterface from '../components/act/ActInterface';

const ActPage: React.FC = () => {
  return (
    <DashboardLayout>
      <FadeIn>
        <div className="flex flex-col gap-6 h-[calc(100vh-120px)]">
          <ActInterface />
        </div>
      </FadeIn>
    </DashboardLayout>
  );
};

export default ActPage;
