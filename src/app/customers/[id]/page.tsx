'use client';

import React, { useState, useEffect, use } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { 
  getCustomers, 
  getBookings, 
  getBookingPaymentSummaries 
} from '@/lib/db/db-service';
import { Customer, Booking } from '@/lib/db/types';
import { 
  ArrowLeft, 
  Phone, 
  Calendar, 
  IndianRupee, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Compass
} from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const customerId = resolvedParams.id;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [paymentSummaries, setPaymentSummaries] = useState<Record<string, { totalPaid: number; pendingAmount: number; status: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const allCustomers = await getCustomers();
        const foundCustomer = allCustomers.find(c => c.id === customerId);
        
        if (foundCustomer) {
          setCustomer(foundCustomer);
          const allBookings = await getBookings();
          
          // Filter bookings for this customer
          const customerBookings = allBookings.filter(b => b.customer_id === customerId);
          setBookings(customerBookings);

          // Get payment summaries in bulk (O(1) queries instead of O(N))
          const { summaries } = await getBookingPaymentSummaries(customerBookings);
          setPaymentSummaries(summaries);
        }
      } catch (err) {
        console.error('Error fetching customer details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-muted-foreground font-medium">Loading profile details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="bg-card rounded-2xl border border-border p-12 text-center shadow-sm max-w-lg mx-auto">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="font-bold text-sm text-foreground">Customer Not Found</p>
          <p className="text-xs text-muted-foreground mt-1">The customer you are trying to view does not exist in our database.</p>
          <Link 
            href="/customers"
            className="inline-flex items-center gap-1.5 text-xs text-primary font-bold mt-4 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Customers
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate dynamic stats
  const completedBookings = bookings.filter(b => b.status === 'Completed');
  const activeBookings = bookings.filter(b => b.status !== 'Cancelled');
  
  const totalRevenue = activeBookings.reduce((sum, b) => sum + Number(b.final_amount), 0);
  const totalOutstanding = activeBookings.reduce((sum, b) => {
    const summary = paymentSummaries[b.id];
    return sum + (summary ? summary.pendingAmount : 0);
  }, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Link & Header */}
        <div className="flex flex-col gap-2">
          <Link 
            href="/customers"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-bold hover:text-primary transition-colors w-fit"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Customer Directory
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 bg-primary text-white rounded-2xl flex items-center justify-center font-bold text-base shadow-sm">
                {customer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground leading-tight">{customer.name}</h1>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {customer.phone}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Registered: {new Date(customer.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistical Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Bookings</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold text-foreground">{bookings.length}</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                {completedBookings.length} Completed
              </span>
            </div>
          </div>

          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Lifetime Spent</span>
            <div className="flex items-baseline gap-0.5 mt-1">
              <IndianRupee className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xl font-bold text-primary leading-tight">{totalRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Outstanding Balance</span>
            <div className="flex items-baseline gap-0.5 mt-1">
              <IndianRupee className={`h-4 w-4 shrink-0 ${totalOutstanding > 0 ? 'text-amber-600' : 'text-emerald-700'}`} />
              <span className={`text-xl font-bold leading-tight ${totalOutstanding > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                {totalOutstanding.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Booking History Section */}
        <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden text-left">
          <div className="p-5 border-b border-border/80 flex items-center justify-between">
            <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Booking History
            </h2>
            <span className="text-xs text-muted-foreground">Total of {bookings.length} slots</span>
          </div>

          {bookings.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-xs text-muted-foreground font-medium">No bookings logged for this customer yet.</p>
              <Link 
                href="/bookings" 
                className="mt-3.5 inline-flex py-1.5 px-3 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl text-xs"
              >
                Create First Booking
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Desktop Table (hidden on mobile) */}
              <table className="w-full text-left border-collapse hidden sm:table">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-5">Booking ID</th>
                    <th className="py-3 px-5">Ground</th>
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-5">Time Slot</th>
                    <th className="py-3 px-5">Amount</th>
                    <th className="py-3 px-5">Booking Status</th>
                    <th className="py-3 px-5">Payment Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-xs text-foreground font-medium">
                  {bookings.map((booking) => {
                    const paySummary = paymentSummaries[booking.id];
                    
                    let bookingBadge = 'bg-blue-50 text-blue-800 border-blue-200'; // Upcoming
                    if (booking.status === 'Completed') bookingBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                    if (booking.status === 'Cancelled') bookingBadge = 'bg-red-50 text-red-800 border-red-200';

                    let paymentBadge = 'bg-muted text-muted-foreground border-border';
                    if (paySummary?.status === 'Paid') paymentBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                    if (paySummary?.status === 'Partial') paymentBadge = 'bg-amber-50 text-amber-800 border-amber-200';
                    if (paySummary?.status === 'Pending') paymentBadge = 'bg-red-50 text-red-800 border-red-200';

                    return (
                      <tr key={booking.id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-3.5 px-5 font-mono text-[10px]">{booking.id}</td>
                        <td className="py-3.5 px-5">{booking.ground?.name || 'Ground'}</td>
                        <td className="py-3.5 px-5">{new Date(booking.booking_date).toLocaleDateString()}</td>
                        <td className="py-3.5 px-5">{booking.start_time} - {booking.end_time}</td>
                        <td className="py-3.5 px-5">
                          <span className="flex items-center">
                            <IndianRupee className="h-3 w-3" />
                            {Number(booking.final_amount).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-flex px-2 py-0.5 rounded-lg border text-[10px] font-bold ${bookingBadge}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-flex px-2 py-0.5 rounded-lg border text-[10px] font-bold ${paymentBadge}`}>
                            {paySummary?.status || 'Pending'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <Link 
                            href={`/bookings?id=${booking.id}`}
                            className="text-xs text-primary font-bold hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile Card List (visible on mobile only) */}
              <div className="block sm:hidden divide-y divide-border/60">
                {bookings.map((booking) => {
                  const paySummary = paymentSummaries[booking.id];
                  
                  let bookingBadge = 'bg-blue-50 text-blue-800 border-blue-200'; // Upcoming
                  if (booking.status === 'Completed') bookingBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  if (booking.status === 'Cancelled') bookingBadge = 'bg-red-50 text-red-800 border-red-200';

                  let paymentBadge = 'bg-muted text-muted-foreground border-border';
                  if (paySummary?.status === 'Paid') paymentBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  if (paySummary?.status === 'Partial') paymentBadge = 'bg-amber-50 text-amber-800 border-amber-200';
                  if (paySummary?.status === 'Pending') paymentBadge = 'bg-red-50 text-red-800 border-red-200';

                  return (
                    <div key={booking.id} className="p-4 space-y-3 text-left">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono text-muted-foreground">{booking.id}</span>
                        <span className={`inline-flex px-2 py-0.5 rounded-lg border font-bold ${bookingBadge}`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-foreground text-sm block">{booking.ground?.name || 'Ground'}</span>
                          <span className="text-xs text-muted-foreground">{booking.start_time} - {booking.end_time}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-foreground flex items-center justify-end">
                            <IndianRupee className="h-3 w-3" />
                            {Number(booking.final_amount).toLocaleString('en-IN')}
                          </span>
                          <span className={`inline-flex px-2 py-0.5 rounded-lg border text-[9px] font-bold mt-1 ${paymentBadge}`}>
                            {paySummary?.status || 'Pending'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                        <span className="text-muted-foreground">{new Date(booking.booking_date).toLocaleDateString()}</span>
                        <Link 
                          href={`/bookings?id=${booking.id}`}
                          className="text-xs text-primary font-bold hover:underline"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
