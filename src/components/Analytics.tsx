/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Quote } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ChartBar, TrendingUp, Users, Boxes, PieChart, DollarSign, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RePie, Pie, Cell, AreaChart, Area
} from 'recharts';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export function Analytics() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'quotes'),
      where('userId', '==', user.uid),
      orderBy('savedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => d.data() as Quote);
      setQuotes(docs);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const stats = useMemo(() => {
    const total = quotes.length;
    const won = quotes.filter(q => q.status === 'won').length;
    return {
      total,
      drafts: quotes.filter(q => q.status === 'draft').length,
      sent: quotes.filter(q => q.status === 'sent').length,
      won,
      winRate: total ? Math.round((won / total) * 100) : 0
    };
  }, [quotes]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    quotes.forEach(q => {
      counts[q.status] = (counts[q.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ 
      name: name.toUpperCase(), 
      value 
    }));
  }, [quotes]);

  const customerData = useMemo(() => {
    const counts: Record<string, number> = {};
    quotes.forEach(q => {
      if (q.custName) {
        counts[q.custName] = (counts[q.custName] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value)
      .slice(0, 5);
  }, [quotes]);

  const trendData = useMemo(() => {
    const daily: Record<string, number> = {};
    quotes.forEach(q => {
      const date = q.savedAt?.split('T')[0] || q.quoteDate;
      if (date) daily[date] = (daily[date] || 0) + 1;
    });
    return Object.entries(daily)
      .map(([date, count]) => ({ date, count }))
      .sort((a,b) => a.date.localeCompare(b.date));
  }, [quotes]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-900">
            <ChartBar className="w-4 h-4 text-emerald-600" /> Advanced Performance Analytics
          </CardTitle>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />}
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
             <div className="bg-emerald-900 text-white rounded-xl p-4 shadow-lg border-b-4 border-amber-500 transition-transform hover:scale-105">
                <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Total Inventory Quotes</div>
                <div className="text-3xl font-black mt-1 tracking-tighter">{stats.total}</div>
             </div>
             <div className="bg-slate-800 text-white rounded-xl p-4 shadow-lg transition-transform hover:scale-105">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Draft Phase</div>
                <div className="text-3xl font-black mt-1 text-slate-200 tracking-tighter">{stats.drafts}</div>
             </div>
             <div className="bg-blue-900 text-white rounded-xl p-4 shadow-lg transition-transform hover:scale-105">
                <div className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Submitted / Sent</div>
                <div className="text-3xl font-black mt-1 text-blue-100 tracking-tighter">{stats.sent}</div>
             </div>
             <div className="bg-emerald-600 text-white rounded-xl p-4 shadow-lg transition-transform hover:scale-105">
                <div className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider">Conversion (Won)</div>
                <div className="text-3xl font-black mt-1 tracking-tighter">{stats.won}</div>
             </div>
             <div className="bg-amber-500 text-emerald-950 rounded-xl p-4 shadow-lg transition-transform hover:scale-105">
                <div className="text-[10px] text-emerald-900/60 font-bold uppercase tracking-wider">Efficiency Win Rate</div>
                <div className="text-3xl font-black mt-1 tracking-tighter">{stats.winRate}%</div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <Card className="border-slate-100 shadow-sm">
                <CardHeader className="py-3 bg-slate-50/50 border-b">
                   <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                       <PieChart className="w-3.5 h-3.5" /> Quote Status Distribution
                   </CardTitle>
                </CardHeader>
                <CardContent className="h-64 pt-4">
                   {statusData.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statusData}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                           <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} />
                           <YAxis fontSize={9} axisLine={false} tickLine={false} />
                           <Tooltip 
                              cursor={{fill: '#f8fafc'}}
                              contentStyle={{fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                           />
                           <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                     </ResponsiveContainer>
                   ) : (
                     <div className="h-full flex items-center justify-center text-slate-300 italic text-xs">No data recorded</div>
                   )}
                </CardContent>
             </Card>

             <Card className="border-slate-100 shadow-sm">
                <CardHeader className="py-3 bg-slate-50/50 border-b">
                   <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                       <Users className="w-3.5 h-3.5" /> Market Segment Focus
                   </CardTitle>
                </CardHeader>
                <CardContent className="h-64 pt-4">
                   {customerData.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <RePie>
                           <Pie
                              data={customerData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                           >
                              {customerData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                           </Pie>
                           <Tooltip contentStyle={{fontSize: '10px', borderRadius: '8px'}} />
                        </RePie>
                     </ResponsiveContainer>
                   ) : (
                      <div className="h-full flex items-center justify-center text-slate-300 italic text-xs">No customer data</div>
                   )}
                </CardContent>
             </Card>

             <Card className="border-slate-100 shadow-sm md:col-span-2 lg:col-span-1">
                <CardHeader className="py-3 bg-slate-50/50 border-b">
                   <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                       <TrendingUp className="w-3.5 h-3.5" /> Submission Velocity
                   </CardTitle>
                </CardHeader>
                <CardContent className="h-64 pt-4">
                   {trendData.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                           <defs>
                              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <XAxis dataKey="date" fontSize={8} axisLine={false} tickLine={false} />
                           <Tooltip contentStyle={{fontSize: '10px', borderRadius: '8px'}} />
                           <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                     </ResponsiveContainer>
                   ) : (
                      <div className="h-full flex items-center justify-center text-slate-300 italic text-xs">Not enough trend history</div>
                   )}
                </CardContent>
             </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
