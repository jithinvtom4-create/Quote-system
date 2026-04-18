import { FlaskConical, LogIn, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function Login() {
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login();
      toast.success('Successfully logged in');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to log in. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-950 p-4">
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-amber-500 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-md bg-white/95 backdrop-blur shadow-2xl border-emerald-900/10 overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="h-2 bg-gradient-to-r from-emerald-900 to-amber-500" />
        <CardHeader className="text-center pt-8">
          <div className="mx-auto bg-emerald-100 p-4 rounded-2xl w-fit mb-4">
            <FlaskConical className="w-10 h-10 text-emerald-900" />
          </div>
          <CardTitle className="text-2xl font-black text-emerald-950 tracking-tight">
            AL ERADAH CHEMICAL
          </CardTitle>
          <CardDescription className="font-bold text-xs uppercase tracking-[0.2em] text-emerald-600">
            Quote Management System
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-4 space-y-6">
          <p className="text-center text-slate-500 text-sm italic">
            Please sign in with your corporate Google account to access the secure internal portal.
          </p>
          
          <Button 
            onClick={handleLogin}
            className="w-full h-12 bg-emerald-900 hover:bg-emerald-800 text-white font-black rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <LogIn className="w-5 h-5" /> Sign in with Google
          </Button>

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase pt-4 border-t">
            <ShieldCheck className="w-3.5 h-3.5" /> Secure Authentication Powered by Firebase
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
