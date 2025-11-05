import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Pencil, Trash2, MapPin, Calendar, Clock, Users, DollarSign } from 'lucide-react';

interface BusListProps {
  buses: any[];
  onEdit: (bus: any) => void;
  onUpdate: () => void;
}

export default function BusList({ buses, onEdit, onUpdate }: BusListProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bus?')) return;

    const { error } = await supabase
      .from('buses')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Bus deleted successfully');
      onUpdate();
    }
  };

  return (
    <div className="grid gap-4">
      {buses.map((bus) => (
        <Card key={bus.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{bus.bus_name}</h3>
                    <p className="text-sm text-muted-foreground">{bus.bus_number}</p>
                  </div>
                  <Badge variant={bus.available_seats > 0 ? 'default' : 'destructive'}>
                    {bus.available_seats > 0 ? 'Available' : 'Full'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
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
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{bus.available_seats}/{bus.total_seats} available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="font-bold">${bus.fare}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(bus)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(bus.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {buses.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No buses added yet. Click "Add Bus" to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
