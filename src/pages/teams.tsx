import "./../styles/raleway.css";
import React, { useState } from 'react';
import { Users, Linkedin, Mail, BookOpen, Instagram } from 'lucide-react';
import { BackToDashboard } from '@/components/BackToDashboard';

export default function TeamPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Team' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'engineering', label: 'Engineering' },
    { id: 'science', label: 'Science' },
    { id: 'design', label: 'Design' },
    { id: 'other', label: 'Other' }
  ];

  const teamMembers = [
    {
      name: 'Yatharth Khandelwal',
      role: 'Founder, CEO, Elysiar',
      department: 'leadership',
      image: 'https://i.pinimg.com/736x/20/8a/f5/208af563619a1929732961a53ff93835.jpg',
      linkedin: 'https://www.linkedin.com/in/yatharth-khandelwal-krishna/',
      instagram: 'https://www.instagram.com/heyy_krishnna/',
      email: 'mailto:yatharth.k25530@nst.rishihood.edu.in'
    },
    {
      name: 'Priyanshu Sharma',
      role: 'Frontend Dev, Elysiar',
      department: 'engineering',
      image: 'https://i.ibb.co/6RJZJRFv/Whats-App-Image-2025-10-28-at-22-32-23.jpg',
      linkedin: 'https://www.linkedin.com/in/priyanshu-sharma-7356b0380/',
      instagram: 'https://www.instagram.com/priyanshu_37522',
      email: 'mailto:priyanshu.s25358@nst.rishihood.edu.in'
    },
    {
      name: 'Allison Pick',
      role: 'COO, Elysiar',
      department: 'leadership',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com',
      email: 'mailto:allison@quizoasis.com'
    },
    {
      name: 'Kyle Hoffman',
      role: 'Lead Designer',
      department: 'design',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop',
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com',
      email: 'mailto:kyle@quizoasis.com'
    },
    {
      name: 'Julie Power',
      role: 'Head of Product',
      department: 'leadership',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com',
      email: 'mailto:julie@quizoasis.com'
    },
    {
      name: 'Sergey Lyshachenko, PhD',
      role: 'Research Scientist',
      department: 'science',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com',
      email: 'mailto:sergey@quizoasis.com'
    },
    {
      name: 'Maya Patel',
      role: 'Senior Engineer',
      department: 'engineering',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com',
      email: 'mailto:maya@quizoasis.com'
    },
    {
      name: 'David Chen',
      role: 'UX Designer',
      department: 'design',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com',
      email: 'mailto:david@quizoasis.com'
    },
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      department: 'other',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop',
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com',
      email: 'mailto:sarah@quizoasis.com'
    }
  ];

  const filteredMembers = selectedFilter === 'all' 
    ? teamMembers 
    : teamMembers.filter(member => member.department === selectedFilter);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: "Raleway, sans-serif", fontStyle: "italic" }}>Elysiar</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-6xl md:text-7xl font-bold text-white">
                Meet Our<br />Team
              </h1>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSdRYpO5CwE1ZTEC516SdbPGtEc94VGJpYKVkfNs2dH_A-37fg/viewform?usp=dialog"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold transition-all duration-300"
              >
                Join Us
              </a>
            </div>
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedFilter === filter.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member, index) => (
              <div
                key={index}
                className="group relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-500 hover:-translate-y-2"
              >
                {/* Image Container */}
                <div className="relative h-80 overflow-hidden bg-gray-800">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Social Icons */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-colors"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                    <a
                      href={member.email}
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1 text-white">
                    {member.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{member.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredMembers.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No team members found in this category.</p>
            </div>
          )}
           <div className="mt-12 flex justify-center items-center">
            <BackToDashboard />
          </div>
        </div>
      </div>
    </div>
  );
}