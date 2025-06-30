import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { App } from '../types';
import StarRating from './StarRating';

interface AppCardProps {
  app: App;
}

const AppCard: React.FC<AppCardProps> = ({ app }) => {
  return (
    <Link 
      href={`/app/${app.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {app.icon ? (
              <Image
                src={app.icon}
                alt={`${app.name} icon`}
                width={48}
                height={48}
                className="rounded-md"
              />
            ) : (
              <div className="w-12 h-12 bg-indigo-100 rounded-md flex items-center justify-center">
                <span className="text-indigo-600 text-lg font-semibold">
                  {app.name.substring(0, 1)}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">{app.name}</h3>
            <div className="flex items-center mt-1">
              <StarRating rating={app.averageRating || 0} size="sm" />
              <span className="ml-2 text-sm text-gray-500">
                ({app.totalReviews || 0} reviews)
              </span>
            </div>
          </div>
          <div className="ml-auto">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              app.platform === 'ios' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {app.platform === 'ios' ? 'iOS' : 'Android'}
            </span>
          </div>
        </div>
        
        {app.topPainPoints && app.topPainPoints.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700">Top Pain Points:</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {app.topPainPoints.slice(0, 3).map((painPoint, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                >
                  {painPoint}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default AppCard; 