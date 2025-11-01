import React, { useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

const heroImages = [
  'https://www.shutterstock.com/image-photo/car-service-manager-mechanic-uses-260nw-1711144915.jpg',
  'https://www.shutterstock.com/image-photo/car-service-manager-mechanic-running-260nw-1711212040.jpg',   
  'https://www.cnautoelectronics.com/assets/img/gallery/gallery-3-848x439.jpg',
];

function useRevealOnScroll() {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('in-view');
        });
      },
      { threshold: 0.15 }
    );
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navBg = scrolled ? 'bg-[#0D1321]/95 backdrop-blur-md border-b border-white/10 shadow-lg' : 'bg-[#0D1321]/30 backdrop-blur-sm border-b border-white/5';

  const navItems = [
    { href: '#about', label: 'About' },
    { href: '#services', label: 'Services' },
    { href: '#benefits', label: 'Benefits' },
    // { href: '#reviews', label: 'Reviews' },
    // { href: '#contact', label: 'Contact' },
  ];

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navBg}`}> 
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href="#top" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c]" />
            <span className="text-lg font-bold tracking-tight text-white">Gear Sync</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <a key={item.href} href={item.href} className="text-sm font-medium text-white hover:text-[#f97316] transition-colors">
                {item.label}
              </a>
            ))}
            <a href="#about" className="rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ea580c] transition-colors shadow-lg">Login</a>
          </div>
          <button
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10"
            aria-label="Toggle Menu"
            onClick={() => setOpen(o => !o)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {open && (
          <div className="md:hidden pb-4 space-y-2 bg-[#0D1321]/95 backdrop-blur-md">
            {navItems.map(item => (
              <a key={item.href} href={item.href} className="block rounded-md px-3 py-2 text-white hover:bg-white/10 font-medium" onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ))}
            <a href="#about" className="block rounded-md bg-[#f97316] px-3 py-2 text-sm font-semibold text-white hover:bg-[#ea580c]" onClick={() => setOpen(false)}>Login</a>
          </div>
        )}
      </nav>
    </header>
  );
}

function Hero() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start', duration: 20 });
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!emblaApi) return;
    const play = () => {
      if (!emblaApi) return;
      emblaApi.scrollNext();
    };
    intervalRef.current = window.setInterval(play, 4000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [emblaApi]);

  return (
    <section id="top" className="relative h-screen min-h-[600px] w-full">
      <div className="absolute inset-0" ref={emblaRef}>
        <div className="flex h-full">
          {heroImages.map((src, i) => (
            <div key={i} className="relative min-w-0 shrink-0 grow-0 basis-full h-full">
              <img src={src} alt="Auto service" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1321] via-[#0D1321]/70 to-transparent" />
            </div>
          ))}
        </div>
      </div>
      <div className="relative z-10 h-full">
        <div className="mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/25">Modern Auto Workshop Suite</span>
            <h1 className="mt-4 text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
              Smart Solutions for Modern Auto Workshops
            </h1>
            <p className="mt-4 text-[#B0B8C4] max-w-xl leading-relaxed">
              Your Car, Our Care. Streamline bookings, track services in real time, and delight customers.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a href="#about" className="inline-flex justify-center rounded-md bg-[#f97316] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#ea580c] transition">Get Started</a>
              <a href="#services" className="inline-flex justify-center rounded-md border border-white/40 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition">Learn More</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
    return (
      <section
        id="about"
        className="reveal py-24 sm:py-28 lg:py-32 bg-gradient-to-br from-[#fff7ed] via-[#fef3c7] to-[#f97316]/10 relative overflow-hidden"
      >
        {/* subtle glowing background pattern */}
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(80%_60%_at_20%_20%,#ffffff_0%,transparent_70%)]" />
  
        <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* --- LEFT TEXT CONTENT --- */}
            <div className="text-slate-800">
              <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200 shadow-sm">
                Power your service operations
              </span>
  
              <h2 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
                About <span className="text-[#f97316]">GearSync</span>
              </h2>
  
              <p className="mt-4 text-slate-700 leading-relaxed text-[1.05rem]">
                GearSync transforms traditional automobile service management into a connected, intelligent experience.
                From booking to billing, every process is streamlined — empowering advisors, technicians, and customers
                with real-time transparency, faster operations, and smarter decisions.
              </p>
  
              {/* --- FEATURES GRID --- */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5 text-slate-700">
                {[
                  {
                    title: "Real-time visibility",
                    desc: "Live job cards, instant alerts, and status tracking.",
                  },
                  {
                    title: "Faster turnarounds",
                    desc: "Smart approvals, efficient task routing, and fewer delays.",
                  },
                  {
                    title: "Inventory control",
                    desc: "Track part usage, get low-stock alerts, and manage easily.",
                  },
                  {
                    title: "Transparent billing",
                    desc: "Accurate estimates, digital invoicing, and secure payments.",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-xl bg-white/80 backdrop-blur-sm p-5 ring-1 ring-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="mt-1 h-5 w-5 shrink-0 rounded-full bg-[#f97316]" />
                    <div>
                      <div className="font-semibold text-slate-900">{item.title}</div>
                      <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
  
              {/* --- CTA BUTTONS --- */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <a
                  href="#services"
                  className="inline-flex justify-center rounded-lg bg-[#f97316] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#ea580c] transition duration-300"
                >
                  Explore Services
                </a>
                <a
                  href="#contact"
                  className="inline-flex justify-center rounded-lg border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-white transition duration-300"
                >
                  Talk to us
                </a>
              </div>
            </div>
  
            {/* --- RIGHT IMAGE CONTENT --- */}
            <div className="relative">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-xl ring-1 ring-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop"
                  alt="Workshop"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1321]/40 to-transparent" />
              </div>
  
              {/* --- METRICS CARD --- */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-8">
                <div className="grid grid-cols-3 divide-x divide-white/10 overflow-hidden rounded-2xl bg-[#0D1321]/95 text-white shadow-xl ring-1 ring-white/10 backdrop-blur-md">
                  {[
                    { value: "10k+", label: "Bookings/month" },
                    { value: "99.9%", label: "Uptime" },
                    { value: "4.9★", label: "Avg. Rating" },
                  ].map((stat, i) => (
                    <div key={i} className="px-6 py-4 text-center">
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-white/70">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  
  


const services = [
  { 
    icon: 'calendar', 
    title: 'Service Booking', 
    desc: 'Enable customers to schedule appointments online 24/7 with instant confirmations, SMS reminders, and calendar integration.',
    features: ['Online scheduling', 'Automated reminders', 'Calendar sync']
  },
  { 
    icon: 'wrench', 
    title: 'Mechanic Management', 
    desc: 'Optimize technician assignments with skill-based routing, real-time job tracking, and workload balancing for maximum efficiency.',
    features: ['Skill matching', 'Job assignment', 'Progress tracking']
  },
  { 
    icon: 'boxes', 
    title: 'Inventory Management', 
    desc: 'Track spare parts in real-time with automated low-stock alerts, usage analytics, and integrated supplier management.',
    features: ['Stock tracking', 'Auto alerts', 'Usage reports']
  },
  { 
    icon: 'receipt', 
    title: 'Smart Billing', 
    desc: 'Generate transparent invoices with itemized costs, support multiple payment methods, and provide digital receipts instantly.',
    features: ['Digital invoices', 'Multiple payments', 'Instant receipts']
  },
  { 
    icon: 'chart', 
    title: 'Analytics Dashboard', 
    desc: 'Get actionable insights with comprehensive KPIs, revenue reports, service trends, and performance metrics at a glance.',
    features: ['Real-time KPIs', 'Revenue reports', 'Trend analysis']
  },
  { 
    icon: 'users', 
    title: 'Customer Portal', 
    desc: 'Empower customers with self-service access to view service history, track current jobs, and manage vehicle profiles.',
    features: ['Service history', 'Live tracking', 'Profile management']
  },
] as const;

function Icon({ name }: { name: typeof services[number]['icon'] }) {
  const common = 'h-6 w-6';
  switch (name) {
    case 'calendar':
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2z"/></svg>
      );
    case 'wrench':
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.7 6.3a4 4 0 0 0-5.66 5.66l7.07 7.07a2 2 0 1 0 2.83-2.83L11.88 9.16a4 4 0 0 0 2.83-2.83z"/></svg>
      );
    case 'boxes':
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7l9 4 9-4-9-4-9 4zm0 5l9 4 9-4M3 17l9 4 9-4"/></svg>
      );
    case 'receipt':
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h10M7 11h10M7 15h7M5 21l1-1 1 1 1-1 1 1 1-1 1 1 1-1 1 1 1-1 1 1V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16z"/></svg>
      );
    case 'chart':
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3v18h18M7 13v5m5-9v9m5-13v13"/></svg>
      );
    case 'users':
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2m14-10a4 4 0 1 0-8 0 4 4 0 0 0 8 0zm6 10v-2a4 4 0 0 0-3-3.87"/></svg>
      );
  }
}

// 🔧 SERVICES SECTION
function Services() {
    return (
      <section id="services" className="reveal py-20 sm:py-24 lg:py-28 bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#0f172a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-16">
            <span className="inline-flex items-center rounded-full bg-[#f97316]/10 px-4 py-1 text-xs font-medium text-[#f97316] ring-1 ring-[#f97316]/30">
              Comprehensive Solutions
            </span>
            <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold text-white">
              Our <span className="text-[#f97316]">Services</span>
            </h2>
            <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Everything you need to run a modern, efficient automobile service center — smart, transparent, and fully automated.
            </p>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s) => (
              <div
                key={s.title}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#475569] to-[#334155] p-8 shadow-xl ring-1 ring-slate-600/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:ring-[#f97316]/40"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#f97316]/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon name={s.icon} />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-white group-hover:text-[#f97316] transition-colors">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-sm text-slate-200 leading-relaxed">{s.desc}</p>
                  <ul className="mt-6 pt-4 border-t border-slate-500 space-y-2 text-left">
                    {s.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-200">
                        <svg className="h-4 w-4 text-[#f97316]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
  
          <div className="mt-16">
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-[#f97316] to-[#ea580c] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-[#f97316]/40 hover:scale-105 transition-all duration-300 gap-2"
            >
              Explore All Features
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    );
  }
  
  // 💎 BENEFITS SECTION
  function Benefits() {
    const benefits = [
      'Real-Time Updates',
      'Online Service Booking',
      'Expert Technicians',
      'Transparent Billing',
      'Analytics Dashboard',
      'Customer Satisfaction Guaranteed',
    ];
  
    return (
      <section id="benefits" className="py-28 sm:py-32 lg:py-36 bg-gradient-to-br from-[#fff7ed] via-[#fef3c7] to-[#fde68a]/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Why Choose <span className="text-[#f97316]">Gear Sync</span>?
          </h2>
          <p className="mt-4 text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed">
            Experience the future of vehicle maintenance with fast, transparent, and intelligent service management.
          </p>
  
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#f97316]/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                <div className="relative flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#f97316] text-2xl font-bold transition-transform duration-300 group-hover:scale-110">
                    ✓
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-slate-900">{b}</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {
                        [
                          'Track your service progress in real-time with instant notifications.',
                          'Easily schedule and manage your service appointments online.',
                          'Certified professionals ensure quality and precision in every repair.',
                          'No surprises—get upfront pricing and detailed digital invoices.',
                          'Stay informed with performance metrics and insightful analytics.',
                          'Your satisfaction is our top priority—every time, every visit.',
                        ][index]
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  

// function Benefits() {
//     const benefits = [
//       'Real-Time Updates',
//       'Online Service Booking',
//       'Expert Technicians',
//       'Transparent Billing',
//       'Analytics Dashboard',
//       'Customer Satisfaction Guaranteed',
//     ];
  
//     return (
//       <section
//         id="benefits"
//         className="py-28 sm:py-32 lg:py-36 bg-gradient-to-br from-[#fff7ed] via-[#fef3c7] to-[#f97316]/20"
//       >
//         <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
//           <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
//             Why Choose <span className="text-[#f97316]">Gear Sync</span>?
//           </h2>
//           <p className="mt-4 text-lg text-slate-700 max-w-2xl mx-auto">
//             Experience the future of vehicle maintenance with fast, transparent, and intelligent service management.
//           </p>
  
//           <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//             {benefits.map((b, index) => (
//               <div
//                 key={index}
//                 className="group relative overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
//               >
//                 <div className="absolute inset-0 bg-gradient-to-br from-[#f97316]/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
//                 <div className="relative flex items-start gap-4">
//                   <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#f97316] text-2xl font-bold transition-transform duration-300 group-hover:scale-110">
//                     ✓
//                   </div>
//                   <div className="text-left">
//                     <h3 className="text-lg font-semibold text-slate-900">
//                       {b}
//                     </h3>
//                     <p className="mt-2 text-sm text-slate-600">
//                       {
//                         [
//                           'Track your service progress in real-time with instant notifications.',
//                           'Easily schedule and manage your service appointments online.',
//                           'Certified professionals ensure quality and precision in every repair.',
//                           'No surprises—get upfront pricing and detailed digital invoices.',
//                           'Stay informed with performance metrics and insightful analytics.',
//                           'Your satisfaction is our top priority—every time, every visit.',
//                         ][index]
//                       }
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     );
//   }
  
  
  







  function Footer() {
    return (
      <footer className="relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-gray-300 overflow-hidden">
        {/* Glow effect background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f97316]/10 via-transparent to-[#f97316]/10 blur-3xl opacity-40"></div>
  
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-14">
          {/* Logo & Description */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-white tracking-wide">
              Gear<span className="text-[#f97316]">Sync</span>
            </h2>
            <p className="mt-3 text-sm text-gray-400 max-w-lg mx-auto">
              Simplifying automobile maintenance with intelligent service booking, real-time tracking, and expert care.
            </p>
          </div>
  
          {/* Footer Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-[#f97316] transition">About Us</a></li>
                <li><a href="#" className="hover:text-[#f97316] transition">Services</a></li>
                <li><a href="#" className="hover:text-[#f97316] transition">Careers</a></li>
                <li><a href="#" className="hover:text-[#f97316] transition">Contact</a></li>
              </ul>
            </div>
  
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-[#f97316] transition">FAQs</a></li>
                <li><a href="#" className="hover:text-[#f97316] transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#f97316] transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[#f97316] transition">Help Center</a></li>
              </ul>
            </div>
  
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Connect</h3>
              <div className="flex justify-center gap-5 mt-3">
                {[
                  { label: "Twitter", icon: "M22.46 6c-.77..." },
                  { label: "LinkedIn", icon: "M4.98 3.5C4.98..." },
                  { label: "Instagram", icon: "M7 2C4.24 2..." },
                ].map((s, i) => (
                  <a
                    key={i}
                    href="#"
                    aria-label={s.label}
                    className="group p-3 bg-[#f97316]/10 rounded-full hover:bg-[#f97316] transition transform hover:scale-110"
                  >
                    <svg
                      className="h-5 w-5 text-[#f97316] group-hover:text-white transition"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d={s.icon}></path>
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
  
          {/* Divider */}
          <div className="mt-10 border-t border-white/10"></div>
  
          {/* Bottom Text */}
          <div className="mt-6 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} GearSync. All rights reserved.
          </div>
        </div>
      </footer>
    );
  }
  
  
  

export default function Landing() {
  useRevealOnScroll();
  return (
    <div className="relative min-h-screen bg-[#0D1321] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(255,255,255,0.04),transparent_70%)]" />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <About />
        <Services />
        <Benefits />
        
        
      </main>
      <Footer />
    </div>
  );
}


