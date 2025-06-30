import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { App } from '../types';
import { fetchApps } from '../services/reviewService';
import FloatingChat from './FloatingChat';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { id } = router.query;
  
  useEffect(() => {
    const loadApps = async () => {
      setIsLoading(true);
      try {
        const appData = await fetchApps();
        setApps(appData);
      } catch (error) {
        console.error('Error loading apps:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApps();
  }, []);
  
  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-bold text-indigo-600">
                  Product Pulse
                </Link>
              </div>
              <nav className="ml-10 flex items-center space-x-4">
                <Link 
                  href="/" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    router.pathname === '/' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
                >
                  Apps
                </Link>
                <Link 
                  href="/submit-review" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    router.pathname === '/submit-review' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
                >
                  Submit Review
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex-grow flex">
        {/* Sidebar with app list */}
        <div className="w-64 min-w-64 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search apps..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <h2 className="text-lg font-medium text-gray-900 mb-2">Apps</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <ul className="space-y-1">
                {filteredApps.map((app) => (
                  <li key={app.id}>
                    <Link 
                      href={`/app/${app.id}`}
                      className={`block px-3 py-2 rounded-md text-sm ${
                        id === app.id
                          ? 'bg-indigo-100 text-indigo-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {app.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Main content */}
        <main className="flex-grow overflow-y-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Product Pulse. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Floating Chat Component */}
      <FloatingChat />
    </div>
  );
};

export default Layout; 