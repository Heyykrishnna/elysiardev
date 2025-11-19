import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Sparkles, Users, Target, TrendingUp, Heart } from 'lucide-react';

const FeatureShowcase = () => {
  const features = [
    {
      icon: CheckCircle,
      title: "Smart Assessment",
      description: "AI-powered question generation and automatic grading",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: Users,
      title: "Collaborative Learning",
      description: "Connect with peers and share knowledge seamlessly",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: Target,
      title: "Personalized Path",
      description: "Adaptive learning tailored to your unique needs",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: TrendingUp,
      title: "Real-time Analytics",
      description: "Track progress with detailed insights and reports",
      color: "from-orange-400 to-red-500"
    }
  ];

  return (
    <div className="py-16 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wide">Why Choose Us</h3>
          </div>
          <h2 className="text-4xl leading-snug lg:text-5xl font-bold bg-gradient-to-r from-purple-800 via-pink-700 to-blue-800 bg-clip-text text-transparent mb-4">
            Revolutionary Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover what makes our platform the perfect choice for modern education
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group relative overflow-hidden border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              {/* Animated border */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} style={{
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'xor',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                padding: '2px'
              }}></div>

              <CardContent className="relative p-8 text-center">
                {/* Icon */}
                <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <h4 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-purple-800 transition-colors duration-300">
                  {feature.title}
                </h4>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>

                {/* Hover decoration */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-16 transition-all duration-300 rounded-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <Heart className="h-5 w-5 text-pink-500 animate-pulse" />
            <span className="font-semibold text-gray-700">Ready to transform your learning experience?</span>
            <Heart className="h-5 w-5 text-pink-500 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;
