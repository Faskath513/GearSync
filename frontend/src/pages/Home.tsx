import React, { useState } from "react";
import { Car, Wrench, Calendar, Clock, Users, MessageCircle, CheckCircle, ArrowRight, Phone, Mail, MapPin } from "lucide-react";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import ChatWidget from "../components/ChatWidget"; 

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState('login');

  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Easy Appointment Booking",
      description: "Schedule your vehicle service with our convenient online booking system"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Real-Time Progress Tracking",
      description: "Monitor your service progress live with instant updates and notifications"
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: "Professional Service",
      description: "Expert technicians with certified training and quality guaranteed work"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "AI Assistant",
      description: "Get instant help with our smart chatbot for appointment availability"
    }
  ];

  const services = [
    "Oil Change & Filter Replacement",
    "Brake Inspection & Repair",
    "Engine Diagnostics",
    "Transmission Service",
    "AC System Maintenance",
    "Tire Rotation & Alignment",
    "Battery Testing & Replacement",
    "Custom Modifications"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-purple-500 rounded-full opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl">
              <Car className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">AutoService Pro</span>
          </div>
          <div className="hidden md:flex space-x-8 text-white">
            <a href="#services" className="hover:text-blue-300 transition-colors">Services</a>
            <a href="#about" className="hover:text-blue-300 transition-colors">About</a>
            <a href="#contact" className="hover:text-blue-300 transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side - Hero Content */}
          <div className="text-white space-y-8">
            <div className="space-y-6">
              <h1 className="text-6xl font-extrabold leading-tight">
                Your Vehicle's
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  Service Partner
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                Professional automobile service management with real-time tracking, easy appointment booking, and expert technician support.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-6 mt-12">
              {features.map((feature, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="text-blue-400 mb-3">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Services List */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <Wrench className="w-6 h-6 mr-3 text-blue-400" />
                Our Services
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center space-x-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm">{service}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Authentication Forms */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
            {/* Tab Buttons */}
            <div className="flex border-b border-white/20">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${
                  activeTab === 'login' 
                    ? 'text-white bg-blue-600/30 border-b-2 border-blue-400' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-5 h-5 inline-block mr-2" />
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${
                  activeTab === 'register' 
                    ? 'text-white bg-green-600/30 border-b-2 border-green-400' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <ArrowRight className="w-5 h-5 inline-block mr-2" />
                Register
              </button>
            </div>

            {/* Form Content */}
            <div className="p-8">
              {activeTab === 'login' ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-gray-300">Sign in to track your vehicle's service progress</p>
                  </div>
                  <LoginForm />
                
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">Join AutoService Pro</h2>
                    <p className="text-gray-300">Create your account to start managing your vehicle services</p>
                  </div>
                  <RegisterForm />
                  <div className="text-center text-sm text-gray-400">
                    By registering, you agree to our{' '}
                    <a href="#" className="text-blue-400 hover:underline">Terms of Service</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto mt-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center text-white">
              <div className="text-4xl font-bold text-blue-400 mb-2">15K+</div>
              <div className="text-gray-300">Vehicles Serviced</div>
            </div>
            <div className="text-center text-white">
              <div className="text-4xl font-bold text-green-400 mb-2">98%</div>
              <div className="text-gray-300">Customer Satisfaction</div>
            </div>
            <div className="text-center text-white">
              <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-gray-300">Support Available</div>
            </div>
            <div className="text-center text-white">
              <div className="text-4xl font-bold text-yellow-400 mb-2">50+</div>
              <div className="text-gray-300">Expert Technicians</div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="max-w-7xl mx-auto mt-16">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="grid md:grid-cols-3 gap-8 text-white">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-500/20 p-3 rounded-xl">
                  <Phone className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Call Us</h3>
                  <p className="text-gray-300">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-green-500/20 p-3 rounded-xl">
                  <Mail className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Email Us</h3>
                  <p className="text-gray-300">support@autoservicepro.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-purple-500/20 p-3 rounded-xl">
                  <MapPin className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Visit Us</h3>
                  <p className="text-gray-300">123 Service Center Ave</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Chatbot */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-pink-500/25 transform hover:scale-110 transition-all duration-300 group">
          <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Chat Widget */}
      <ChatWidget />

      {/* Animated Car Icon */}
      <div className="fixed bottom-0 left-0 w-full h-32 pointer-events-none overflow-hidden">
        <div className="absolute bottom-8 -left-20 animate-bounce" style={{animationDuration: '3s'}}>
          <Car className="w-16 h-16 text-blue-400/30 transform rotate-90" />
        </div>
      </div>
    </div>
  );
};

export default Home;