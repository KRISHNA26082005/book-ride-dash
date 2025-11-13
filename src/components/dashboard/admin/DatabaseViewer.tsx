import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function DatabaseViewer() {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const { data: buses, refetch: refetchBuses } = useQuery({
    queryKey: ['database-buses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: bookings, refetch: refetchBookings } = useQuery({
    queryKey: ['database-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          buses (bus_name, bus_number, source, destination),
          profiles (full_name)
        `)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    // Subscribe to buses table changes
    const busesChannel = supabase
      .channel('buses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'buses'
        },
        () => {
          refetchBuses();
          setLastUpdate(new Date());
        }
      )
      .subscribe();

    // Subscribe to bookings table changes
    const bookingsChannel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          refetchBookings();
          setLastUpdate(new Date());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(busesChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, [refetchBuses, refetchBookings]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Database Monitor</CardTitle>
                <CardDescription>Real-time view of all database records</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Last update: {format(lastUpdate, 'HH:mm:ss')}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Buses Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Buses Table</CardTitle>
            <Badge variant="secondary">{buses?.length || 0} records</Badge>
          </div>
          <CardDescription>All bus schedules in the database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bus Name</TableHead>
                  <TableHead>Bus Number</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buses?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No buses in database
                    </TableCell>
                  </TableRow>
                ) : (
                  buses?.map((bus) => (
                    <TableRow key={bus.id}>
                      <TableCell className="font-medium">{bus.bus_name}</TableCell>
                      <TableCell>{bus.bus_number}</TableCell>
                      <TableCell>{bus.source} → {bus.destination}</TableCell>
                      <TableCell>{format(new Date(bus.travel_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={bus.available_seats > 10 ? "secondary" : "destructive"}>
                          {bus.available_seats}/{bus.total_seats}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{bus.fare}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(bus.created_at), 'MMM dd, HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bookings Table</CardTitle>
            <Badge variant="secondary">{bookings?.length || 0} records</Badge>
          </div>
          <CardDescription>All customer bookings in the database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Bus</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Booked At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No bookings in database
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings?.map((booking: any) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.passenger_name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{booking.buses?.bus_name}</div>
                          <div className="text-muted-foreground">{booking.buses?.bus_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{booking.passenger_phone}</div>
                          <div className="text-muted-foreground">{booking.passenger_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {booking.seat_numbers.join(', ')}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{booking.total_fare}</TableCell>
                      <TableCell>
                        <Badge variant={booking.status === 'confirmed' ? 'secondary' : 'destructive'}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(booking.booking_date), 'MMM dd, HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
