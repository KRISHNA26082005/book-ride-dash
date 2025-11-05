import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BookingDialogProps {
  bus: any;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingDialog({ bus, open, onClose, onSuccess }: BookingDialogProps) {
  const { user } = useAuth();
  const [seats, setSeats] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBooking = async () => {
    if (!seats || !passengerName || !passengerPhone || !passengerEmail) {
      toast.error('Please fill all fields');
      return;
    }

    const seatNumbers = seats.split(',').map(s => s.trim()).filter(Boolean);
    const numSeats = seatNumbers.length;

    if (numSeats > bus.available_seats) {
      toast.error('Not enough seats available');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.from('bookings').insert({
      user_id: user!.id,
      bus_id: bus.id,
      seat_numbers: seatNumbers,
      total_fare: bus.fare * numSeats,
      passenger_name: passengerName,
      passenger_phone: passengerPhone,
      passenger_email: passengerEmail,
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Booking confirmed!');
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book Tickets</DialogTitle>
          <DialogDescription>
            {bus.bus_name} - {bus.source} to {bus.destination}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="passenger-name">Passenger Name</Label>
            <Input
              id="passenger-name"
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              placeholder="Full Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passenger-phone">Phone Number</Label>
            <Input
              id="passenger-phone"
              value={passengerPhone}
              onChange={(e) => setPassengerPhone(e.target.value)}
              placeholder="+1234567890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passenger-email">Email</Label>
            <Input
              id="passenger-email"
              type="email"
              value={passengerEmail}
              onChange={(e) => setPassengerEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seats">Seat Numbers (comma separated)</Label>
            <Input
              id="seats"
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
              placeholder="A1, A2, B1"
            />
            <p className="text-xs text-muted-foreground">
              {bus.available_seats} seats available
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Fare:</span>
              <span className="text-2xl font-bold text-primary">
                ${(bus.fare * (seats.split(',').filter(s => s.trim()).length || 0)).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleBooking} disabled={isLoading} className="flex-1">
              {isLoading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
