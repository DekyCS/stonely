import { Icons } from "@/components/icons";
import {
  EyeIcon,
  ScanIcon,
  BoxIcon,
  MicroscopeIcon,
  GraduationCapIcon,
  ZapIcon,
} from "lucide-react";

export const BLUR_FADE_DELAY = 0.15;

export const siteConfig = {
  name: "Rockly",
  description: "AI-powered rock and mineral analysis with 3D visualization.",
  cta: "Analyze Your Rock",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  keywords: [
    "Rock Analysis",
    "Mineral Identification",
    "3D Visualization",
    "Geology",
    "AI Computer Vision",
  ],
  links: {
    email: "support@rockly.app",
    twitter: "https://twitter.com/rocklyapp",
    discord: "https://discord.gg/rockly",
    github: "https://github.com/rockly",
    instagram: "https://instagram.com/rocklyapp",
  },
  hero: {
    title: "Rockly",
    description:
      "Upload a photo of any rock or mineral specimen and get instant AI-powered analysis with interactive 3D visualization. Perfect for students, educators, researchers, and geology enthusiasts.",
    cta: "Analyze Your Rock",
    ctaDescription: "Upload a photo and discover what's inside your rock",
  },
  features: [
    {
      name: "AI Mineral Identification",
      description:
        "Advanced computer vision analyzes your rock photos to identify mineral composition and geological properties.",
      icon: <ScanIcon className="h-6 w-6" />,
    },
    {
      name: "3D Visualization",
      description:
        "Transform 2D photos into interactive 3D models with depth estimation technology for immersive exploration.",
      icon: <BoxIcon className="h-6 w-6" />,
    },
    {
      name: "Depth Estimation",
      description:
        "Cutting-edge algorithms generate accurate depth information from single photographs for realistic 3D reconstruction.",
      icon: <EyeIcon className="h-6 w-6" />,
    },
    {
      name: "Educational Insights",
      description:
        "Get detailed geological information, formation processes, and educational content about your specimens.",
      icon: <GraduationCapIcon className="h-6 w-6" />,
    },
    {
      name: "Professional Analysis",
      description:
        "Research-grade mineral classification trained on extensive geological datasets for accurate results.",
      icon: <MicroscopeIcon className="h-6 w-6" />,
    },
    {
      name: "Instant Results",
      description:
        "Fast processing delivers comprehensive analysis and 3D visualization in seconds, not hours.",
      icon: <ZapIcon className="h-6 w-6" />,
    },
  ],
  pricing: [
    {
      name: "Basic",
      price: { monthly: "$9", yearly: "$99" },
      frequency: { monthly: "month", yearly: "year" },
      description: "Perfect for individuals and small projects.",
      features: [
        "100 AI generations per month",
        "Basic text-to-image conversion",
        "Email support",
        "Access to community forum",
      ],
      cta: "Get Started",
    },
    {
      name: "Pro",
      price: { monthly: "$29", yearly: "$290" },
      frequency: { monthly: "month", yearly: "year" },
      description: "Ideal for professionals and growing businesses.",
      features: [
        "1000 AI generations per month",
        "Advanced text-to-image conversion",
        "Priority email support",
        "API access",
        "Custom AI model fine-tuning",
        "Collaboration tools",
      ],
      cta: "Get Started",
    },
    {
      name: "Enterprise",
      price: { monthly: "$999", yearly: "Custom" },
      frequency: { monthly: "month", yearly: "year" },
      description: "Tailored solutions for large organizations.",
      features: [
        "Unlimited AI generations",
        "Dedicated account manager",
        "24/7 phone and email support",
        "Custom AI model development",
        "On-premises deployment option",
        "Advanced analytics and reporting",
      ],
      popular: true,
      cta: "Get Started",
    },
  ],
  footer: {
    socialLinks: [
      {
        icon: <Icons.github className="h-5 w-5" />,
        url: "#",
      },
      {
        icon: <Icons.twitter className="h-5 w-5" />,
        url: "#",
      },
    ],
    links: [
      { text: "About", url: "#" },
      { text: "Contact", url: "#" },
    ],
    bottomText: "All rights reserved.",
    brandText: "ROCKLY",
  },

  testimonials: [
    {
      id: 1,
      text: "Rockly has transformed how I teach geology. My students can now identify minerals instantly and see them in 3D!",
      name: "Dr. Sarah Mitchell",
      company: "University of Colorado",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cG9ydHJhaXR8ZW58MHx8MHx8fDA%3D",
    },
    {
      id: 2,
      text: "As a field geologist, Rockly helps me quickly identify specimens on-site. The 3D visualization is incredibly accurate.",
      name: "Marcus Rodriguez",
      company: "Geological Survey Inc.",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 3,
      text: "I'm a rock collecting hobbyist and Rockly has helped me identify dozens of specimens I found hiking.",
      name: "Jennifer Chen",
      company: "Rock Hound Enthusiast",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 4,
      text: "The mineral composition analysis is spot-on. Rockly has become an essential tool in our research lab.",
      name: "Dr. Ahmed Hassan",
      company: "Mineralogy Research Center",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 5,
      text: "My kids love using Rockly to explore the rocks they find in our backyard. It's made geology fun for the whole family!",
      name: "Lisa Thompson",
      company: "Homeschool Educator",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 6,
      text: "The 3D visualization feature helps my students understand crystal structures like never before.",
      name: "Professor David Kim",
      company: "Earth Sciences Department",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDB8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 7,
      text: "Rockly's accuracy in identifying rare minerals has impressed our entire geology department.",
      name: "Dr. Emma Wilson",
      company: "State Geological Institute",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDR8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 8,
      text: "I use Rockly for mineral prospecting. It's helped me identify valuable specimens that I would have overlooked.",
      name: "Robert Anderson",
      company: "Independent Prospector",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTJ8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 9,
      text: "The educational content provided with each analysis has greatly enhanced my geology curriculum.",
      name: "Ms. Rachel Garcia",
      company: "Lincoln High School",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTZ8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 10,
      text: "Rockly has made field work so much more efficient. I can identify specimens instantly without lab equipment.",
      name: "Dr. Michael Brown",
      company: "Exploration Geologist",
      image:
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjR8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 11,
      text: "As a museum curator, Rockly helps me quickly catalog and identify new mineral specimens in our collection.",
      name: "Dr. Patricia Lee",
      company: "Natural History Museum",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzB8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 12,
      text: "The 3D models generated by Rockly are so detailed, I can study mineral structures from every angle.",
      name: "Dr. James Martinez",
      company: "Crystallography Lab",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzZ8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 13,
      text: "Rockly has revolutionized how we approach mineral identification in our undergraduate geology courses.",
      name: "Professor Angela Davis",
      company: "Community College",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODJ8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 14,
      text: "The instant analysis saves hours of lab work. Rockly is now essential for our field research expeditions.",
      name: "Dr. Kevin Wong",
      company: "Geological Research Team",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODh8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 15,
      text: "Rockly's user-friendly interface makes geological analysis accessible to students of all levels.",
      name: "Professor Oliver Smith",
      company: "Geology Education Institute",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTR8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
  ],
};

export type SiteConfig = typeof siteConfig;
