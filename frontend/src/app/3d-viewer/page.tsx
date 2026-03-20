'use client';

import { useState } from 'react';
import { HairScene } from '@/components/three/HairScene';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ThreeDViewerPage() {
  const [sceneSettings, setSceneSettings] = useState({
    enableControls: true,
    backgroundColor: '#f0f0f0',
    cameraPosition: [5, 5, 5] as [number, number, number],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">3D Hair Viewer</h1>
            <p className="text-sm text-gray-600">Interactive 3D hair styling and preview</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              Reset View
            </Button>
            <Button variant="primary" size="sm">
              Save Design
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Controls Panel */}
        <aside className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Hair Style Section */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3">Hair Styles</h3>
              <div className="grid grid-cols-2 gap-2">
                {['Short', 'Medium', 'Long', 'Curly', 'Straight', 'Wavy'].map((style) => (
                  <Button
                    key={style}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {style}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Hair Color Section */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3">Hair Color</h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  '#8B4513', '#654321', '#DAA520', '#FFD700',
                  '#000000', '#2F4F4F', '#8B0000', '#FF6347'
                ].map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-colors"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      // Color change logic will go here
                    }}
                  />
                ))}
              </div>
            </Card>

            {/* Face Shape Analysis */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3">Face Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Face Shape:</span>
                  <span className="text-sm font-medium">Oval</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Skin Tone:</span>
                  <span className="text-sm font-medium">Medium</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Analyze Face
                </Button>
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3">AI Recommendations</h3>
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Layered Bob</p>
                  <p className="text-xs text-blue-700">Perfect for your face shape</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-900">Beach Waves</p>
                  <p className="text-xs text-purple-700">Trending this season</p>
                </div>
              </div>
            </Card>

            {/* Scene Settings */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3">Scene Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={sceneSettings.enableControls}
                    onChange={(e) =>
                      setSceneSettings(prev => ({
                        ...prev,
                        enableControls: e.target.checked
                      }))
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Enable Controls</span>
                </label>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Background</label>
                  <input
                    type="color"
                    value={sceneSettings.backgroundColor}
                    onChange={(e) =>
                      setSceneSettings(prev => ({
                        ...prev,
                        backgroundColor: e.target.value
                      }))
                    }
                    className="w-full h-8 rounded border border-gray-300"
                  />
                </div>
              </div>
            </Card>
          </div>
        </aside>

        {/* 3D Viewport */}
        <main className="flex-1 relative">
          <HairScene
            className="w-full h-full"
            enableControls={sceneSettings.enableControls}
            backgroundColor={sceneSettings.backgroundColor}
            cameraPosition={sceneSettings.cameraPosition}
          />
          
          {/* Viewport Controls Overlay */}
          <div className="absolute top-4 right-4 space-y-2">
            <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur">
              Screenshot
            </Button>
            <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur block">
              Fullscreen
            </Button>
          </div>

          {/* Loading Indicator */}
          <div className="absolute bottom-4 left-4">
            <div className="bg-white/90 backdrop-blur px-3 py-2 rounded-lg text-sm text-gray-600">
              🎨 3D Hair Viewer - Interactive Mode
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}