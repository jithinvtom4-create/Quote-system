/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useQuoteForm } from './hooks/use-quote-form';
import { QuoteDetails } from './components/QuoteDetails';
import { QuoteItems } from './components/QuoteItems';
import { SignStamp } from './components/SignStamp';
import { QuotePreview } from './components/QuotePreview';
import { QuoteRegister } from './components/QuoteRegister';
import { Analytics } from './components/Analytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { 
  FileText, Boxes, Signature, Eye, Archive, BarChart4, 
  FlaskConical, MapPin, Phone, Mail, Award, LogOut, User as UserIcon
} from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Button } from './components/ui/button';

function AppContent() {
  const { user, logout } = useAuth();
  const { quote, updateQuote, addItem, updateItem, removeItem, resetForm, totals } = useQuoteForm();
  const [activeTab, setActiveTab] = useState('details');

  if (!user) return <Login />;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50/50">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white border-b-4 border-amber-500 shadow-xl print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500 p-2 rounded-xl shadow-inner">
               <FlaskConical className="w-8 h-8 text-emerald-900" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-tight">AL ERADAH CHEMICAL WLL</h1>
              <p className="text-[10px] text-emerald-200 font-medium uppercase tracking-[0.2em]">Premium Chemical Solutions & Distribution</p>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-6 text-[10px] text-emerald-100 font-medium opacity-80">
            <div className="flex items-center gap-2">
               <MapPin className="w-3 h-3 text-amber-400" />
               <span>Raz Zuwayed, Bahrain</span>
            </div>
            <div className="flex items-center gap-2">
               <Phone className="w-3 h-3 text-amber-400" />
               <span>+973-17413720</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 flex items-center gap-3">
               <div className="text-center">
                  <div className="text-[9px] font-black text-amber-400 leading-none">CR No: 17538-3</div>
                  <div className="w-full h-px bg-amber-500/20 my-1" />
                  <div className="text-[8px] font-bold text-white uppercase leading-none">ISO 9001 TUV SUD</div>
               </div>
               <Award className="w-5 h-5 text-amber-500" />
            </div>
            
            <div className="h-10 w-px bg-emerald-700/50 mx-2" />
            
            <div className="flex items-center gap-3">
               <div className="text-right hidden sm:block">
                  <div className="text-[10px] font-black leading-tight">{user.displayName}</div>
                  <div className="text-[8px] text-emerald-300 font-bold uppercase tracking-wider">{user.email}</div>
               </div>
               <div className="flex gap-1">
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="h-9 w-9 bg-emerald-800/50 hover:bg-emerald-700 text-emerald-100 rounded-lg"
                   onClick={logout}
                   title="Logout"
                 >
                    <LogOut className="w-4 h-4" />
                 </Button>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main UI */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-emerald-950/5 p-1 rounded-xl border border-emerald-950/10 print:hidden shadow-sm inline-block">
            <TabsList className="bg-transparent h-auto p-0 flex gap-1">
              <TabsTrigger 
                value="details" 
                className="data-[state=active]:bg-emerald-900 data-[state=active]:text-white h-10 px-4 gap-2 font-bold text-xs transition-all"
              >
                <FileText className="w-4 h-4" /> Details
              </TabsTrigger>
              <TabsTrigger 
                value="items" 
                className="data-[state=active]:bg-emerald-900 data-[state=active]:text-white h-10 px-4 gap-2 font-bold text-xs transition-all"
              >
                <Boxes className="w-4 h-4" /> Products
              </TabsTrigger>
              <TabsTrigger 
                value="sign" 
                className="data-[state=active]:bg-emerald-900 data-[state=active]:text-white h-10 px-4 gap-2 font-bold text-xs transition-all"
              >
                <Signature className="w-4 h-4" /> Sign & Stamp
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                className="data-[state=active]:bg-emerald-900 data-[state=active]:text-white h-10 px-4 gap-2 font-bold text-xs transition-all"
              >
                <Eye className="w-4 h-4" /> Preview
              </TabsTrigger>
              <div className="w-px h-6 bg-slate-200 self-center mx-1" />
              <TabsTrigger 
                value="register" 
                className="data-[state=active]:bg-emerald-900 data-[state=active]:text-white h-10 px-4 gap-2 font-bold text-xs transition-all"
              >
                <Archive className="w-4 h-4" /> Register
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:bg-emerald-900 data-[state=active]:text-white h-10 px-4 gap-2 font-bold text-xs transition-all"
              >
                <BarChart4 className="w-4 h-4" /> Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="details">
            <QuoteDetails quote={quote} updateQuote={updateQuote} resetForm={resetForm} />
          </TabsContent>
          <TabsContent value="items">
            <QuoteItems 
              quote={quote} 
              updateQuote={updateQuote} 
              addItem={addItem} 
              updateItem={updateItem} 
              removeItem={removeItem} 
              totals={totals}
              onNext={() => setActiveTab('sign')}
              onBack={() => setActiveTab('details')}
            />
          </TabsContent>
          <TabsContent value="sign">
            <SignStamp 
              quote={quote} 
              updateQuote={updateQuote} 
              onNext={() => setActiveTab('preview')} 
              onBack={() => setActiveTab('items')} 
            />
          </TabsContent>
          <TabsContent value="preview">
            <QuotePreview 
              quote={quote} 
              totals={totals} 
              onBack={() => setActiveTab('sign')}
              onNew={() => {
                resetForm();
                setActiveTab('details');
              }}
            />
          </TabsContent>
          <TabsContent value="register">
            <QuoteRegister />
          </TabsContent>
          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>
        </Tabs>
      </main>

      <Toaster position="top-right" closeButton richColors />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
