import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface BusFormProps {
  bus?: any;
  open: boolean;
  onClose: () => void;
}

export default function BusForm({ bus, open, onClose }: BusFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    bus_number: '',
    bus_name: '',
    source: '',
    destination: '',
    departure_time: '',
    arrival_time: '',
    total_seats: 40,
    available_seats: 40,
    fare: 0,
    travel_date: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (bus) {
      setFormData({
        bus_number: bus.bus_number,
        bus_name: bus.bus_name,
        source: bus.source,
        destination: bus.destination,
        departure_time: bus.departure_time,
        arrival_time: bus.arrival_time,
        total_seats: bus.total_seats,
        available_seats: bus.available_seats,
        fare: bus.fare,
        travel_date: bus.travel_date,
      });
    }
  }, [bus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (bus) {
      const { error } = await supabase
        .from('buses')
        .update(formData)
        .eq('id', bus.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Bus updated successfully');
        onClose();
      }
    } else {
      const { error } = await supabase
        .from('buses')
        .insert({
          ...formData,
          created_by: user!.id,
        });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Bus added successfully');
        onClose();
      }
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{bus ? 'Edit Bus' : 'Add New Bus'}</DialogTitle>
          <DialogDescription>
            {bus ? 'Update bus details' : 'Add a new bus schedule'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bus_number">Bus Number</Label>
              <Input
                id="bus_number"
                required
                value={formData.bus_number}
                onChange={(e) => setFormData({ ...formData, bus_number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bus_name">Bus Name</Label>
              <Input
                id="bus_name"
                required
                value={formData.bus_name}
                onChange={(e) => setFormData({ ...formData, bus_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                required
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                required
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="departure_time">Departure Time</Label>
              <Input
                id="departure_time"
                type="time"
                required
                value={formData.departure_time}
                onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arrival_time">Arrival Time</Label>
              <Input
                id="arrival_time"
                type="time"
                required
                value={formData.arrival_time}
                onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="travel_date">Travel Date</Label>
              <Input
                id="travel_date"
                type="date"
                required
                value={formData.travel_date}
                onChange={(e) => setFormData({ ...formData, travel_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_seats">Total Seats</Label>
              <Input
                id="total_seats"
                type="number"
                required
                value={formData.total_seats}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  total_seats: parseInt(e.target.value),
                  available_seats: bus ? formData.available_seats : parseInt(e.target.value)
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fare">Fare ($)</Label>
              <Input
                id="fare"
                type="number"
                step="0.01"
                required
                value={formData.fare}
                onChange={(e) => setFormData({ ...formData, fare: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : bus ? 'Update Bus' : 'Add Bus'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
