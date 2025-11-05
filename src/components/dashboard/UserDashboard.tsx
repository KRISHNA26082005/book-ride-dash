import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SearchBuses from './user/SearchBuses';
import MyBookings from './user/MyBookings';

export default function UserDashboard() {
  return (
    <Tabs defaultValue="search" className="w-full">
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
        <TabsTrigger value="search">Search Buses</TabsTrigger>
        <TabsTrigger value="bookings">My Bookings</TabsTrigger>
      </TabsList>
      <TabsContent value="search" className="mt-6">
        <SearchBuses />
      </TabsContent>
      <TabsContent value="bookings" className="mt-6">
        <MyBookings />
      </TabsContent>
    </Tabs>
  );
}
