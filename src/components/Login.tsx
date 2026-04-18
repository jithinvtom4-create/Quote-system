import React, { useState } from 'react';
import { FlaskConical, LogIn, ShieldCheck, Lock, Mail, Eye, EyeOff, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both Email and Password');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Successfully logged in');
    } catch (error: any) {
      console.error('Login error:', error);
      const msg = error.message === 'Invalid credentials' 
        ? 'Invalid ID or Password. Please check the credentials provided below.' 
        : `System Error: ${error.message}`;
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-950 p-4">
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-amber-500 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-sm bg-white/95 backdrop-blur shadow-2xl border-emerald-900/10 overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="h-2 bg-gradient-to-r from-emerald-900 to-amber-500" />
        <CardHeader className="text-center pt-8">
          <div className="mx-auto bg-emerald-100 p-4 rounded-2xl w-fit mb-4">
            <FlaskConical className="w-10 h-10 text-emerald-900" />
          </div>
          <CardTitle className="text-2xl font-black text-emerald-950 tracking-tight">
            AL ERADAH CHEMICAL
          </CardTitle>
          <CardDescription className="font-bold text-[10px] uppercase tracking-[0.2em] text-emerald-600">
            Secure Corporate Portal
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8 pt-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">User Email ID</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  type="email" 
                  placeholder="admin@aleradah.bh" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-10 text-sm bg-slate-50 border-slate-200 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">Security Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-10 text-sm bg-slate-50 border-slate-200 focus:bg-white transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-emerald-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 space-y-1">
               <div className="flex items-center gap-2 text-[10px] font-black text-amber-700">
                  <Info className="w-3 h-3" /> CREDENTIAL REMINDER
               </div>
               <div className="text-[9px] text-amber-600 font-medium leading-tight">
                  Email: <span className="font-bold select-all">admin@aleradah.bh</span><br />
                  Pass: <span className="font-bold select-all">aec-secure-2026</span>
               </div>
            </div>
            
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-emerald-900 hover:bg-emerald-800 text-white font-black rounded-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
            >
              {isSubmitting ? 'Authenticating...' : (
                <>
                  <LogIn className="w-4 h-4" /> SECURE LOGIN
                </>
              )}
            </Button>
          </form>

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase pt-8 border-t mt-8">
            <ShieldCheck className="w-3.5 h-3.5" /> SECURED AEC-CORPORATE PORTAL
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
