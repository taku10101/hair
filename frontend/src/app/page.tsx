'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* ヘロセクション */}
        <section className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            HairVision 3D
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Revolutionary hair styling platform combining 3D modeling, AI analysis, and real-time collaboration with stylists.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.location.href = '/3d-viewer'}
              loading={isLoading}
            >
              Start 3D Hair Simulation
            </Button>
            <Button
              variant="secondary"
              size="lg"
            >
              Find Stylists
            </Button>
          </div>
        </section>

        {/* 機能紹介 */}
        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎭</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">3D Hair Simulation</h3>
            <p className="text-gray-600">
              Realistic hair modeling and physics simulation with advanced 3D technology.
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">AI Face Analysis</h3>
            <p className="text-gray-600">
              Automatic face recognition and personalized style recommendations.
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Stylist Collaboration</h3>
            <p className="text-gray-600">
              Real-time chat and booking with professional stylists.
            </p>
          </Card>
        </section>

        {/* 3Dプレビューセクション */}
        <section className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Experience the Future of Hair Styling</h2>
          <Card className="p-8 bg-gray-50">
            <div className="h-96 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl mb-4 block">🎨</span>
                <p className="text-xl text-gray-600">3D Hair Viewer</p>
                <p className="text-sm text-gray-500 mt-2">Coming Soon - Interactive 3D Hair Modeling</p>
              </div>
            </div>
          </Card>
        </section>

        {/* 統計セクション */}
        <section className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600">95%</div>
            <div className="text-gray-600">AI Accuracy</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600">60FPS</div>
            <div className="text-gray-600">3D Rendering</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">1000+</div>
            <div className="text-gray-600">Partner Salons</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600">500K</div>
            <div className="text-gray-600">Happy Users</div>
          </div>
        </section>
      </div>
    </main>
  );
}