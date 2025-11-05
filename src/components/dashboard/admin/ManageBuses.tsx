import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import BusForm from './BusForm';
import BusList from './BusList';

export default function ManageBuses() {
  const [showForm, setShowForm] = useState(false);
  const [editingBus, setEditingBus] = useState<any>(null);

  const { data: buses, refetch } = useQuery({
    queryKey: ['admin-buses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buses')
        .select('*')
        .order('travel_date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (bus: any) => {
    setEditingBus(bus);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingBus(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manage Buses</CardTitle>
              <CardDescription>Add, edit, or delete bus schedules</CardDescription>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Bus
            </Button>
          </div>
        </CardHeader>
      </Card>

      <BusList buses={buses || []} onEdit={handleEdit} onUpdate={refetch} />

      {showForm && (
        <BusForm
          bus={editingBus}
          open={showForm}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
