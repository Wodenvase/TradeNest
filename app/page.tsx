"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Bot,
  Globe,
  Shield,
  Zap,
  Package,
  FileText,
  CreditCard,
  Truck,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  BarChart3,
  Target,
  Sparkles,
  Award,
} from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: "AI-Powered Classification",
    description: "Intelligent product classification with Claude AI and Hugging Face for accurate HS codes and trade compliance.",
    color: "text-purple-600"
  },
  {
    icon: Package,
    title: "Smart Inventory Management",
    description: "Real-time inventory tracking with automated AI analysis and cross-component synchronization.",
    color: "text-blue-600"
  },
  {
    icon: FileText,
    title: "Automated Compliance",
    description: "Generate trade documents and ensure regulatory compliance with AI-powered document creation.",
    color: "text-green-600"
  },
  {
    icon: CreditCard,
    title: "Intelligent Billing",
    description: "Real-time tax calculations and duty assessments with Claude AI precision for global markets.",
    color: "text-yellow-600"
  },
  {
    icon: Truck,
    title: "Advanced Logistics",
    description: "Global shipment tracking with route optimization and carrier performance analytics.",
    color: "text-red-600"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade security with encrypted data transmission and secure API key management.",
    color: "text-indigo-600"
  }
];

const stats = [
  { label: "Countries Supported", value: "195+", icon: Globe },
  { label: "AI Accuracy Rate", value: "99.2%", icon: Target },
  { label: "Processing Speed", value: "2.3s", icon: Zap },
  { label: "Cost Savings", value: "47%", icon: TrendingUp }
];

const teamMembers = [
  {
    name: "Aaryan Soni",
    role: "Developer",
    avatar: "AS"
  },
  {
    name: "Dipanta Bhattacharyya",
    role: "Developer",
    avatar: "DB"
  },
  {
    name: "Aditya Sarkar",
    role: "Developer",
    avatar: "AS"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TradeNest
              </span>
            </motion.div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                    Launch Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="space-y-4" variants={itemVariants}>
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Global Trade Platform
              </Badge>
              
              <motion.h1 
                className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  TradeNest
                </span>
                <br />
                <span className="text-gray-900 dark:text-white">
                  Intelligent Trade
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Operations
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed"
                variants={itemVariants}
              >
                Revolutionize your global trade operations with cutting-edge AI technology. 
                From intelligent product classification to automated compliance and real-time logistics tracking.
              </motion.p>
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={itemVariants}
            >
              <Link href="/dashboard">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 text-lg">
                    <Bot className="w-5 h-5 mr-2" />
                    Start Trading Smarter
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16"
              variants={containerVariants}
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="text-center"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex justify-center mb-2">
                    <stat.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center space-y-4 mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Powerful Features for Modern Trade
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to manage global trade operations efficiently with AI-powered automation and intelligence.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 h-full">
                  <CardHeader>
                    <motion.div 
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center mb-4`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </motion.div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center space-y-4 mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Powered by Cutting-Edge AI
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Built with the latest AI technologies and modern web frameworks for unparalleled performance and accuracy.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
              <Card className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800">
                <motion.div 
                  className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Bot className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">Claude AI</h3>
                <p className="text-blue-700 dark:text-blue-300">Advanced language model for intelligent trade classification and document generation</p>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
              <Card className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border border-purple-200 dark:border-purple-800">
                <motion.div 
                  className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Zap className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-2">Hugging Face</h3>
                <p className="text-purple-700 dark:text-purple-300">State-of-the-art machine learning models for product analysis and classification</p>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
              <Card className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border border-green-200 dark:border-green-800">
                <motion.div 
                  className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Globe className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">Next.js</h3>
                <p className="text-green-700 dark:text-green-300">Modern React framework with server-side rendering and optimal performance</p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center space-y-4 mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The team behind TradeNest's innovative AI-powered trade platform.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {member.avatar}
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {member.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{member.role}</p>
                  <div className="flex justify-center">
                    <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
                      <Star className="w-3 h-3 mr-1 text-yellow-500" />
                      Team Member
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="p-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0 shadow-2xl">
              <div className="space-y-6">
                <motion.div 
                  className="flex justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Award className="w-16 h-16 text-yellow-300" />
                </motion.div>
                <h2 className="text-3xl sm:text-4xl font-bold">
                  Ready to Transform Your Trade Operations?
                </h2>
                <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                  Join the future of global trade with AI-powered automation, intelligent compliance, and real-time analytics.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/dashboard">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg px-8 py-4 text-lg font-semibold">
                        <Bot className="w-5 h-5 mr-2" />
                        Launch TradeNest
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div 
              className="flex items-center space-x-2 mb-4 md:mb-0"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">TradeNest</span>
            </motion.div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">
                © 2024 TradeNest. Built by Aaryan Soni, Dipanta Bhattacharyya, and Aditya Sarkar.
              </p>
              <p className="text-gray-500 text-sm mt-1">
                AI-Powered Global Trade Platform
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}