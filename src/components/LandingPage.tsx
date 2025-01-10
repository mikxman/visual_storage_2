import { FC } from 'react';
import CanvasBackground from './CanvasBackground';
import Auth from './Auth';

const LandingPage: FC = () => {
  return (
    <div className="min-h-screen relative">
      <CanvasBackground />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Visual Storage
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            A beautiful way to visualize and manage your inventory. Track items, monitor quantities, 
            and gain insights through interactive visualizations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <FeatureCard 
              title="Track Items" 
              description="Easily manage your inventory with a simple and intuitive interface."
            />
            <FeatureCard 
              title="Visualize Data" 
              description="See your data come to life with interactive charts and graphs."
            />
            <FeatureCard 
              title="Stay Organized" 
              description="Keep everything organized by categories and locations."
            />
          </div>
        </div>
        <Auth />
      </div>
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
}

const FeatureCard: FC<FeatureCardProps> = ({ title, description }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default LandingPage;