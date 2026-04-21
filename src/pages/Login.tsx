// src/pages/Login.tsx
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useForm } from '../hooks/useForm';
import { useAuth } from '../hooks/useAuth';

interface LoginValues extends Record<string, string> {
  username: string;
  password: string;
}

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm<LoginValues>({
    initialValues: { username: '', password: '' },
    validate: (vals) => {
      const errs: Record<string, string> = {};
      if (!vals.username) errs.username = 'El usuario es requerido';
      if (!vals.password) errs.password = 'La contraseña es requerida';
      return errs;
    },
    onSubmit: (vals) => {
      login({ id: 1, username: vals.username, email: `${vals.username}@tienda.cl` });
      navigate('/');
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Iniciar sesión</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Usuario"
            name="username"
            value={values.username}
            onChange={handleChange}
            error={errors.username}
            autoComplete="username"
          />
          <Input
            label="Contraseña"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="current-password"
          />
          <Button label={isSubmitting ? 'Ingresando...' : 'Ingresar'} type="submit" className="w-full" />
        </form>
      </div>
    </div>
  );
}
