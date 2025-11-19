import { motion } from "motion/react"
import { useState } from "react"
import { 
  BookOpen, 
  Mail, 
  Send, 
  Heart, 
  Star, 
  Users, 
  Trophy, 
  TrendingUp,
  Github,
  Twitter,
  Linkedin,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Award,
  Zap,
  Target
} from "lucide-react"
import { Link } from "react-router-dom"

interface BeautifulFooterProps {
  companyName?: string
  description?: string
  stats?: {
    users: string
    tests: string
    uptime: string
    rating: string
  }
}

export function BeautifulFooter({
  companyName = "Elysiar",
  description = "Transforming education through intelligent assessment technology. Where learning meets innovation.",
  
}: BeautifulFooterProps) {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubscribed(true)
    setIsSubmitting(false)
    setEmail("")
    
    // Reset after 3 seconds
    setTimeout(() => setIsSubscribed(false), 3000)
  }

  const features = [
    { icon: BookOpen, text: "Smart Learning", color: "text-blue-400" },
    { icon: Users, text: "Collaborative", color: "text-green-400" },
    { icon: Trophy, text: "Achievement Focused", color: "text-yellow-400" },
    { icon: TrendingUp, text: "Performance Insights", color: "text-purple-400" },
    { icon: Target, text: "Goal Oriented", color: "text-red-400" },
    { icon: Zap, text: "Lightning Fast", color: "text-orange-400" }
  ]

  const quickLinks = [
    { name: "Attendance", path: "/attendance" },
    { name: "Tests", path: "/tests" },
    { name: "Study Resources", path: "/study-resources" },
    { name: "Calendar and Events", path: "/modern-calendar" },
    { name: "Complaint", path: "/complaints" }
  ]

  const companyLinks = [
    { name: "Timeline", path: "/timeline" },
    { name: "GitHub", path: "https://github.com/Heyykrishnna" },
    { name: "Feedback Form", path: "https://forms.gle/2RKCzkY6U1gfzefb9" },
    { name: "Our Team", path: "/teams" }
  ]

  const supportLinks = [
    { name: "Support", path: "/support" },
    { name: "Terms And Conditions", path: "/terms" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Chatbot", path: "https://www.chatbase.co/chatbot-iframe/yDJzkof7WYNoBCst-Qb-S" }
  ]

  const socialLinks = [
    { icon: Twitter, url: "https://x.com/hey_krishnna", color: "hover:text-blue-400" },
    { icon: Linkedin, url: "https://www.linkedin.com/in/yatharth-khandelwal-krishna/", color: "hover:text-blue-600" },
    { icon: Github, url: "https://github.com/Heyykrishnna", color: "hover:text-purple-400" },
    { icon: MessageCircle, url: "mailto:yatharth.k25530@nst.rishihood.edu.in", color: "hover:text-indigo-400" }
  ]

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 border-t border-gray-700/50">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />
        
        {/* Floating Particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-gray-100">
        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="py-12 border-b border-gray-700/50"
        >

        </motion.div>

        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-2"

            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center shadow-lg shadow-grey">
                  <img src="logo-Elysiar.jpeg" className="rounded-xl"/>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-100">
                    {companyName}
                  </h3>
                </div>
              </div>
              
              <p className="text-gray-300 mb-8 leading-relaxed max-w-md">
                {description}
              </p>


              {/* Social Links */}
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 flex items-center justify-center text-gray-400 ${social.color} transition-all duration-300 hover:scale-110 hover:bg-gray-700/50`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Links Sections */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
              {/* Product Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <h4 className="text-gray-100 font-semibold mb-4 text-sm uppercase tracking-wider">
                  Features
                </h4>
                <ul className="space-y-3">
                  {quickLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="text-gray-400 hover:text-gray-100 transition-colors duration-300 text-sm flex items-center group"
                      >
                        <span>{link.name}</span>
                        <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Company Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h4 className="text-gray-100 font-semibold mb-4 text-sm uppercase tracking-wider">
                  Community
                </h4>
                <ul className="space-y-3">
                  {companyLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="text-gray-400 hover:text-gray-100 transition-colors duration-300 text-sm flex items-center group"
                      >
                        <span>{link.name}</span>
                        <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Support Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h4 className="text-gray-100 font-semibold mb-4 text-sm uppercase tracking-wider">
                  Support
                </h4>
                <ul className="space-y-3">
                  {supportLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="text-gray-400 hover:text-gray-100 transition-colors duration-300 text-sm flex items-center group"
                      >
                        <span>{link.name}</span>
                        <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="py-8 border-t border-gray-700/50"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <p className="text-gray-300 text-sm text-center md:text-left">
                © 2025 {companyName}.
              </p>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Award className="w-3 h-3 text-green-400" />
                <span>Version 3.2.3</span>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Custom CSS for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(120deg); }
          66% { transform: translateY(5px) rotate(240deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </footer>
  )
}