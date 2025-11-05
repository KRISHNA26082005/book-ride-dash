import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Users, Receipt } from 'lucide-react';
import { toast } from 'sonner';

export default function MyBookings() {
  const { user } = useAuth();

  const { data: bookings, refetch } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          buses (*)
        `)
        .eq('user_id', user!.id)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleCancel = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Booking cancelled successfully');
      refetch();
    }
  };

  const downloadTicket = (booking: any) => {
    const ticketText = `
      BUS TICKET - ${booking.id}
      =====================================
      Passenger: ${booking.passenger_name}
      Phone: ${booking.passenger_phone}
      Email: ${booking.passenger_email}
      
      Bus: ${booking.buses.bus_name} (${booking.buses.bus_number})
      Route: ${booking.buses.source} → ${booking.buses.destination}
      Date: ${new Date(booking.buses.travel_date).toLocaleDateString()}
      Time: ${booking.buses.departure_time} - ${booking.buses.arrival_time}
      
      Seats: ${booking.seat_numbers.join(', ')}
      Total Fare: $${booking.total_fare}
      Status: ${booking.status.toUpperCase()}
      
      Booking Date: ${new Date(booking.booking_date).toLocaleString()}
      =====================================
    `;

    const blob = new Blob([ticketText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${booking.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>View and manage your bus reservations</CardDescription>
        </CardHeader>
      </Card>

      {bookings?.map((booking) => (
        <Card key={booking.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold">{booking.buses.bus_name}</h3>
                  <p className="text-sm text-muted-foreground">{booking.buses.bus_number}</p>
                </div>
                <Badge variant={booking.status === 'confirmed' ? 'default' : 'destructive'}>
                  {booking.status}
                </Badge>
              </div>

              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{booking.buses.source} → {booking.buses.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{new Date(booking.buses.travel_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{booking.buses.departure_time} - {booking.buses.arrival_time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Seats: {booking.seat_numbers.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  <span className="font-bold">Total: ${booking.total_fare}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => downloadTicket(booking)}
                >
                  Download Ticket
                </Button>
                {booking.status === 'confirmed' && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleCancel(booking.id)}
                  >
                    Cancel Booking
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {bookings && bookings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No bookings found. Start by searching for buses!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
