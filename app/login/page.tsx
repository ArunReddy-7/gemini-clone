'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

const LoginSchema = z.object({
  dialCode: z.string().min(1, 'Select country code'),
  phone: z.string().min(10, 'Enter valid phone number'),
});

type LoginForm = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [dialCodes, setDialCodes] = useState<[string, string][]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
  });

  // ✅ Correct fetch using callingCodes from v2 API
  useEffect(() => {
    const fetchDialCodes = async () => {
      try {
        const res = await fetch('https://restcountries.com/v2/all?fields=name,callingCodes');
        if (!res.ok) throw new Error('Failed to fetch country codes');
        const data = await res.json();

        const codes = data
          .flatMap((country: any) =>
            (country.callingCodes || []).map((code: string) => ({
              code: `+${code.replace(/\s/g, '')}`,
              name: country.name,
            }))
          )
          .filter(entry => entry.code && entry.code !== '+');

        const uniqueMap = new Map<string, string>();
        codes.forEach(({ code, name }) => {
          if (!uniqueMap.has(code)) {
            uniqueMap.set(code, name);
          }
        });

        const unique = Array.from(uniqueMap.entries()).sort(([a], [b]) => a.localeCompare(b));
        setDialCodes(unique);
      } catch (err) {
        console.error('Error fetching dial codes:', err);
        setDialCodes([
          ['+91', 'India'],
          ['+1', 'United States'],
        ]); // fallback values
      }
    };

    fetchDialCodes();
  }, []);

  const onSubmit = (data: LoginForm) => {
    setLoading(true);
    setTimeout(() => {
      // Simulate OTP validation success
      localStorage.setItem('auth', JSON.stringify(data));
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Login with OTP</h1>

        {/* Country code */}
        <div>
          <label className="block mb-1">Country Code</label>
          <select {...register('dialCode')} className="w-full border rounded px-3 py-2">
            <option value="">Select</option>
            {dialCodes.map(([code, country]) => (
              <option key={code} value={code}>
                {country} ({code})
              </option>
            ))}
          </select>
          {errors.dialCode && (
            <p className="text-red-500 text-sm mt-1">{errors.dialCode.message}</p>
          )}
        </div>

        {/* Phone number */}
        <div>
          <label className="block mb-1">Phone Number</label>
          <input
            {...register('phone')}
            type="tel"
            className="w-full border rounded px-3 py-2"
            placeholder="Enter phone number"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </button>
      </form>
    </div>
  );
}
