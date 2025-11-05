import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ManageBuses from './admin/ManageBuses';
import ViewBookings from './admin/ViewBookings';

export default function AdminDashboard() {
  return (
    <Tabs defaultValue="buses" className="w-full">
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
        <TabsTrigger value="buses">Manage Buses</TabsTrigger>
        <TabsTrigger value="bookings">View Bookings</TabsTrigger>
      </TabsList>
      <TabsContent value="buses" className="mt-6">
        <ManageBuses />
      </TabsContent>
      <TabsContent value="bookings" className="mt-6">
        <ViewBookings />
      </TabsContent>
    </Tabs>
  );
}
