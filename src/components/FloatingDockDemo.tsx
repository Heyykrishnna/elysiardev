import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  Home,
  FileText,
  BookOpen,
  Award,
  Calendar,
  Users,
  User,
  Settings,
  MessageCircle,
  Brain,
  Atom,
  Library
} from "lucide-react";

export default function FloatingDockDemo() {
  const links = [
    {
      title: "Dashboard",
      icon: (
        <Home className="h-full w-full text-white dark:text-white" />
      ),
      href: "/",
    },
    {
      title: "Tests",
      icon: (
        <FileText className="h-full w-full text-white dark:text-white" />
      ),
      href: "/tests",
    },
    {
      title: "Resources", 
      icon: (
        <Library className="h-full w-full text-white dark:text-white" />
      ),
      href: "/study-resources",
    },
    {
      title: "AI Learning Hub",
      icon: (
        <Atom className="h-full w-full text-white dark:text-white" />
      ),
      href: "/ai-learning",
    },
    {
      title: "Results",
      icon: (
        <Award className="h-full w-full text-white dark:text-white" />
      ),
      href: "/results",
    },
    {
      title: "Calendar",
      icon: (
        <Calendar className="h-full w-full text-white dark:text-white" />
      ),
      href: "/modern-calendar",
    },
    {
      title: "Attendance",
      icon: (
        <User className="h-full w-full text-white dark:text-white" />
      ),
      href: "/attendance",
    },
    {
      title: "Support",
      icon: (
        <MessageCircle className="h-full w-full text-white dark:text-white" />
      ),
      href: "/support",
    },
    {
      title: "Settings",
      icon: (
        <Settings className="h-full w-full text-white dark:text-white" />
      ),
      href: "/settings",
    },
    {
      title: "Our Team",
      icon: (
        <Users className="h-full w-full text-white dark:text-white" />
      ),
      href: "/teams",
    },
  ];
  
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <FloatingDock items={links} />
    </div>
  );
}