import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Bus, Calendar, MapPin, Shield } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div 
        className="relative overflow-hidden py-20 px-4"
        style={{ background: 'var(--gradient-hero)' }}
      >
        <div className="container mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Bus className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Bus Reservation System
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Book your bus tickets online with ease. Fast, secure, and convenient travel booking at your fingertips.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" variant="secondary" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Easy Booking</h3>
            <p className="text-muted-foreground">
              Search and book buses by date, source, and destination in just a few clicks.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Wide Network</h3>
            <p className="text-muted-foreground">
              Access multiple routes and destinations with our extensive bus network.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
            <p className="text-muted-foreground">
              Book with confidence using our secure and reliable payment system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
