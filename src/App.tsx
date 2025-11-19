import React, { useEffect } from "react";
import { Toaster } from "./components/ui/toaster.tsx";
import { Toaster as Sonner } from "./components/ui/sonner.tsx";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { GlobalGridBackground } from "@/components/GlobalGridBackground";


import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Tests from "./pages/Tests";
import StudyResources from "./pages/StudyResources";
import RequestResource from "./pages/RequestResource";
import Results from "./pages/Results";
import CreateTest from "./pages/CreateTest";
import EditTest from "./pages/EditTest";
import TakeTest from "./pages/TakeTest";
import TestResults from "./pages/TestResults";
import TestAnalysis from "./pages/TestAnalysis";
import Attendance from "./pages/Attendance";
import { AttendanceManagement } from "./pages/AttendanceManagement";
import StudentPortal from "./pages/StudentPortal";
import TestData from "./pages/TestData";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Support from "./pages/Support";
import CalendarPage from "./pages/CalendarPage";
import ModernCalendar from "./pages/ModernCalendar";
import Complaints from "./pages/Complaints";
import Timeline from "./pages/Timeline";
import GoogleEffect from "./pages/googleeffect";
import Settings from "./pages/Settings";
import Teams from "./pages/teams.tsx";
import AILearning from "./pages/AILearning";
import Library from "./pages/Library";
import MyLibrary from "./pages/MyLibrary";
import { Analytics } from '@vercel/analytics/react';


const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    (function () {
      // @ts-ignore - Chatbase widget initialization
      if (!window.chatbase || window.chatbase("getState") !== "initialized") {
        // @ts-ignore
        window.chatbase = (...args: any[]) => {
          // @ts-ignore
          if (!window.chatbase.q) window.chatbase.q = [];
          // @ts-ignore
          window.chatbase.q.push(args);
        };
        // @ts-ignore
        window.chatbase = new Proxy(window.chatbase, {
          get(target, prop) {
            if (prop === "q") return target.q;
            return (...args: any[]) => target(prop, ...args);
          },
        });
      }

      const onLoad = function () {
        const script = document.createElement("script");
        script.src = "https://www.chatbase.co/embed.min.js";
        script.id = "yDJzkof7WYNoBCst-Qb-S";
        script.setAttribute("domain", "www.chatbase.co");
        document.body.appendChild(script);
      };

      if (document.readyState === "complete") {
        onLoad();
      } else {
        window.addEventListener("load", onLoad);
      }
    })();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <GlobalGridBackground>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/tests" element={<ProtectedRoute><Tests /></ProtectedRoute>} />
                <Route path="/study-resources" element={<ProtectedRoute><StudyResources /></ProtectedRoute>} />
                <Route path="/request-resource" element={<ProtectedRoute><RequestResource /></ProtectedRoute>} />
                <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
                <Route path="/create-test" element={<ProtectedRoute><CreateTest /></ProtectedRoute>} />
                <Route path="/edit-test/:testId" element={<ProtectedRoute><EditTest /></ProtectedRoute>} />
                <Route path="/take-test/:testId" element={<ProtectedRoute><TakeTest /></ProtectedRoute>} />
                <Route path="/test-results/:testId" element={<ProtectedRoute><TestResults /></ProtectedRoute>} />
                <Route path="/test-analysis/:attemptId" element={<ProtectedRoute><TestAnalysis /></ProtectedRoute>} />
                <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
                <Route path="/attendance-management" element={<ProtectedRoute><AttendanceManagement /></ProtectedRoute>} />
                <Route path="/student-portal" element={<ProtectedRoute><StudentPortal /></ProtectedRoute>} />
                <Route path="/test-data" element={<ProtectedRoute><TestData /></ProtectedRoute>} />
                <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/support" element={<Support />} />
                <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                <Route path="/modern-calendar" element={<ProtectedRoute><ModernCalendar /></ProtectedRoute>} />
                <Route path="/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
                <Route path="/googleeffect" element={<GoogleEffect />} />
                <Route path="/calendarpage" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
                <Route path="/ai-learning" element={<ProtectedRoute><AILearning /></ProtectedRoute>} />
                <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
                <Route path="/my-library" element={<ProtectedRoute><MyLibrary /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Analytics />
            </BrowserRouter>
          </GlobalGridBackground>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
