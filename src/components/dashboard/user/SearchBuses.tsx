import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Calendar, MapPin, Clock, DollarSign, Users } from 'lucide-react';
import BookingDialog from './BookingDialog';

export default function SearchBuses() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [selectedBus, setSelectedBus] = useState<any>(null);

  const { data: buses, refetch } = useQuery({
    queryKey: ['buses', source, destination, travelDate],
    queryFn: async () => {
      let query = supabase
        .from('buses')
        .select('*')
        .gt('available_seats', 0);

      if (source) query = query.ilike('source', `%${source}%`);
      if (destination) query = query.ilike('destination', `%${destination}%`);
      if (travelDate) query = query.eq('travel_date', travelDate);

      const { data, error } = await query.order('departure_time');
      if (error) throw error;
      return data;
    },
    enabled: false,
  });

  const handleSearch = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Buses</CardTitle>
          <CardDescription>Find buses for your journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                placeholder="From city"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                placeholder="To city"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Travel Date</Label>
              <Input
                id="date"
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleSearch} className="w-full mt-4">
            <Search className="h-4 w-4 mr-2" />
            Search Buses
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {buses?.map((bus) => (
          <Card key={bus.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div>
                    <h3 className="text-xl font-bold">{bus.bus_name}</h3>
                    <p className="text-sm text-muted-foreground">{bus.bus_number}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{bus.source} → {bus.destination}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{new Date(bus.travel_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{bus.departure_time} - {bus.arrival_time}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-secondary" />
                      <span className="text-sm font-medium">{bus.available_seats} seats available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-secondary" />
                      <span className="text-lg font-bold">${bus.fare}</span>
                    </div>
                  </div>
                </div>

                <Button onClick={() => setSelectedBus(bus)}>
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {buses && buses.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No buses found. Try different search criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedBus && (
        <BookingDialog
          bus={selectedBus}
          open={!!selectedBus}
          onClose={() => setSelectedBus(null)}
          onSuccess={() => {
            setSelectedBus(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
