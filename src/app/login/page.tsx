'use client';

import { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      router.push('/chat');
    },
    onError: (error: { message: string }) => {
      setError('Login failed. Please try again.');
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      setIsRegistering(false);
      setError('');
      alert('Registration successful! Please log in.');
    },
    onError: (error: { message: string }) => {
      setError(error.message || 'Registration failed. Please try again.');
    },
  });

  const isSubmitting = loginMutation.isPending || registerMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // guard double submit
    setError('');
    if (isRegistering) {
      registerMutation.mutate({ email, password, name });
    } else {
      loginMutation.mutate({ email, password });
    }
  };

  const toggleMode = () => {
    if (isSubmitting) return; // prevent toggle while in-flight
    setError('');
    setIsRegistering((v) => !v);
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{isRegistering ? 'Register' : 'Login'}</CardTitle>
          <CardDescription>
            {isRegistering ? 'Create an account to get started.' : 'Enter your credentials to access your account.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              {isRegistering && (
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              )}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Error message area */}
              {error && (
                <p className="text-red-500 text-sm" role="alert" aria-live="polite">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {isRegistering ? 'Registering...' : 'Logging in...'}
                  </span>
                ) : (
                  isRegistering ? 'Register' : 'Login'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={toggleMode} disabled={isSubmitting}>
            {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
