
import React, { useState } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import FadeIn from '../components/animations/FadeIn';
import ActivityTab from '../components/activity/ActivityTab';

const ActivityPage: React.FC = () => {
  return (
    <DashboardLayout>
      <FadeIn>
        <div className="flex flex-col gap-6 h-[calc(100vh-120px)]">
          <ActivityTab />
        </div>
      </FadeIn>
    </DashboardLayout>
  );
};

export default ActivityPage;
