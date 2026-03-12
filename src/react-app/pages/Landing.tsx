import { Link } from "react-router";
import { Activity, Shield, FileText, BarChart3, QrCode, Users, HeartPulse } from "lucide-react";
import AnimatedBackground from "@/react-app/components/AnimatedBackground";
import Header from "@/react-app/components/Header";

const features = [
  {
    icon: FileText,
    title: "Digital Health Records",
    description: "Secure, instant access to complete medical history from anywhere.",
  },
  {
    icon: Shield,
    title: "Privacy Protected",
    description: "Advanced encryption ensures your health data stays confidential.",
  },
  {
    icon: BarChart3,
    title: "Disease Surveillance",
    description: "Real-time monitoring and analytics for disease outbreak detection.",
  },
  {
    icon: QrCode,
    title: "QR Health Cards",
    description: "Portable digital health cards for quick identity verification.",
  },
  {
    icon: Users,
    title: "Provider Network",
    description: "Connect with healthcare providers for seamless care coordination.",
  },
  {
    icon: Activity,
    title: "Health Insights",
    description: "Personalized health analytics and preventive care recommendations.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white relative">
      <AnimatedBackground />
      <Header />

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full mb-8">
            <HeartPulse className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-accent-foreground">
              Next-Generation Healthcare Platform
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            HealthLedger
            <span className="block text-primary mt-2">
              Smart Healthcare History &
            </span>
            <span className="block text-primary">
              Disease Surveillance System
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            A comprehensive digital platform for managing medical records, tracking health history, 
            and enabling real-time disease monitoring. Empowering patients and healthcare providers 
            with secure, accessible health information.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold border-2 border-primary text-primary rounded-2xl hover:bg-primary hover:text-white transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              Login to Account
            </Link>
            <Link
              to="/patient-registration"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              Register as Patient
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-accent/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Comprehensive Healthcare Management
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage health records and monitor disease patterns
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <feature.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-primary rounded-3xl p-8 sm:p-12 text-white">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl sm:text-5xl font-bold mb-2">50K+</div>
                <div className="text-white/80 text-sm sm:text-base">Registered Patients</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold mb-2">200+</div>
                <div className="text-white/80 text-sm sm:text-base">Healthcare Providers</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold mb-2">1M+</div>
                <div className="text-white/80 text-sm sm:text-base">Records Managed</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold mb-2">99.9%</div>
                <div className="text-white/80 text-sm sm:text-base">System Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-foreground">HealthLedger</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 HealthLedger. Secure Healthcare Management.
          </p>
        </div>
      </footer>
    </div>
  );
}
