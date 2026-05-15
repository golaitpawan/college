'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '@/hooks/useAuth';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password too short'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const login = useLogin();

  const onSubmit = (data: FormData) => login.mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 to-primary-700">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <span className="text-3xl">🎓</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">College App</h1>
            <p className="text-gray-500 mt-1 text-sm">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                className="input"
                placeholder="you@demo.edu"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                {...register('password')}
                type="password"
                className="input"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {login.error && (
              <p className="text-red-600 text-sm bg-red-50 rounded-md px-3 py-2">
                Invalid email or password
              </p>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="btn-primary w-full justify-center py-2.5"
            >
              {login.isPending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center font-medium mb-3">Demo accounts</p>
            <div className="space-y-1 text-xs text-gray-500">
              <p><span className="font-mono bg-gray-100 px-1 rounded">admin@demo.edu</span> / Admin@123</p>
              <p><span className="font-mono bg-gray-100 px-1 rounded">head.cse@demo.edu</span> / Head@123</p>
              <p><span className="font-mono bg-gray-100 px-1 rounded">prof.smith@demo.edu</span> / Teacher@123</p>
              <p><span className="font-mono bg-gray-100 px-1 rounded">alice@demo.edu</span> / Student@123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
