import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ManageBuses from './admin/ManageBuses';
import ViewBookings from './admin/ViewBookings';
import DatabaseViewer from './admin/DatabaseViewer';

export default function AdminDashboard() {
  return (
    <Tabs defaultValue="buses" className="w-full">
      <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
        <TabsTrigger value="buses">Manage Buses</TabsTrigger>
        <TabsTrigger value="bookings">View Bookings</TabsTrigger>
        <TabsTrigger value="database">Database Monitor</TabsTrigger>
      </TabsList>
      <TabsContent value="buses" className="mt-6">
        <ManageBuses />
      </TabsContent>
      <TabsContent value="bookings" className="mt-6">
        <ViewBookings />
      </TabsContent>
      <TabsContent value="database" className="mt-6">
        <DatabaseViewer />
      </TabsContent>
    </Tabs>
  );
}
